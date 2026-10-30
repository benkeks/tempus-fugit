import type { CardAnimation } from "./card-animation-registry";

export const needleVolley: CardAnimation = (scene, targets, impact, _card, caster) => {
    const flightMs = 180;
    const durationMs = 320;
    const source = caster ?? scene.playerGUI.getCenter(undefined, true);
    const receivers = targets.filter(target => !target.sprite || target.sprite.scene);
    const needles = scene.add.graphics().setDepth(150);
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
        needles.destroy();
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
                throw new Error("Missing needle volley animation clock value");
            }
            needles.clear();
            receivers.forEach(target => {
                for (let i = 0; i < 5; i++) {
                    const age = elapsed - i * 14;
                    if (age < 0 || age >= flightMs + 60) continue;
                    const progress = Math.min(1, age / flightMs);
                    const alpha = 1 - Math.max(0, (age - flightMs) / 60);
                    const startY = source.y + (i - 2) * 5;
                    const dx = target.x - source.x;
                    const dy = target.y + (i - 2) * 14 - startY;
                    const angle = Math.atan2(dy, dx);
                    const x = source.x + dx * progress;
                    const y = startY + dy * progress;
                    [0x354f2e, 0xf6e6af].forEach((color, layer) => {
                        const length = layer === 0 ? 38 : 32;
                        const width = layer === 0 ? 5 : 2;
                        const backX = x - Math.cos(angle) * length;
                        const backY = y - Math.sin(angle) * length;
                        const sideX = -Math.sin(angle) * width;
                        const sideY = Math.cos(angle) * width;
                        needles.fillStyle(color, alpha);
                        needles.fillPoints([
                            {x, y},
                            {x: backX + sideX, y: backY + sideY},
                            {x: backX - sideX, y: backY - sideY},
                        ].map(point => ({x: Math.round(point.x), y: Math.round(point.y)})), true);
                    });
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
