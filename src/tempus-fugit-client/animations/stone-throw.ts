import type { CardAnimation } from "./card-animation-registry";

export const stoneThrow: CardAnimation = (scene, targets, impact, _card, caster) => {
    const windupMs = 60;
    const impactMs = 280;
    const durationMs = 400;
    const source = caster ?? scene.playerGUI.getCenter(undefined, true);
    const receivers = targets.filter(target => !target.sprite || target.sprite.scene);
    const sprite = caster?.sprite;
    const actor = sprite?.scene ? {sprite, scene: sprite.scene, angle: sprite.angle} : undefined;
    const direction = receivers.length ? Math.sign(receivers[0].x - source.x) : -1;
    const stones = scene.add.graphics().setDepth(150);
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
        stones.destroy();
        if (actor && actor.sprite.scene === actor.scene) actor.sprite.angle = actor.angle;
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
                throw new Error("Missing stone throw animation clock value");
            }
            const progress = Math.max(0, Math.min(1, (elapsed - windupMs) / (impactMs - windupMs)));
            if (actor && actor.sprite.scene === actor.scene) {
                actor.sprite.angle = actor.angle + direction * 8 * Math.sin(Math.PI * Math.min(1, elapsed / impactMs));
            }
            stones.clear();
            receivers.forEach(target => {
                if (elapsed < impactMs) {
                    const startX = source.x + direction * 24;
                    const startY = source.y - 44;
                    const x = startX + (target.x - startX) * progress;
                    const y = startY + (target.y - startY) * progress - 384 * progress * (1 - progress);
                    const angle = progress * Math.PI * 1.5;
                    stones.fillStyle(0x51535b, 1);
                    stones.fillPoints([
                        [-12, -20], [8, -20], [20, -8], [20, 12],
                        [8, 20], [-12, 20], [-20, 8], [-20, -8],
                    ].map(([dx, dy]) => ({
                        x: Math.round(x + dx * Math.cos(angle) - dy * Math.sin(angle)),
                        y: Math.round(y + dx * Math.sin(angle) + dy * Math.cos(angle)),
                    })), true);
                    stones.fillStyle(0xa6a7ab, 1);
                    stones.fillRect(Math.round(x - 9), Math.round(y - 12), 12, 8);
                    stones.fillStyle(0x777b83, 1);
                    stones.fillRect(Math.round(x + 2), Math.round(y + 3), 9, 8);
                } else {
                    const burst = Math.min(1, (elapsed - impactMs) / (durationMs - impactMs));
                    for (let i = 0; i < 8; i++) {
                        const angle = i * Math.PI / 4;
                        const x = target.x + Math.cos(angle) * (12 + 48 * burst);
                        const y = target.y + Math.sin(angle) * (12 + 36 * burst) + 32 * burst * burst;
                        stones.fillStyle(i % 2 ? 0x51535b : 0xa6a7ab, 1 - burst);
                        stones.fillRect(Math.round(x), Math.round(y), 7, 7);
                    }
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
