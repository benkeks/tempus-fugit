import type { CardAnimation } from "./card-animation-registry";

export const groundImpact: CardAnimation = (scene, targets, impact, _card, caster) => {
    const impactMs = 160;
    const durationMs = 360;
    const receivers = targets.filter(target => !target.sprite || target.sprite.scene);
    const sprite = caster?.sprite;
    const actor = sprite?.scene ? {sprite, scene: sprite.scene, y: sprite.y} : undefined;
    const earth = scene.add.graphics().setDepth(150);
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
        earth.destroy();
        if (actor && actor.sprite.scene === actor.scene) actor.sprite.y = actor.y;
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
                throw new Error("Missing ground impact animation clock value");
            }
            const windup = Math.min(1, elapsed / impactMs);
            const burst = Math.max(0, Math.min(1, (elapsed - impactMs) / (durationMs - impactMs)));
            if (actor && actor.sprite.scene === actor.scene) {
                actor.sprite.y = actor.y - 14 * Math.sin(Math.PI * windup);
            }
            earth.clear();
            receivers.forEach(target => {
                earth.fillStyle(0x513a2b, 0.3 * windup * (1 - burst));
                earth.fillEllipse(target.x, target.groundY - 2, 72 * windup, 12);
                earth.lineStyle(3, 0x795b42, 0.8 * windup * (1 - burst));
                for (const direction of [-1, 1]) {
                    earth.lineBetween(target.x, target.groundY - 2,
                        target.x + direction * 24 * windup, target.groundY - 10);
                    earth.lineBetween(target.x + direction * 24 * windup, target.groundY - 10,
                        target.x + direction * 46 * windup, target.groundY - 4);
                }
                if (elapsed < impactMs) return;
                earth.lineStyle(5 * (1 - burst), 0xe5c997, 0.8 * (1 - burst));
                earth.strokeEllipse(target.x, target.groundY - 4, 56 + 180 * burst, 14 + 40 * burst);
                for (let i = 0; i < 12; i++) {
                    const angle = Math.PI + (i + 0.5) * Math.PI / 12;
                    const x = target.x + Math.cos(angle) * (24 + (70 + i % 3 * 12) * burst);
                    const y = target.groundY - 4 + Math.sin(angle) * (24 + 90 * burst) + 38 * burst * burst;
                    const size = Math.max(2, Math.round(7 * (1 - burst) + i % 2 * 2));
                    earth.fillStyle(i % 2 ? 0x99734f : 0xd3b789, 0.9 * (1 - burst));
                    earth.fillRect(Math.round(x), Math.round(y), size, size);
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
