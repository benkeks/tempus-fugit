import type { CardAnimation } from "./card-animation-registry";

function magicParticles(above: boolean): CardAnimation {
    return (scene, targets, impact) => {
        const flightMs = above ? 300 : 240;
        const emissionMs = above ? 80 : 90;
        const count = above ? 32 : 6;
        const durationMs = flightMs + emissionMs + 60;
        const mage = above ? undefined : scene.playerGUI.getCenter(undefined, true);
        const emitters = targets.filter(target => !target.sprite || target.sprite.scene).map(target => {
            const x = mage ? mage.x : target.x;
            const y = mage ? mage.y : Math.max(scene.cameras.main.height * 0.245, target.y - 300);
            // Match the book's casting particles: the four rune frames with additive blending.
            const emitter = scene.add.particles(0, 0, "runes", {
                frame: [0, 1, 2, 3],
                x: {min: x - (above ? 120 : 8), max: x + (above ? 120 : 8)},
                y: above ? {min: y, max: Math.max(y + 40, target.y - 180)} : {min: y - 10, max: y + 10},
                moveToX: target.x,
                moveToY: target.y,
                lifespan: flightMs,
                delay: {start: 0, end: emissionMs, steps: count},
                scale: {start: above ? 1.1 : 0.85, end: 0.25},
                blendMode: "ADD",
                emitting: false,
                frequency: -1,
            }).setDepth(150);
            emitter.explode(count);
            return emitter;
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
            emitters.forEach(emitter => emitter.destroy());
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
                    throw new Error("Missing magic-particle animation clock value");
                }
                if (elapsed >= flightMs) hit();
            },
            onComplete: () => {
                hit();
                cleanup();
            },
            onStop: cleanup,
        });
    };
}

export const magicBolts = magicParticles(false);
export const magicRain = magicParticles(true);
