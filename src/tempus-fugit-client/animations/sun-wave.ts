import type { CardAnimation } from "./card-animation-registry";

export const sunWave: CardAnimation = (scene, targets, impact) => {
    const durationMs = 400;
    const receivers = targets.map((target, index) => ({...target, index: target.index ?? index}))
        .filter(target => !target.sprite || target.sprite.scene);
    const startX = receivers.length ? Math.min(...receivers.map(target => target.x)) - 140 : 0;
    const endX = receivers.length ? Math.max(...receivers.map(target => target.x)) + 140 : startX;
    const topY = receivers.length
        ? Math.max(scene.cameras.main.height * 0.245, Math.min(...receivers.map(target => target.y - 140)))
        : 0;
    const bottomY = receivers.length ? Math.max(...receivers.map(target => target.groundY)) + 12 : topY;
    const wave = scene.add.graphics().setDepth(150).setBlendMode(Phaser.BlendModes.ADD);
    const hitIndices = new Set<number>();
    let finished = false;
    let cleaned = false;
    const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        wave.destroy();
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
                throw new Error("Missing Sun flare animation clock value");
            }
            const progress = Math.max(0, Math.min(1, elapsed / durationMs));
            const x = startX + (endX - startX) * progress;
            const alpha = Math.min(1, progress * 5, (1 - progress) * 5);
            wave.clear();
            if (receivers.length) {
                for (const layer of [1, 0.6, 0.25]) {
                    wave.fillStyle(0xffedb5, 0.2 * alpha);
                    wave.fillEllipse(x, (topY + bottomY) / 2, 100 * layer, bottomY - topY);
                    wave.lineStyle(3, 0xffffe8, 0.6 * alpha);
                    wave.strokeEllipse(x, (topY + bottomY) / 2, 100 * layer, bottomY - topY);
                }
            }
            receivers.forEach(target => {
                if (x < target.x || hitIndices.has(target.index)) return;
                hitIndices.add(target.index);
                impact(target.index);
            });
        },
        onComplete: () => {
            if (!finished) {
                finished = true;
                // Also settle skipped/dead targets and slow frames; the action deduplicates prior contacts.
                impact();
            }
            cleanup();
        },
        onStop: cleanup,
    });
};
