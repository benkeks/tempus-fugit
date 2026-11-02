import type { CardAnimation } from "./card-animation-registry";

export const lightning: CardAnimation = (scene, targets, impact) => {
    const impactMs = 110;
    const durationMs = 280;
    const variants = [
        {offsetX: 0, scale: 10, delayMs: 0},
        {offsetX: -28, scale: 9, delayMs: 14},
        {offsetX: 28, scale: 8, delayMs: 28},
    ];
    const bolts = targets.map(target => variants.map(variant => {
        const sprite = scene.add.image(Math.round(target.x + variant.offsetX), Math.round(target.y) - 160, "lightning_strike")
            .setOrigin(0.25, 29 / 32)
            .setScale(variant.scale)
            .setDepth(150);
        sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        sprite.alpha = variant.delayMs === 0 ? 1 : 0;
        return {sprite, target, variant};
    }));
    const cleanup = () => bolts.forEach(group => group.forEach(({sprite}) => sprite.destroy()));
    let impacted = false;

    const tween = scene.tweens.addCounter({
        from: 0,
        to: durationMs,
        duration: durationMs,
        ease: "Linear",
        onUpdate: tween => {
            const elapsed = tween.getValue();
            bolts.forEach(group => group.forEach(({sprite, target, variant}) => {
                const localTime = elapsed - variant.delayMs;
                const progress = Math.max(0, Math.min(1, localTime / (impactMs - variant.delayMs)));
                const flickerFrame = Math.floor(Math.max(0, localTime) / 24);
                const jitter = variant.offsetX === 0 ? 0 : (flickerFrame % 3 - 1) * 6;
                sprite.x = Math.round(target.x + variant.offsetX + jitter);
                sprite.y = Math.round(target.y - 160 * (1 - progress));
                const fade = Math.max(0, 1 - Math.max(0, elapsed - impactMs) / (durationMs - impactMs));
                sprite.alpha = localTime >= 0 && flickerFrame % 2 === 0 ? fade : 0;
            }));
            if (!impacted && elapsed >= impactMs) {
                impacted = true;
                impact();
            }
        },
        onComplete: () => {
            // A very slow frame can skip the last update.
            if (!impacted) impact();
            cleanup();
        },
        onStop: cleanup,
    });
    return tween;
};
