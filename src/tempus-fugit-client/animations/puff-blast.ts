import type { CardAnimation } from "./card-animation-registry";

export const puffBlast: CardAnimation = (scene, targets, impact, _card, caster) => {
    const flightMs = 200;
    const durationMs = 360;
    const source = caster ?? scene.playerGUI.getCenter(undefined, true);
    const receivers = targets.filter(target => !target.sprite || target.sprite.scene);
    const sprite = caster?.sprite;
    const actor = sprite?.scene ? {
        sprite, scene: sprite.scene, x: sprite.x, y: sprite.y,
        scaleX: sprite.scaleX, scaleY: sprite.scaleY, foot: sprite.getBottomCenter(),
    } : undefined;
    const gusts = scene.add.graphics().setDepth(150);
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
        gusts.destroy();
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
                throw new Error("Missing puff blast animation clock value");
            }
            const squash = Math.sin(Math.PI * Math.min(1, elapsed / 160));
            if (actor && actor.sprite.scene === actor.scene) {
                const {sprite} = actor;
                sprite.setPosition(actor.x, actor.y).setScale(actor.scaleX * (1 + 0.12 * squash), actor.scaleY * (1 - 0.12 * squash));
                const foot = sprite.getBottomCenter();
                sprite.x += actor.foot.x - foot.x;
                sprite.y += actor.foot.y - foot.y;
            }
            gusts.clear();
            receivers.forEach(target => {
                for (let i = 0; i < 3; i++) {
                    const age = elapsed - i * 22;
                    if (age < 0 || age >= flightMs + 90) continue;
                    const progress = Math.min(1, age / flightMs);
                    const fade = 1 - Math.max(0, (age - flightMs) / 90);
                    const x = Math.round(source.x + (target.x - source.x) * progress);
                    const y = Math.round(source.y + (target.y - source.y) * progress);
                    const width = 24 + 36 * progress;
                    const height = 64 + 48 * progress;
                    gusts.lineStyle(7, 0x97bfd3, 0.45 * fade);
                    gusts.strokeEllipse(x, y, width, height);
                    gusts.lineStyle(3, 0xf0ffff, 0.9 * fade);
                    gusts.strokeEllipse(x, y, width - 4, height - 4);
                }
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
