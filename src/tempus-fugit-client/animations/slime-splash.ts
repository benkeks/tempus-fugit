import type { CardAnimation } from "./card-animation-registry";

export const slimeSplash: CardAnimation = (scene, targets, impact, _card, caster) => {
    const windupMs = 70;
    const impactMs = 230;
    const returnMs = 260;
    const durationMs = 420;
    const receivers = targets.filter(target => !target.sprite || target.sprite.scene);
    const sprite = caster?.sprite;
    const actor = sprite?.scene && receivers.length ? (() => {
        const target = receivers[0];
        const foot = sprite.getBottomCenter();
        // Move only the character, in its parent's coordinates, leaving the enemy's stats in place.
        const destination = sprite.parentContainer
            ? sprite.parentContainer.getWorldTransformMatrix().applyInverse(target.x, target.groundY)
            : {x: target.x, y: target.groundY};
        return {
            sprite, scene: sprite.scene, x: sprite.x, y: sprite.y,
            scaleX: sprite.scaleX, scaleY: sprite.scaleY, foot,
            dx: destination.x - foot.x, dy: destination.y - foot.y,
        };
    })() : undefined;
    const splash = scene.add.graphics().setDepth(150);
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
        splash.destroy();
        if (actor && actor.sprite.scene === actor.scene) {
            actor.sprite.setPosition(actor.x, actor.y).setScale(actor.scaleX, actor.scaleY);
        }
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
                throw new Error("Missing slime splash animation clock value");
            }
            const outward = Math.max(0, Math.min(1, (elapsed - windupMs) / (impactMs - windupMs)));
            const homeward = Math.max(0, Math.min(1, (elapsed - returnMs) / (durationMs - returnMs)));
            const travel = outward * (1 - homeward);
            const hop = elapsed < impactMs ? 80 * Math.sin(Math.PI * outward) : 60 * Math.sin(Math.PI * homeward);
            const squash = elapsed <= windupMs ? Math.sin(Math.PI / 2 * elapsed / windupMs)
                : elapsed < windupMs + 30 ? 1 - (elapsed - windupMs) / 30
                : elapsed >= impactMs && elapsed < returnMs ? 0.45 * Math.sin(Math.PI * (elapsed - impactMs) / (returnMs - impactMs)) : 0;
            if (actor && actor.sprite.scene === actor.scene) {
                const {sprite} = actor;
                sprite.setPosition(actor.x, actor.y).setScale(actor.scaleX * (1 + 0.25 * squash), actor.scaleY * (1 - 0.25 * squash));
                const foot = sprite.getBottomCenter();
                sprite.x += actor.foot.x - foot.x + actor.dx * travel;
                sprite.y += actor.foot.y - foot.y + actor.dy * travel - hop;
            }
            splash.clear();
            if (elapsed >= impactMs) {
                const spread = Math.max(0, Math.min(1, (elapsed - impactMs) / (durationMs - impactMs)));
                receivers.forEach(target => {
                    splash.fillStyle(0xc35862, 0.45 * (1 - spread));
                    splash.fillEllipse(target.x, target.groundY - 2, 54 + 90 * spread, 12);
                    for (let i = 0; i < 10; i++) {
                        const angle = Math.PI + (i + 0.5) * Math.PI / 10;
                        const x = target.x + Math.cos(angle) * (18 + 85 * spread);
                        const y = target.groundY - 8 + Math.sin(angle) * (18 + 85 * spread) + 40 * spread * spread;
                        const size = Math.max(2, Math.round(9 * (1 - spread)));
                        splash.fillStyle(i % 2 ? 0xe991a0 : 0xb34557, 0.95 * (1 - spread));
                        splash.fillRect(Math.round(x), Math.round(y), size, size);
                    }
                });
                hit();
            }
        },
        onComplete: () => {
            hit();
            cleanup();
        },
        onStop: cleanup,
    });
};
