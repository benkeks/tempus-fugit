import { afterEach, describe, expect, it, vi } from "vitest";
import { lightBeam, darkBeam, greenBeam, sandBeam } from "../animations/beam";
import { magicBolts, magicRain, magicSwarm } from "../animations/magic-particles";
import { sunWave } from "../animations/sun-wave";
import { slash } from "../animations/slash";
import { needleVolley } from "../animations/needle-volley";
import { groundImpact } from "../animations/ground-impact";
import { slimeSplash } from "../animations/slime-splash";
import { stoneThrow } from "../animations/stone-throw";
import { puffBlast } from "../animations/puff-blast";
import type { CardAnimation, CardAnimationPosition } from "../animations/card-animation-registry";
import type { Card } from "../objects/game-objects/card";
import type { MissionScene } from "../scenes/mission-scene";

type EffectConfig = {
    duration: number;
    onUpdate(tween: {getValue(): number | null}): void;
    onComplete(): void;
    onStop(): void;
};

function createEffect(animation: CardAnimation, targets: readonly CardAnimationPosition[] = [
    {x: 1500, y: 520, groundY: 600},
    {x: 1720, y: 400, groundY: 640},
], isStand = true, caster?: CardAnimationPosition) {
    vi.stubGlobal("Phaser", {BlendModes: {ADD: 1, NORMAL: 0}});
    const graphics = {
        setDepth: vi.fn().mockReturnThis(), setBlendMode: vi.fn().mockReturnThis(),
        lineStyle: vi.fn().mockReturnThis(), lineBetween: vi.fn().mockReturnThis(),
        fillStyle: vi.fn().mockReturnThis(), fillCircle: vi.fn().mockReturnThis(),
        fillEllipse: vi.fn().mockReturnThis(), strokeEllipse: vi.fn().mockReturnThis(),
        fillPoints: vi.fn().mockReturnThis(), fillRect: vi.fn().mockReturnThis(),
        clear: vi.fn(), destroy: vi.fn(),
    };
    const emitters: Array<{
        config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig;
        setDepth: ReturnType<typeof vi.fn>;
        explode: ReturnType<typeof vi.fn>;
        destroy: ReturnType<typeof vi.fn>;
    }> = [];
    const mageCenter = vi.fn(() => ({x: 300, y: 460}));
    const standCenter = vi.fn(() => ({x: 700, y: 600}));
    const restore = vi.fn();
    const beginEffect = vi.fn(() => ({sprite: {getCenter: standCenter}, restore}));
    let config: EffectConfig;
    const scene: MissionScene = Object.create(null);
    Object.assign(scene, {
        cameras: {main: {width: 1920, height: 1080}},
        playerGUI: {getCenter: mageCenter},
        standGUI: {beginEffect},
        add: {
            graphics: () => graphics,
            particles: vi.fn((_x, _y, _key, options) => {
                const emitter = {
                    config: options, setDepth: vi.fn().mockReturnThis(),
                    explode: vi.fn(), destroy: vi.fn(),
                };
                emitters.push(emitter);
                return emitter;
            }),
        },
        tweens: {addCounter: vi.fn(options => { config = options; return {}; })},
    });
    const card: Card = Object.create(null);
    card.stand = () => isStand;
    const impact = vi.fn();
    animation(scene, targets, impact, card, caster);
    return {
        scene, card, targets, graphics, emitters, mageCenter, standCenter, beginEffect, restore, impact,
        config: () => config,
        advance: (elapsed: number) => config.onUpdate({getValue: () => elapsed}),
    };
}

afterEach(() => vi.unstubAllGlobals());

function createCaster() {
    const sprite: Phaser.GameObjects.Sprite = Object.create(null);
    Object.assign(sprite, {
        scene: {}, x: 16, y: 28, scaleX: 4, scaleY: 4, angle: 6,
        getBounds: function(this: Phaser.GameObjects.Sprite) {
            return {width: 32 * this.scaleX};
        },
        getBottomCenter: function(this: Phaser.GameObjects.Sprite) {
            return {x: this.x, y: this.y + 16 * this.scaleY};
        },
        setPosition: function(this: Phaser.GameObjects.Sprite, x: number, y: number) {
            this.x = x;
            this.y = y;
            return this;
        },
        setScale: function(this: Phaser.GameObjects.Sprite, x: number, y: number) {
            this.scaleX = x;
            this.scaleY = y;
            return this;
        },
    });
    return sprite;
}

describe("Light, dark, and enemy beams", () => {
    it("casts a dark beam from the specific enemy toward the mage", () => {
        const {graphics, mageCenter, beginEffect, advance} = createEffect(
            darkBeam, [{x: 300, y: 460, groundY: 620}], false, {x: 1500, y: 520, groundY: 600});
        advance(80);
        expect(graphics.lineBetween).toHaveBeenCalledWith(1500, 520, 900, 490);
        advance(160);
        expect(graphics.lineBetween).toHaveBeenCalledWith(1500, 520, 300, 460);
        expect(mageCenter).not.toHaveBeenCalled();
        expect(beginEffect).not.toHaveBeenCalled();
    });

    it("uses the exact stand as the light source and follows its live world position", () => {
        const {card, graphics, standCenter, mageCenter, beginEffect, restore, advance, config} = createEffect(lightBeam);
        expect(beginEffect).toHaveBeenCalledWith(card);
        advance(80);
        expect(standCenter).toHaveBeenCalledWith(undefined, true);
        expect(graphics.lineBetween).toHaveBeenCalledWith(700, 600, 1100, 560);
        standCenter.mockReturnValue({x: 720, y: 576});
        advance(160);
        expect(graphics.lineBetween).toHaveBeenCalledWith(720, 576, 1500, 520);
        expect(mageCenter).not.toHaveBeenCalled();
        expect(restore).not.toHaveBeenCalled();
        config().onComplete();
        config().onStop();
        expect(restore).toHaveBeenCalledOnce();
        expect(graphics.setBlendMode).toHaveBeenCalledWith(1);
    });

    it("casts the dark beam from the mage to each target without selecting a stand", () => {
        const {graphics, mageCenter, beginEffect, targets, advance} = createEffect(darkBeam);
        advance(160);
        expect(mageCenter).toHaveBeenCalledWith(undefined, true);
        targets.forEach(target => expect(graphics.lineBetween).toHaveBeenCalledWith(300, 460, target.x, target.y));
        expect(beginEffect).not.toHaveBeenCalled();
        expect(graphics.setBlendMode).toHaveBeenCalledWith(0);
    });

    it("rejects a missing or nonstand Light stand source", () => {
        const {scene} = createEffect(darkBeam);
        expect(() => lightBeam(scene, [], vi.fn())).toThrow("requires a stand card");
        expect(() => createEffect(lightBeam, [], false)).toThrow("requires a stand card");
    });

    it.each([
        ["snake", greenBeam, [0x527b36, 0x94c45b, 0xe9ffc1]],
        ["mummy", sandBeam, [0x86623d, 0xc7a569, 0xffefd0]],
    ] as const)("casts the %s beam with its palette without requiring a stand", (_name, animation, colors) => {
        const {graphics, beginEffect, advance} = createEffect(
            animation, [{x: 300, y: 460, groundY: 620}], false, {x: 1500, y: 520, groundY: 600});
        advance(160);
        expect(graphics.lineBetween).toHaveBeenCalledWith(1500, 520, 300, 460);
        colors.forEach(color => expect(graphics.lineStyle).toHaveBeenCalledWith(expect.any(Number), color, expect.any(Number)));
        expect(beginEffect).not.toHaveBeenCalled();
    });

    it.each([darkBeam, greenBeam, sandBeam])("follows the actual enemy's live world center", animation => {
        const sprite: Phaser.GameObjects.Sprite = Object.create(null);
        const getCenter = vi.fn(() => ({x: 1500, y: 520}));
        Object.assign(sprite, {scene: {}, getCenter});
        const {graphics, advance} = createEffect(
            animation, [{x: 300, y: 460, groundY: 620}], false, {x: 1500, y: 520, groundY: 600, sprite});
        advance(80);
        expect(graphics.lineBetween).toHaveBeenCalledWith(1500, 520, 900, 490);
        getCenter.mockReturnValue({x: 1516, y: 510});
        advance(160);
        expect(getCenter).toHaveBeenCalledWith(undefined, true);
        expect(graphics.lineBetween).toHaveBeenCalledWith(1516, 510, 300, 460);
    });

    it.each([lightBeam, darkBeam, greenBeam, sandBeam])("waits until the beam reaches its receivers before impact", animation => {
        const {advance, impact, config} = createEffect(animation);
        advance(159);
        expect(impact).not.toHaveBeenCalled();
        advance(160);
        advance(220);
        config().onComplete();
        expect(impact).toHaveBeenCalledOnce();
        expect(config().duration).toBe(340);
    });
});

describe("Rune magic particles", () => {
    it("launches a broad 64-rune boss swarm, scattering arrivals across the mage instead of one bright clump", () => {
        const {emitters, mageCenter, advance, impact, config} = createEffect(
            magicSwarm, [{x: 300, y: 460, groundY: 620}], false, {x: 1500, y: 520, groundY: 600});
        expect(mageCenter).not.toHaveBeenCalled();
        expect(emitters).toHaveLength(1);
        expect(emitters[0].explode).toHaveBeenCalledWith(64);
        expect(emitters[0].config).toMatchObject({
            frame: [0, 1, 2, 3], emitting: false, frequency: -1, blendMode: "ADD",
            x: {min: 1460, max: 1540}, y: {min: 470, max: 570},
            moveToX: {min: 264, max: 336}, moveToY: {min: 406, max: 514},
            lifespan: 260, delay: {start: 0, end: 130, steps: 64},
            scale: {start: 1.02, end: 0.3},
        });
        advance(259);
        expect(impact).not.toHaveBeenCalled();
        advance(260);
        advance(390);
        expect(impact).toHaveBeenCalledOnce();
        expect(emitters[0].destroy).not.toHaveBeenCalled();
        config().onComplete();
        expect(emitters[0].destroy).toHaveBeenCalledOnce();
        expect(config().duration).toBe(450);
    });

    it("sends Bookworm Slime's sparse rune trail from the enemy to the mage", () => {
        const {emitters, mageCenter} = createEffect(
            magicBolts, [{x: 300, y: 460, groundY: 620}], false, {x: 1500, y: 520, groundY: 600});
        expect(mageCenter).not.toHaveBeenCalled();
        expect(emitters).toHaveLength(1);
        expect(emitters[0].explode).toHaveBeenCalledWith(6);
        expect(emitters[0].config).toMatchObject({
            x: {min: 1492, max: 1508}, y: {min: 510, max: 530},
            moveToX: 300, moveToY: 460, delay: {start: 0, end: 90, steps: 6},
            scale: {start: 1.02, end: 0.3},
        });
    });

    it("sends only six additive rune particles from the mage for Anti-evolution", () => {
        const {scene, emitters, targets, mageCenter, advance, impact} = createEffect(magicBolts);
        expect(mageCenter).toHaveBeenCalledWith(undefined, true);
        expect(scene.add.particles).toHaveBeenCalledWith(0, 0, "runes", expect.any(Object));
        emitters.forEach((emitter, i) => {
            expect(emitter.explode).toHaveBeenCalledWith(6);
            expect(emitter.config).toMatchObject({
                frame: [0, 1, 2, 3], blendMode: "ADD", emitting: false, frequency: -1,
                x: {min: 292, max: 308}, y: {min: 450, max: 470},
                moveToX: targets[i].x, moveToY: targets[i].y, lifespan: 240,
                delay: {start: 0, end: 90, steps: 6},
                scale: {start: 1.02, end: 0.3},
            });
        });
        advance(239);
        expect(impact).not.toHaveBeenCalled();
        advance(240);
        expect(impact).toHaveBeenCalledOnce();
    });

    it("rains the same rune style from above for Obliterate and Tempus Fugit", () => {
        const {emitters, targets, mageCenter, advance, impact} = createEffect(magicRain);
        expect(mageCenter).not.toHaveBeenCalled();
        emitters.forEach((emitter, i) => {
            expect(emitter.explode).toHaveBeenCalledWith(32);
            expect(emitter.config).toMatchObject({
                frame: [0, 1, 2, 3], blendMode: "ADD", emitting: false, frequency: -1,
                x: {min: targets[i].x - 120, max: targets[i].x + 120},
                y: {min: 1080 * 0.245, max: Math.max(1080 * 0.245 + 40, targets[i].y - 180)},
                moveToX: targets[i].x, moveToY: targets[i].y, lifespan: 300,
                delay: {start: 0, end: 80, steps: 32},
                scale: {start: 1.32, end: 0.3},
            });
        });
        advance(299);
        expect(impact).not.toHaveBeenCalled();
        advance(300);
        expect(impact).toHaveBeenCalledOnce();
    });

    it.each([[magicBolts, 390], [magicRain, 440]] as const)("keeps the delayed particle tail alive after the first arrival", (animation, duration) => {
        const {advance, emitters, impact, config} = createEffect(animation);
        advance(duration - 60);
        expect(impact).toHaveBeenCalledOnce();
        emitters.forEach(emitter => expect(emitter.destroy).not.toHaveBeenCalled());
        expect(config().duration).toBe(duration);
        config().onComplete();
        emitters.forEach(emitter => expect(emitter.destroy).toHaveBeenCalledOnce());
    });
});

describe("Sun flare's travelling light wave", () => {
    it("crosses the enemies left-to-right, independent of model target order", () => {
        const {graphics, impact, advance, config} = createEffect(sunWave, [
            {x: 1720, y: 520, groundY: 600, index: 4},
            {x: 1500, y: 400, groundY: 640, index: 1},
        ]);
        advance(111);
        expect(impact).not.toHaveBeenCalled();
        advance(112);
        expect(impact.mock.calls).toEqual([[1]]);
        expect(graphics.fillEllipse).toHaveBeenCalledWith(1500, expect.any(Number), 100, expect.any(Number));
        advance(287);
        expect(impact).toHaveBeenCalledOnce();
        advance(288);
        advance(399);
        expect(impact.mock.calls).toEqual([[1], [4]]);
        config().onComplete();
        config().onComplete();
        expect(impact.mock.calls).toEqual([[1], [4], []]);
        expect(graphics.destroy).toHaveBeenCalledOnce();
    });

    it("retains original indices when destroyed actors are skipped", () => {
        const sprite: Phaser.GameObjects.Sprite = Object.create(null);
        const {advance, impact} = createEffect(sunWave, [
            {x: 0, y: 0, groundY: 0, sprite},
            {x: 1500, y: 520, groundY: 600},
        ]);
        advance(200);
        expect(impact.mock.calls).toEqual([[1]]);
    });

    it("does not hit the unreached enemies when stopped halfway through the sweep", () => {
        const {advance, impact, config} = createEffect(sunWave);
        advance(200);
        expect(impact.mock.calls).toEqual([[0]]);
        config().onStop();
        expect(impact.mock.calls).toEqual([[0]]);
    });
});

describe("Goblin slash", () => {
    function goblinSlash() {
        const sprite: Phaser.GameObjects.Sprite = Object.create(null);
        Object.assign(sprite, {scene: {}, x: 16});
        const effect = createEffect(slash, [{x: 300, y: 460, groundY: 620}], false,
            {x: 1500, y: 520, groundY: 600, sprite});
        return {...effect, sprite};
    }

    it("winds up, slashes across the mage, and applies one hit at the 140ms contact", () => {
        const {graphics, sprite, advance, impact, config} = goblinSlash();
        advance(0);
        expect(graphics.fillPoints).not.toHaveBeenCalled();
        advance(100);
        expect(sprite.x).toBeLessThan(16);
        expect(graphics.fillPoints).toHaveBeenCalledTimes(3);
        expect(impact).not.toHaveBeenCalled();
        advance(139);
        expect(impact).not.toHaveBeenCalled();
        advance(140);
        expect(sprite.x).toBeCloseTo(-12);
        const points = graphics.fillPoints.mock.lastCall[0];
        expect(points[0]).toEqual({x: 234, y: 376});
        expect(points[2]).toEqual({x: 366, y: 544});
        const outerPoints = graphics.fillPoints.mock.calls[graphics.fillPoints.mock.calls.length - 3][0];
        expect(outerPoints[3].x - outerPoints[1].x).toBeCloseTo(26.4);
        expect(impact).toHaveBeenCalledOnce();
        config().onComplete();
        expect(sprite.x).toBe(16);
        expect(impact).toHaveBeenCalledOnce();
    });

    it("restores the casting goblin's pose on interruption without dealing premature damage", () => {
        const {sprite, advance, impact, config} = goblinSlash();
        advance(90);
        expect(sprite.x).toBeLessThan(16);
        config().onStop();
        expect(sprite.x).toBe(16);
        expect(impact).not.toHaveBeenCalled();
    });

    it("does not restore a destroyed casting sprite", () => {
        const {sprite, advance, config} = goblinSlash();
        advance(90);
        Object.assign(sprite, {scene: undefined, x: 80});
        config().onStop();
        expect(sprite.x).toBe(80);
    });
});

describe("Cactus needle volley", () => {
    it("launches five staggered, layered needles from the exact caster to the mage", () => {
        const {graphics, mageCenter, advance, impact, config} = createEffect(
            needleVolley, [{x: 300, y: 460, groundY: 620}], false, {x: 1500, y: 520, groundY: 600});
        advance(0);
        expect(graphics.fillPoints).toHaveBeenCalledTimes(2);
        expect(graphics.fillPoints.mock.calls[0][0][0]).toEqual({x: 1500, y: 510});
        graphics.fillPoints.mockClear();
        advance(28);
        expect(graphics.fillPoints).toHaveBeenCalledTimes(6);
        graphics.fillPoints.mockClear();
        advance(56);
        expect(graphics.fillPoints).toHaveBeenCalledTimes(10);
        expect(impact).not.toHaveBeenCalled();
        advance(179);
        expect(impact).not.toHaveBeenCalled();
        advance(180);
        expect(graphics.fillPoints).toHaveBeenCalledWith(
            expect.arrayContaining([{x: 300, y: 432}]), true);
        expect(impact).toHaveBeenCalledOnce();
        advance(236);
        expect(graphics.fillPoints.mock.lastCall[0][0]).toEqual({x: 300, y: 488});
        expect(graphics.destroy).not.toHaveBeenCalled();
        config().onComplete();
        expect(impact).toHaveBeenCalledOnce();
        expect(config().duration).toBe(320);
        expect(mageCenter).not.toHaveBeenCalled();
    });

    it("skips destroyed receivers but still renders a volley for each living target", () => {
        const sprite: Phaser.GameObjects.Sprite = Object.create(null);
        const {graphics, advance} = createEffect(needleVolley, [
            {x: 0, y: 0, groundY: 0, sprite},
            {x: 300, y: 460, groundY: 620},
            {x: 600, y: 460, groundY: 620},
        ]);
        advance(180);
        expect(graphics.fillPoints).toHaveBeenCalledTimes(20);
        for (const [points] of graphics.fillPoints.mock.calls) {
            expect(points.every(point => Number.isInteger(point.x) && Number.isInteger(point.y))).toBe(true);
        }
    });
});

describe("Ground impact", () => {
    it("builds pressure at each target's feet, then bursts into twelve dust chips and a shockwave", () => {
        const {graphics, advance, impact, config} = createEffect(
            groundImpact, [{x: 300, y: 460, groundY: 620}]);
        advance(159);
        expect(graphics.fillEllipse).toHaveBeenCalledWith(300, 618, expect.any(Number), 12);
        expect(graphics.strokeEllipse).not.toHaveBeenCalled();
        expect(graphics.fillRect).not.toHaveBeenCalled();
        expect(impact).not.toHaveBeenCalled();
        advance(160);
        expect(graphics.strokeEllipse).toHaveBeenCalledWith(300, 616, 56, 14);
        expect(graphics.fillRect).toHaveBeenCalledTimes(12);
        expect(impact).toHaveBeenCalledOnce();
        advance(260);
        expect(graphics.strokeEllipse).toHaveBeenCalledWith(300, 616, 146, 34);
        for (const [x, y] of graphics.fillRect.mock.calls) {
            expect(Number.isInteger(x) && Number.isInteger(y)).toBe(true);
            expect(y).toBeLessThan(620);
        }
        config().onComplete();
        expect(impact).toHaveBeenCalledOnce();
        expect(config().duration).toBe(360);
    });

    it("gives the casting character a small stomp without moving its parent container", () => {
        const sprite = createCaster();
        const {advance, config} = createEffect(groundImpact, undefined, false,
            {x: 1500, y: 520, groundY: 600, sprite});
        advance(80);
        expect(sprite.y).toBe(14);
        expect(sprite.x).toBe(16);
        advance(160);
        expect(sprite.y).toBeCloseTo(28);
        config().onComplete();
        expect(sprite.y).toBe(28);
    });
});

describe("Slime squash and splash", () => {
    it.each([[1500, 492], [16, 108]])("lands an oversized slime beside the mage, approaching from x=%i", (sourceX, landingX) => {
        const sprite = createCaster();
        const mage = createCaster();
        Object.assign(sprite, {getBounds: () => ({width: 320})});
        const {advance, config} = createEffect(
            slimeSplash, [{x: 300, y: 460, groundY: 620, sprite: mage}], false,
            {x: sourceX, y: 520, groundY: 600, sprite});
        advance(230);
        expect(sprite.getBottomCenter()).toEqual({x: landingX, y: 620});
        config().onComplete();
        expect(sprite.x).toBe(16);
        expect(sprite.y).toBe(28);
    });

    it("converts the oversized slime's offset landing into its transformed parent space", () => {
        const sprite = createCaster();
        const applyInverse = vi.fn((x: number, y: number) => ({x: x / 2 - 50, y: y / 2 - 30}));
        Object.assign(sprite, {
            getBounds: () => ({width: 320}),
            parentContainer: {getWorldTransformMatrix: () => ({applyInverse})},
        });
        const {advance} = createEffect(
            slimeSplash, [{x: 300, y: 460, groundY: 620, sprite: createCaster()}], false,
            {x: 1500, y: 520, groundY: 600, sprite});
        expect(applyInverse).toHaveBeenCalledWith(492, 620);
        advance(230);
        expect(sprite.getBottomCenter()).toEqual({x: 196, y: 280});
    });

    it("anchors the squash, hops to the mage's feet in parent space, splashes, and hops home", () => {
        const sprite = createCaster();
        const applyInverse = vi.fn(() => ({x: 100, y: 120}));
        Object.assign(sprite, {parentContainer: {getWorldTransformMatrix: () => ({applyInverse})}});
        const {graphics, advance, impact, config} = createEffect(
            slimeSplash, [{x: 300, y: 460, groundY: 620}], false, {x: 1500, y: 520, groundY: 600, sprite});
        expect(applyInverse).toHaveBeenCalledWith(300, 620);
        advance(70);
        expect(sprite.scaleX).toBe(5);
        expect(sprite.scaleY).toBe(3);
        expect(sprite.getBottomCenter()).toEqual({x: 16, y: 92});
        expect(graphics.fillRect).not.toHaveBeenCalled();
        advance(150);
        expect(sprite.x).toBeCloseTo(58);
        expect(sprite.y).toBeCloseTo(-38);
        advance(229);
        expect(impact).not.toHaveBeenCalled();
        advance(230);
        expect(sprite.getBottomCenter()).toEqual({x: 100, y: 120});
        expect(graphics.fillRect).toHaveBeenCalledTimes(10);
        expect(graphics.fillEllipse).toHaveBeenCalledWith(300, 618, 54, 12);
        expect(impact).toHaveBeenCalledOnce();
        advance(245);
        expect(sprite.getBottomCenter()).toEqual({x: 100, y: 120});
        expect(sprite.scaleY).toBeLessThan(4);
        advance(340);
        expect(sprite.x).toBeCloseTo(58);
        expect(sprite.y).toBeCloseTo(-18);
        advance(420);
        config().onComplete();
        expect(sprite.x).toBe(16);
        expect(sprite.y).toBe(28);
        expect(sprite.scaleX).toBe(4);
        expect(sprite.scaleY).toBe(4);
        expect(impact).toHaveBeenCalledOnce();
        expect(config().duration).toBe(420);
    });

    it("uses world coordinates directly for a caster without a parent", () => {
        const sprite = createCaster();
        const {advance} = createEffect(slimeSplash, [{x: 300, y: 460, groundY: 620}], false,
            {x: 16, y: 28, groundY: 92, sprite});
        advance(230);
        expect(sprite.getBottomCenter()).toEqual({x: 300, y: 620});
    });
});

describe("Golem stone throw", () => {
    it("winds up, throws a rotating stone along an arc, and breaks it into chips at contact", () => {
        const sprite = createCaster();
        const {graphics, mageCenter, advance, impact, config} = createEffect(
            stoneThrow, [{x: 300, y: 460, groundY: 620}], false,
            {x: 1500, y: 520, groundY: 600, sprite});
        advance(60);
        expect(graphics.fillPoints.mock.lastCall[0][0]).toEqual({x: 1464, y: 456});
        advance(170);
        expect(graphics.fillRect).toHaveBeenCalledWith(879, 360, 12, 8);
        expect(sprite.angle).toBeLessThan(6);
        expect(mageCenter).not.toHaveBeenCalled();
        advance(279);
        expect(impact).not.toHaveBeenCalled();
        const rockCount = graphics.fillPoints.mock.calls.length;
        graphics.fillRect.mockClear();
        advance(280);
        expect(graphics.fillPoints).toHaveBeenCalledTimes(rockCount);
        expect(graphics.fillRect).toHaveBeenCalledTimes(8);
        expect(impact).toHaveBeenCalledOnce();
        config().onComplete();
        expect(sprite.angle).toBe(6);
        expect(impact).toHaveBeenCalledOnce();
        expect(config().duration).toBe(400);
    });
});

describe("Puff air blast", () => {
    it("compresses the caster with feet anchored and sends three staggered air rings toward the mage", () => {
        const sprite = createCaster();
        const {graphics, mageCenter, advance, impact, config} = createEffect(
            puffBlast, [{x: 300, y: 460, groundY: 620}], false,
            {x: 1500, y: 520, groundY: 600, sprite});
        advance(0);
        expect(graphics.strokeEllipse).toHaveBeenCalledTimes(2);
        expect(graphics.strokeEllipse).toHaveBeenCalledWith(1500, 520, 24, 64);
        graphics.strokeEllipse.mockClear();
        advance(44);
        expect(graphics.strokeEllipse).toHaveBeenCalledTimes(6);
        advance(80);
        expect(sprite.scaleY).toBeCloseTo(3.52);
        expect(sprite.getBottomCenter()).toEqual({x: 16, y: 92});
        advance(199);
        expect(impact).not.toHaveBeenCalled();
        advance(200);
        expect(graphics.strokeEllipse).toHaveBeenCalledWith(300, 460, 60, 112);
        expect(impact).toHaveBeenCalledOnce();
        expect(mageCenter).not.toHaveBeenCalled();
        config().onComplete();
        expect(sprite.x).toBe(16);
        expect(sprite.y).toBe(28);
        expect(sprite.scaleX).toBe(4);
        expect(sprite.scaleY).toBe(4);
        expect(impact).toHaveBeenCalledOnce();
        expect(config().duration).toBe(360);
    });
});

describe.each([groundImpact, slimeSplash, stoneThrow, puffBlast])("Enemy character pose cleanup", animation => {
    it("restores the original pose when an attack is interrupted", () => {
        const sprite = createCaster();
        const {advance, impact, config} = createEffect(animation, [{x: 300, y: 460, groundY: 620}], false,
            {x: 1500, y: 520, groundY: 600, sprite});
        advance(70);
        expect([sprite.x, sprite.y, sprite.scaleX, sprite.scaleY, sprite.angle]).not.toEqual([16, 28, 4, 4, 6]);
        config().onStop();
        config().onStop();
        expect(sprite.x).toBe(16);
        expect(sprite.y).toBe(28);
        expect(sprite.scaleX).toBe(4);
        expect(sprite.scaleY).toBe(4);
        expect(sprite.angle).toBe(6);
        expect(impact).not.toHaveBeenCalled();
    });

    it("does not animate or restore a destroyed casting character", () => {
        const sprite = createCaster();
        const {advance, config} = createEffect(animation, [{x: 300, y: 460, groundY: 620}], false,
            {x: 1500, y: 520, groundY: 600, sprite});
        advance(70);
        Object.assign(sprite, {scene: undefined, x: 90, y: 95, scaleX: 2, scaleY: 2, angle: 90});
        advance(200);
        config().onStop();
        expect(sprite.x).toBe(90);
        expect(sprite.y).toBe(95);
        expect(sprite.scaleX).toBe(2);
        expect(sprite.scaleY).toBe(2);
        expect(sprite.angle).toBe(90);
    });
});

describe.each([
    ["light beam", lightBeam], ["dark beam", darkBeam], ["magic bolts", magicBolts],
    ["magic rain", magicRain], ["sun wave", sunWave], ["goblin slash", slash],
    ["needle volley", needleVolley], ["ground impact", groundImpact], ["slime splash", slimeSplash],
    ["green beam", greenBeam], ["sand beam", sandBeam], ["magic swarm", magicSwarm],
    ["stone throw", stoneThrow], ["puff blast", puffBlast],
] as const)("%s lifecycle", (_name, animation) => {
    it("settles on a slow frame and cleans up exactly once", () => {
        const {impact, graphics, emitters, config} = createEffect(animation);
        config().onComplete();
        config().onComplete();
        config().onStop();
        expect(impact).toHaveBeenCalledOnce();
        if (emitters.length) emitters.forEach(emitter => expect(emitter.destroy).toHaveBeenCalledOnce());
        else expect(graphics.destroy).toHaveBeenCalledOnce();
        expect(config().duration).toBeLessThanOrEqual(450);
    });

    it("cleans up an interrupted effect without premature impact", () => {
        const {advance, impact, graphics, emitters, restore, config} = createEffect(animation);
        advance(10);
        config().onStop();
        config().onStop();
        expect(impact).not.toHaveBeenCalled();
        if (emitters.length) emitters.forEach(emitter => expect(emitter.destroy).toHaveBeenCalledOnce());
        else expect(graphics.destroy).toHaveBeenCalledOnce();
        if (animation === lightBeam) expect(restore).toHaveBeenCalledOnce();
    });

    it("reports a missing clock and cleans up explicitly", () => {
        const {graphics, emitters, restore, config} = createEffect(animation);
        expect(() => config().onUpdate({getValue: () => null})).toThrow("animation clock value");
        if (emitters.length) emitters.forEach(emitter => expect(emitter.destroy).toHaveBeenCalledOnce());
        else expect(graphics.destroy).toHaveBeenCalledOnce();
        if (animation === lightBeam) expect(restore).toHaveBeenCalledOnce();
    });

    it("handles an empty target list without leaking an effect", () => {
        const {advance, impact, emitters, config} = createEffect(animation, []);
        advance(config().duration);
        config().onComplete();
        expect(impact).toHaveBeenCalledOnce();
        expect(emitters).toHaveLength(0);
    });
});
