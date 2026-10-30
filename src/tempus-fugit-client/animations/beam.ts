import type { CardAnimation } from "./card-animation-registry";

function beam(light: boolean): CardAnimation {
    return (scene, targets, impact, card) => {
        const impactMs = 160;
        const holdEndMs = 220;
        const durationMs = 340;
        if (light && !card?.stand()) throw new Error("Light beam animation requires a stand card");
        const stand = light && card ? scene.standGUI.beginEffect(card) : undefined;
        const source = stand ? stand.sprite : scene.playerGUI;
        const receivers = targets.filter(target => !target.sprite || target.sprite.scene);
        const rays = scene.add.graphics().setDepth(150)
            .setBlendMode(light ? Phaser.BlendModes.ADD : Phaser.BlendModes.NORMAL);
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
            rays.destroy();
            stand?.restore();
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
                    throw new Error("Missing beam animation clock value");
                }
                const progress = Math.max(0, Math.min(1, elapsed / impactMs));
                const alpha = 1 - Math.max(0, Math.min(1, (elapsed - holdEndMs) / (durationMs - holdEndMs)));
                const origin = source.getCenter(undefined, true);
                rays.clear();
                receivers.forEach(target => {
                    const x = origin.x + (target.x - origin.x) * progress;
                    const y = origin.y + (target.y - origin.y) * progress;
                    const colors = light ? [0xffce68, 0xffecb0, 0xffffed] : [0x40225b, 0x12091e, 0xa579bb];
                    [34, 20, 7].forEach((width, layer) => {
                        rays.lineStyle(width, colors[layer], alpha * [0.25, 0.7, 0.9][layer]);
                        rays.lineBetween(origin.x, origin.y, x, y);
                    });
                    if (elapsed >= impactMs) {
                        rays.fillStyle(colors[0], 0.3 * alpha);
                        rays.fillCircle(target.x, target.y, 26 * alpha);
                    }
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
}

export const lightBeam = beam(true);
export const darkBeam = beam(false);
