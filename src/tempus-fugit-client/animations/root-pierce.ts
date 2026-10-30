import type { CardAnimation } from "./card-animation-registry";

export const rootPierce: CardAnimation = (scene, targets, impact) => {
    const impactMs = 120;
    const retractStartMs = 180;
    const durationMs = 300;
    const roots = targets.map(target => {
        const sprite = scene.add.image(Math.round(target.x), Math.round(target.groundY) + 96, "tree")
            .setOrigin(26 / 32, 2 / 32)
            .setScale(6)
            .setDepth(150);
        sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        sprite.setCrop(0, 0, sprite.width, 0);
        return {sprite, target};
    });
    const cleanup = () => roots.forEach(({sprite}) => sprite.destroy());
    let impacted = false;
    const hit = () => {
        if (impacted) return;
        impacted = true;
        impact();
    };

    return scene.tweens.addCounter({
        from: 0,
        to: durationMs,
        duration: durationMs,
        ease: "Linear",
        onUpdate: tween => {
            const elapsed = tween.getValue();
            const rise = 1 - Math.pow(1 - Math.min(1, elapsed / impactMs), 3);
            const retract = Math.pow(Math.max(0, Math.min(1, (elapsed - retractStartMs) / (durationMs - retractStartMs))), 2);
            roots.forEach(({sprite, target}) => {
                const startY = target.groundY + 96;
                sprite.y = Math.round(startY + (target.y - startY) * rise + (startY - target.y) * retract);
                // Hide the part below the enemy's feet so roots emerge from the ground, not over the battle UI.
                const top = sprite.y - sprite.displayOriginY * sprite.scaleY;
                const cropHeight = Math.max(0, Math.min(sprite.height, Math.floor((target.groundY - top) / sprite.scaleY)));
                sprite.setCrop(0, 0, sprite.width, cropHeight);
            });
            if (elapsed >= impactMs) hit();
        },
        onComplete: () => {
            hit();
            cleanup();
        },
        onStop: cleanup,
    });
};
