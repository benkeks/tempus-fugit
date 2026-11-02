import type { CardAnimation } from "./card-animation-registry";

export const slash: CardAnimation = (scene, targets, impact, _card, caster) => {
    const impactMs = 140;
    const durationMs = 280;
    const slashScale = 1.2;
    const receivers = targets.filter(target => !target.sprite || target.sprite.scene);
    const sprite = caster?.sprite;
    const actor = sprite?.scene ? {sprite, scene: sprite.scene, x: sprite.x} : undefined;
    const direction = caster && receivers.length ? Math.sign(receivers[0].x - caster.x) : -1;
    const blade = scene.add.graphics().setDepth(150);
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
        blade.destroy();
        if (actor && actor.sprite.scene === actor.scene) actor.sprite.x = actor.x;
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
                throw new Error("Missing slash animation clock value");
            }
            const progress = Math.max(0, Math.min(1, (elapsed - 40) / (impactMs - 40)));
            const alpha = 1 - Math.max(0, Math.min(1, (elapsed - impactMs) / (durationMs - impactMs)));
            if (actor && actor.sprite.scene === actor.scene) {
                actor.sprite.x = actor.x + direction * 28 * Math.sin(Math.PI * Math.min(1, elapsed / durationMs));
            }
            blade.clear();
            if (progress > 0) receivers.forEach(target => {
                const startX = target.x - 55 * slashScale;
                const startY = target.y - 70 * slashScale;
                const endX = startX + 110 * slashScale * progress;
                const endY = startY + 140 * slashScale * progress;
                [22, 12, 4].forEach((width, layer) => {
                    const halfWidth = width * slashScale / 2;
                    blade.fillStyle([0xe86a50, 0xffdba8, 0xffffe8][layer], 0.9 * alpha);
                    blade.fillPoints([
                        {x: startX, y: startY},
                        {x: (startX + endX) / 2 - halfWidth, y: (startY + endY) / 2 + halfWidth},
                        {x: endX, y: endY},
                        {x: (startX + endX) / 2 + halfWidth, y: (startY + endY) / 2 - halfWidth},
                    ], true);
                });
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
