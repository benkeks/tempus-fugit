import type { CardAnimation } from "./card-animation-registry";

const fireballs = (surround: boolean): CardAnimation => (scene, targets, impact, _card, caster) => {
    const flightMs = 250;
    const durationMs = 320;
    const source = surround ? undefined : caster ?? scene.playerGUI.getCenter(undefined, true);
    const projectiles = targets.filter(target => !target.sprite || target.sprite.scene).flatMap(target => {
        const origins = source ? [source] : Array.from({length: 5}, (_, i) => {
            const angle = -Math.PI / 2 + i * Math.PI * 2 / 5;
            return {
                x: Math.max(64, Math.min(scene.cameras.main.width - 64, target.x + Math.cos(angle) * 200)),
                y: Math.min(scene.cameras.main.height * 0.7 - 100, target.y + Math.sin(angle) * 200),
            };
        });
        return origins.map(origin => {
            const sprite = scene.add.image(Math.round(origin.x), Math.round(origin.y), "fireball")
                .setOrigin(23 / 32, 8 / 32)
                .setScale(surround ? 3 : 4)
                .setDepth(150);
            sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
            // The card art points up-right; rotate its flame head to face the target.
            sprite.setRotation(Math.atan2(target.y - origin.y, target.x - origin.x) + Math.PI / 4);
            return {sprite, target, origin};
        });
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
            projectiles.forEach(({sprite, target, origin}) => {
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

export const fireball = fireballs(false);
export const incinerate = fireballs(true);
