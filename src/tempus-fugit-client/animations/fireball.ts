import type { CardAnimation } from "./card-animation-registry";

export const fireball: CardAnimation = (scene, targets, impact) => {
    const flightMs = 250;
    const durationMs = 320;
    const origin = scene.playerGUI.getCenter(undefined, true);
    const projectiles = targets.filter(target => !target.sprite || target.sprite.scene).map(target => {
        const sprite = scene.add.image(Math.round(origin.x), Math.round(origin.y), "fireball")
            .setOrigin(23 / 32, 8 / 32)
            .setScale(4)
            .setDepth(150);
        sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        // The card art points up-right; rotate its flame head to face the target.
        sprite.setRotation(Math.atan2(target.y - origin.y, target.x - origin.x) + Math.PI / 4);
        return {sprite, target};
    });
    let impacted = false;
    let cleaned = false;
    const hit = () => {
        if (impacted) return;
        impacted = true;
        impact();
    };
    const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        projectiles.forEach(({sprite}) => sprite.destroy());
    };

    return scene.tweens.addCounter({
        from: 0,
        to: durationMs,
        duration: durationMs,
        ease: "Linear",
        onUpdate: tween => {
            const elapsed = tween.getValue();
            if (elapsed === null) {
                cleanup();
                throw new Error("Missing Fireball animation clock value");
            }
            const progress = Math.max(0, Math.min(1, elapsed / flightMs));
            const fade = Math.max(0, Math.min(1, (elapsed - flightMs) / (durationMs - flightMs)));
            projectiles.forEach(({sprite, target}) => {
                sprite.x = Math.round(origin.x + (target.x - origin.x) * progress);
                sprite.y = Math.round(origin.y + (target.y - origin.y) * progress);
                sprite.alpha = 1 - fade;
            });
            if (elapsed >= flightMs) hit();
        },
        onComplete: () => {
            hit();
            cleanup();
        },
        onStop: cleanup,
    });
};
