import type { CardAnimation } from "./card-animation-registry";

export const healing: CardAnimation = (scene, targets, impact, card) => {
    if (!card || card.healing === undefined || !Number.isFinite(card.healing) || card.healing <= 0) {
        throw new Error("Missing healing strength for card animation: " + card?.name);
    }
    if (targets.length !== 1) throw new Error("Healing animation requires one mage target");

    // Natural heal (40 HP) is the smallest shipped heal and emits three hearts.
    const count = Math.max(1, Math.round(card.healing * 3 / 40));
    const travelMs = 260;
    const intervalMs = 38;
    const durationMs = travelMs + (count - 1) * intervalMs;
    const stand = card.stand() ? scene.standGUI.beginEffect(card) : undefined;
    const source = stand ? stand.sprite : scene.cardChannel.book;
    const startY = source.y;
    const target = targets[0];
    const hearts = Array.from({length: count}, () => {
        const sprite = scene.add.image(0, 0, "heartFont").setScale(1.5).setDepth(150).setVisible(false);
        sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        return sprite;
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
        hearts.forEach(heart => heart.destroy());
        stand?.restore();
    };

    return scene.tweens.addCounter({
        from: 0,
        to: durationMs,
        duration: durationMs,
        ease: "Linear",
        onUpdate: tween => {
            const elapsed = tween.getValue();
            if (stand && source.active) source.y = startY - 24 * Math.sin(elapsed / durationMs * Math.PI * 2);
            const origin = source.getCenter(undefined, true);
            hearts.forEach((heart, index) => {
                const progress = (elapsed - index * intervalMs) / travelMs;
                heart.setVisible(progress >= 0 && progress < 1);
                if (progress < 0 || progress > 1) return;
                // Live world coordinates bend the stream with the emitting stand's vertical motion.
                heart.x = Math.round(origin.x + (target.x - origin.x) * progress);
                heart.y = Math.round(origin.y + (target.y - origin.y) * progress - Math.sin(Math.PI * progress) * 55);
            });
            if (elapsed >= travelMs) hit();
        },
        onComplete: () => {
            hit();
            cleanup();
        },
        onStop: cleanup,
    });
};
