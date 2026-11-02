import type { CardAnimation } from "./card-animation-registry";

function aura(positive: boolean): CardAnimation {
    return (scene, targets, impact) => {
        const impactMs = 160;
        const holdEndMs = 240;
        const durationMs = 460;
        const actors = targets.map(target => {
            const sprite = target.sprite;
            if (!sprite) throw new Error("Aura animation requires a character sprite");
            if (!sprite.scene) return null;
            const bounds = sprite.getBounds();
            return {
                target, sprite, scene: sprite.scene,
                x: sprite.x, y: sprite.y, scaleX: sprite.scaleX, scaleY: sprite.scaleY,
                foot: sprite.getBottomCenter(),
                width: Math.max(90, bounds.width * 0.85),
                topY: Math.max(scene.cameras.main.height * 0.245, bounds.top - 180),
            };
        }).filter(actor => actor !== null);
        const rays = scene.add.graphics().setDepth(150)
            .setBlendMode(positive ? Phaser.BlendModes.ADD : Phaser.BlendModes.NORMAL);
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
            actors.forEach(actor => {
                if (actor.sprite.scene !== actor.scene) return;
                actor.sprite.setPosition(actor.x, actor.y).setScale(actor.scaleX, actor.scaleY);
            });
        };

        return scene.tweens.addCounter({
            from: 0,
            to: durationMs,
            duration: durationMs,
            ease: "Linear",
            onUpdate: tween => {
                const elapsed = tween.getValue();
                const rise = 1 - Math.pow(1 - Math.min(1, elapsed / impactMs), 3);
                const fall = Math.pow(Math.max(0, Math.min(1, (elapsed - holdEndMs) / (durationMs - holdEndMs))), 2);
                const intensity = rise * (1 - fall);
                rays.clear();
                actors.forEach(actor => {
                    const {sprite, target, width, topY} = actor;
                    if (sprite.scene !== actor.scene) return;
                    sprite.setPosition(actor.x, actor.y);
                    if (positive) {
                        sprite.y -= 32 * intensity;
                    } else {
                        sprite.setScale(actor.scaleX * (1 + 0.12 * intensity), actor.scaleY * (1 - 0.22 * intensity));
                        // Anchor compression in the sprite's parent space so its feet and the stat labels stay put.
                        const foot = sprite.getBottomCenter();
                        sprite.x += actor.foot.x - foot.x;
                        sprite.y += actor.foot.y - foot.y;
                    }

                    const topX = target.x + (positive ? (target.groundY - topY) * 0.28 : 0);
                    const color = positive ? 0xffedb5 : 0x160c29;
                    for (const layer of [1, 0.7, 0.35]) {
                        const topWidth = width * layer * (positive ? 0.16 : 0.7);
                        const bottomWidth = width * layer;
                        rays.fillStyle(color, intensity * (positive ? 0.09 : 0.16));
                        rays.fillPoints([
                            {x: topX - topWidth / 2, y: topY},
                            {x: topX + topWidth / 2, y: topY},
                            {x: target.x + bottomWidth / 2, y: target.groundY},
                            {x: target.x - bottomWidth / 2, y: target.groundY},
                        ], true);
                    }
                    if (positive) {
                        for (const offset of [-0.32, 0, 0.32]) {
                            rays.fillStyle(0xfff8de, 0.18 * intensity);
                            rays.fillPoints([
                                {x: topX + width * (offset - 0.05) * 0.16, y: topY},
                                {x: topX + width * (offset + 0.05) * 0.16, y: topY},
                                {x: target.x + width * (offset + 0.05), y: target.groundY},
                                {x: target.x + width * (offset - 0.05), y: target.groundY},
                            ], true);
                        }
                    } else {
                        const pressureY = topY + (target.groundY - topY) * Math.min(1, elapsed / impactMs);
                        rays.fillStyle(0x160c29, 0.3 * intensity);
                        rays.fillRect(target.x - width * 0.55, pressureY - 12, width * 1.1, 12);
                    }
                    rays.fillStyle(color, (positive ? 0.12 : 0.25) * intensity);
                    rays.fillEllipse(target.x, target.groundY, width * 1.2, 18);
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

export const positiveAura = aura(true);
export const negativeAura = aura(false);
