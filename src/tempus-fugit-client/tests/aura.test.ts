import { afterEach, describe, expect, it, vi } from "vitest";
import { positiveAura, negativeAura } from "../animations/aura";
import type { CardAnimationPosition } from "../animations/card-animation-registry";
import type { MissionScene } from "../scenes/mission-scene";

type EffectConfig = {
    duration: number;
    onUpdate(tween: {getValue(): number}): void;
    onComplete(): void;
    onStop(): void;
};

function makeSprite(x = 300, y = 620, originY = 1, rotation = 0, scale = 8) {
    const sprite: Phaser.GameObjects.Sprite = Object.create(null);
    const getBottomCenter = vi.fn(() => {
        const offset = (1 - sprite.originY) * sprite.height * sprite.scaleY;
        return {x: sprite.x - Math.sin(rotation) * offset, y: sprite.y + Math.cos(rotation) * offset};
    });
    const setPosition = vi.fn((x: number, y: number) => {
        sprite.x = x;
        sprite.y = y;
        return sprite;
    });
    const setScale = vi.fn((x: number, y: number) => {
        sprite.scaleX = x;
        sprite.scaleY = y;
        return sprite;
    });
    Object.assign(sprite, {
        x, y, originY, height: 40, scaleX: scale, scaleY: scale, scene: {},
        getBounds: () => ({width: 32 * scale, top: y - 40 * scale * originY}),
        getBottomCenter, setPosition, setScale,
    });
    return {sprite, getBottomCenter, setPosition, setScale};
}

function createScene() {
    vi.stubGlobal("Phaser", {BlendModes: {ADD: 1, NORMAL: 0}});
    const rays = {
        setDepth: vi.fn().mockReturnThis(),
        setBlendMode: vi.fn().mockReturnThis(),
        clear: vi.fn(),
        fillStyle: vi.fn(),
        fillPoints: vi.fn(),
        fillRect: vi.fn(),
        fillEllipse: vi.fn(),
        destroy: vi.fn(),
    };
    let config: EffectConfig;
    const scene: MissionScene = Object.create(null);
    Object.assign(scene, {
        cameras: {main: {height: 1080}},
        add: {graphics: vi.fn(() => rays)},
        tweens: {addCounter: vi.fn(options => { config = options; return {}; })},
    });
    return {
        scene, rays, config: () => config,
        advance: (elapsed: number) => config.onUpdate({getValue: () => elapsed}),
    };
}

function createEffect(positive = true, sprites = [makeSprite()]) {
    const effect = createScene();
    const targets = sprites.map(({sprite}) => ({x: sprite.x, y: 460, groundY: 620, sprite}));
    const impact = vi.fn();
    (positive ? positiveAura : negativeAura)(effect.scene, targets, impact);
    return {...effect, sprites, targets, impact};
}

afterEach(() => vi.unstubAllGlobals());

describe("Positive aura", () => {
    it("illuminates the character with additive, right-slanted rays confined to the battle area", () => {
        const {rays, targets, advance} = createEffect();
        advance(160);
        expect(rays.setBlendMode).toHaveBeenCalledWith(1);
        expect(rays.setDepth).toHaveBeenCalledWith(150);
        expect(rays.fillPoints).toHaveBeenCalledTimes(6);
        const points = rays.fillPoints.mock.calls[0][0];
        expect((points[0].x + points[1].x) / 2).toBeGreaterThan(targets[0].x);
        expect((points[2].x + points[3].x) / 2).toBe(targets[0].x);
        expect(points[1].x - points[0].x).toBeLessThan(points[2].x - points[3].x);
        expect(points.every(point => point.y >= 1080 * 0.245 && point.y <= targets[0].groundY)).toBe(true);
        expect(rays.fillStyle).toHaveBeenCalledWith(0xffedb5, 0.09);
        expect(rays.fillEllipse).toHaveBeenCalled();
    });

    it("levitates briefly, holds the pose, and lands without changing horizontal position or scale", () => {
        const {sprites: [{sprite}], advance, config} = createEffect();
        advance(0);
        expect(sprite.y).toBe(620);
        advance(80);
        expect(sprite.y).toBeLessThan(620);
        advance(160);
        expect(sprite.y).toBe(588);
        expect(sprite.x).toBe(300);
        expect([sprite.scaleX, sprite.scaleY]).toEqual([8, 8]);
        advance(240);
        expect(sprite.y).toBe(588);
        advance(350);
        expect(sprite.y).toBeGreaterThan(588);
        expect(sprite.y).toBeLessThan(620);
        advance(config().duration);
        expect(sprite.y).toBe(620);
        config().onComplete();
        expect([sprite.x, sprite.y, sprite.scaleX, sprite.scaleY]).toEqual([300, 620, 8, 8]);
    });
});

describe("Negative aura", () => {
    it("crushes every target in place and preserves each target's feet across sizes, origins, and rotation", () => {
        const sprites = [makeSprite(1500, 620), makeSprite(1720, 600, 0.5, 0.2, 6)];
        const feet = sprites.map(({getBottomCenter}) => getBottomCenter());
        const {rays, advance, config} = createEffect(false, sprites);
        advance(160);
        expect(rays.setBlendMode).toHaveBeenCalledWith(0);
        expect(rays.fillPoints).toHaveBeenCalledTimes(6);
        sprites.forEach(({sprite, getBottomCenter}, index) => {
            expect(sprite.scaleY).toBeCloseTo((index === 0 ? 8 : 6) * 0.78);
            expect(sprite.scaleX).toBeCloseTo((index === 0 ? 8 : 6) * 1.12);
            expect(getBottomCenter().x).toBeCloseTo(feet[index].x);
            expect(getBottomCenter().y).toBeCloseTo(feet[index].y);
        });
        config().onComplete();
        expect([sprites[0].sprite.x, sprites[0].sprite.y, sprites[0].sprite.scaleX, sprites[0].sprite.scaleY])
            .toEqual([1500, 620, 8, 8]);
        expect([sprites[1].sprite.x, sprites[1].sprite.y, sprites[1].sprite.scaleX, sprites[1].sprite.scaleY])
            .toEqual([1720, 600, 6, 6]);
    });

    it("brings a shadow down onto targets rather than emitting upward or right-slanted light", () => {
        const {rays, advance, targets} = createEffect(false);
        advance(80);
        const points = rays.fillPoints.mock.calls[0][0];
        expect((points[0].x + points[1].x) / 2).toBe(targets[0].x);
        const halfwayPressure = rays.fillRect.mock.lastCall[1];
        expect(halfwayPressure).toBeGreaterThan(1080 * 0.245);
        advance(160);
        expect(rays.fillRect.mock.lastCall[1]).toBe(targets[0].groundY - 12);
        expect(rays.fillRect.mock.lastCall[1]).toBeGreaterThan(halfwayPressure);
        expect(rays.fillStyle).toHaveBeenCalledWith(0x160c29, 0.3);
    });
});

describe("Aura lifecycle", () => {
    it.each([true, false])("applies impact exactly once at 160ms and finishes within 460ms (positive=%s)", positive => {
        const {impact, advance, config} = createEffect(positive);
        expect(config().duration).toBe(460);
        advance(159);
        expect(impact).not.toHaveBeenCalled();
        advance(160);
        expect(impact).toHaveBeenCalledOnce();
        advance(400);
        config().onComplete();
        expect(impact).toHaveBeenCalledOnce();
    });

    it.each([true, false])("restores the original pose and cleans graphics on interruption without premature impact (positive=%s)", positive => {
        const {sprites: [{sprite}], rays, impact, advance, config} = createEffect(positive);
        advance(100);
        config().onStop();
        config().onStop();
        expect(impact).not.toHaveBeenCalled();
        expect([sprite.x, sprite.y, sprite.scaleX, sprite.scaleY]).toEqual([300, 620, 8, 8]);
        expect(rays.destroy).toHaveBeenCalledOnce();
    });

    it("applies impact and restores the pose even if a slow frame skips the final update", () => {
        const {sprites: [{sprite}], rays, impact, advance, config} = createEffect();
        advance(80);
        config().onComplete();
        expect(impact).toHaveBeenCalledOnce();
        expect(sprite.y).toBe(620);
        expect(rays.destroy).toHaveBeenCalledOnce();
    });

    it("never mutates destroyed sprites during updates or cleanup", () => {
        const {sprites: [{sprite, setPosition, setScale}], advance, config, impact} = createEffect();
        advance(80);
        const positionCalls = setPosition.mock.calls.length;
        const scaleCalls = setScale.mock.calls.length;
        Object.assign(sprite, {scene: undefined});
        advance(160);
        config().onComplete();
        expect(setPosition).toHaveBeenCalledTimes(positionCalls);
        expect(setScale).toHaveBeenCalledTimes(scaleCalls);
        expect(impact).toHaveBeenCalledOnce();
    });

    it("skips already destroyed targets without changing action resolution", () => {
        const effect = createScene();
        const {sprite, setPosition} = makeSprite();
        Object.assign(sprite, {scene: undefined});
        const impact = vi.fn();
        negativeAura(effect.scene, [{x: 1500, y: 520, groundY: 620, sprite}], impact);
        effect.advance(160);
        effect.config().onComplete();
        expect(setPosition).not.toHaveBeenCalled();
        expect(impact).toHaveBeenCalledOnce();
    });

    it("reports missing character sprites instead of silently omitting the effect", () => {
        const {scene} = createScene();
        const target: CardAnimationPosition = {x: 300, y: 460, groundY: 620};
        expect(() => positiveAura(scene, [target], vi.fn())).toThrow("requires a character sprite");
        expect(scene.add.graphics).not.toHaveBeenCalled();
    });
});
