import { describe, expect, it, vi } from "vitest";
import { electrocution } from "../animations/electrocution";
import type { MissionScene } from "../scenes/mission-scene";

type DamageConfig = {
    duration: number;
    onUpdate(tween: {getValue(): number}): void;
    onComplete(): void;
    onStop(): void;
};

function createElectrocution(tintFill = false) {
    const sprite: Phaser.GameObjects.Sprite = Object.create(null);
    const tint = [0x112233, 0x445566, 0x778899, 0xaabbcc];
    const setTint = vi.fn((topLeft: number, topRight = topLeft, bottomLeft = topLeft, bottomRight = topLeft) => {
        Object.assign(sprite, {
            tintTopLeft: topLeft, tintTopRight: topRight, tintBottomLeft: bottomLeft, tintBottomRight: bottomRight,
            tintFill: false,
        });
        return sprite;
    });
    const setTintFill = vi.fn((topLeft: number, topRight = topLeft, bottomLeft = topLeft, bottomRight = topLeft) => {
        setTint(topLeft, topRight, bottomLeft, bottomRight);
        sprite.tintFill = true;
        return sprite;
    });
    Object.assign(sprite, {
        scene: {},
        tintTopLeft: tint[0], tintTopRight: tint[1], tintBottomLeft: tint[2], tintBottomRight: tint[3],
        tintFill, setTint, setTintFill,
    });
    let config: DamageConfig;
    const scene: MissionScene = Object.create(null);
    const tween = {};
    Object.assign(scene, {tweens: {addCounter: vi.fn(options => { config = options; return tween; })}});
    electrocution(scene, sprite);
    return {
        sprite, tint, setTintFill,
        config: () => config,
        advance: (elapsed: number) => config.onUpdate({getValue: () => elapsed}),
    };
}

describe("Electrocution hit reaction", () => {
    it("immediately flashes the enemy white and alternates with its original colors for 240ms", () => {
        const {sprite, tint, setTintFill, config, advance} = createElectrocution();
        expect(setTintFill).toHaveBeenCalledWith(0xffffff);
        expect(sprite.tintFill).toBe(true);
        expect(sprite.tintTopLeft).toBe(0xffffff);
        expect(config().duration).toBe(240);
        advance(39);
        expect(sprite.tintTopLeft).toBe(0xffffff);
        advance(40);
        expect(sprite.tintFill).toBe(false);
        expect(sprite.tintTopLeft).toBe(tint[0]);
        advance(80);
        expect(sprite.tintFill).toBe(true);
        expect(sprite.tintTopLeft).toBe(0xffffff);
    });

    it.each([false, true])("restores all original tint corners and tintFill=%s on completion", originalFill => {
        const {sprite, tint, config, advance} = createElectrocution(originalFill);
        advance(80);
        config().onComplete();
        expect([sprite.tintTopLeft, sprite.tintTopRight, sprite.tintBottomLeft, sprite.tintBottomRight]).toEqual(tint);
        expect(sprite.tintFill).toBe(originalFill);
    });

    it("restores the original tint when stopped early", () => {
        const {sprite, tint, config} = createElectrocution();
        config().onStop();
        expect(sprite.tintTopLeft).toBe(tint[0]);
        expect(sprite.tintFill).toBe(false);
    });

    it("does not mutate a sprite that was destroyed during the reaction", () => {
        const {sprite, setTintFill, config, advance} = createElectrocution();
        sprite.scene = undefined;
        setTintFill.mockClear();
        advance(80);
        expect(setTintFill).not.toHaveBeenCalled();
        expect(() => config().onComplete()).not.toThrow();
    });
});
