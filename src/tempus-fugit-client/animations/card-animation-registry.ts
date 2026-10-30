import type { MissionScene } from "../scenes/mission-scene";

export type CardAnimationPosition = { x: number; y: number; groundY: number };
// Return a finite scene-clock tween, call impact when the spell connects, and clean up on complete/stop.
export type CardAnimation = (
    scene: MissionScene,
    targets: readonly CardAnimationPosition[],
    impact: () => void,
) => Phaser.Tweens.Tween;

export type CardDamageAnimation = (
    scene: MissionScene,
    sprite: Phaser.GameObjects.Sprite,
) => Phaser.Tweens.Tween;

export class CardAnimationRegistry {
    private readonly animations = new Map<string, {
        animation: CardAnimation;
        damageAnimation?: CardDamageAnimation;
    }>();

    public register(key: string, animation: CardAnimation, damageAnimation?: CardDamageAnimation): void {
        if (this.animations.has(key)) {
            throw new Error("Card animation already registered: " + key);
        }
        this.animations.set(key, {animation, damageAnimation});
    }

    public get(key: string): CardAnimation | undefined {
        return this.animations.get(key)?.animation;
    }

    public getDamageAnimation(key: string): CardDamageAnimation | undefined {
        return this.animations.get(key)?.damageAnimation;
    }
}
