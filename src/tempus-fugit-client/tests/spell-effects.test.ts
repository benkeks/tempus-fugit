import { afterEach, describe, expect, it, vi } from "vitest";
import { lightBeam, darkBeam } from "../animations/beam";
import { magicBolts, magicRain } from "../animations/magic-particles";
import { sunWave } from "../animations/sun-wave";
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
], isStand = true) {
    vi.stubGlobal("Phaser", {BlendModes: {ADD: 1, NORMAL: 0}});
    const graphics = {
        setDepth: vi.fn().mockReturnThis(), setBlendMode: vi.fn().mockReturnThis(),
        lineStyle: vi.fn().mockReturnThis(), lineBetween: vi.fn().mockReturnThis(),
        fillStyle: vi.fn().mockReturnThis(), fillCircle: vi.fn().mockReturnThis(),
        fillEllipse: vi.fn().mockReturnThis(), strokeEllipse: vi.fn().mockReturnThis(),
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
    animation(scene, targets, impact, card);
    return {
        scene, card, targets, graphics, emitters, mageCenter, standCenter, beginEffect, restore, impact,
        config: () => config,
        advance: (elapsed: number) => config.onUpdate({getValue: () => elapsed}),
    };
}

afterEach(() => vi.unstubAllGlobals());

describe("Light and dark beams", () => {
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

    it.each([lightBeam, darkBeam])("waits until the beam reaches its receivers before impact", animation => {
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

describe.each([
    ["light beam", lightBeam], ["dark beam", darkBeam], ["magic bolts", magicBolts],
    ["magic rain", magicRain], ["sun wave", sunWave],
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
