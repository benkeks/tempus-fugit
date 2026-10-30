import type { CardDamageAnimation } from "./card-animation-registry";

export const electrocution: CardDamageAnimation = (scene, sprite) => {
    const tint = [sprite.tintTopLeft, sprite.tintTopRight, sprite.tintBottomLeft, sprite.tintBottomRight] as const;
    const tintFill = sprite.tintFill;
    const restoreTint = () => {
        if (!sprite.scene) return;
        if (tintFill) sprite.setTintFill(...tint);
        else sprite.setTint(...tint);
    };

    sprite.setTintFill(0xffffff);
    return scene.tweens.addCounter({
        from: 0,
        to: 240,
        duration: 240,
        ease: "Linear",
        onUpdate: tween => {
            if (!sprite.scene) return;
            if (Math.floor(tween.getValue() / 40) % 2 === 0) sprite.setTintFill(0xffffff);
            else restoreTint();
        },
        onComplete: restoreTint,
        onStop: restoreTint,
    });
};
