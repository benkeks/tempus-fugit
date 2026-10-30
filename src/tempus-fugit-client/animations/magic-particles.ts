import type { CardAnimation } from "./card-animation-registry";

function magicParticles(mode: "bolts" | "rain" | "swarm"): CardAnimation {
    return (scene, targets, impact, _card, caster) => {
        const above = mode === "rain";
        const swarm = mode === "swarm";
        const flightMs = above ? 300 : swarm ? 260 : 240;
        const emissionMs = above ? 80 : swarm ? 130 : 90;
        const count = above ? 32 : swarm ? 64 : 6;
        const durationMs = flightMs + emissionMs + 60;
        const source = above ? undefined : caster ?? scene.playerGUI.getCenter(undefined, true);
        const emitters = targets.filter(target => !target.sprite || target.sprite.scene).map(target => {
            const x = source ? source.x : target.x;
            const y = source ? source.y : Math.max(scene.cameras.main.height * 0.245, target.y - 300);
            // Match the book's casting particles: the four rune frames with additive blending.
            const emitter = scene.add.particles(0, 0, "runes", {
                frame: [0, 1, 2, 3],
                x: {min: x - (above ? 120 : swarm ? 40 : 8), max: x + (above ? 120 : swarm ? 40 : 8)},
                y: above ? {min: y, max: Math.max(y + 40, target.y - 180)}
                    : {min: y - (swarm ? 50 : 10), max: y + (swarm ? 50 : 10)},
                moveToX: swarm ? {min: target.x - 36, max: target.x + 36} : target.x,
                moveToY: swarm ? {min: target.y - 54, max: target.y + 54} : target.y,
                lifespan: flightMs,
                delay: {start: 0, end: emissionMs, steps: count},
                scale: {start: above ? 1.32 : 1.02, end: 0.3},
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

export const magicBolts = magicParticles("bolts");
export const magicRain = magicParticles("rain");
export const magicSwarm = magicParticles("swarm");
