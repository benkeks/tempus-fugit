import { afterEach, describe, expect, it, vi } from "vitest";
import { lightning } from "../animations/lightning";
import type { MissionScene } from "../scenes/mission-scene";

type EffectConfig = {
    duration: number;
    onUpdate(tween: {getValue(): number}): void;
    onComplete(): void;
    onStop(): void;
};

function createEffect() {
    vi.stubGlobal("Phaser", {Textures: {FilterMode: {NEAREST: 0}}});
    const bolts: Array<{
        x: number; y: number; alpha: number;
        setOrigin: ReturnType<typeof vi.fn>;
        setScale: ReturnType<typeof vi.fn>;
        setDepth: ReturnType<typeof vi.fn>;
        texture: {setFilter: ReturnType<typeof vi.fn>};
        destroy: ReturnType<typeof vi.fn>;
    }> = [];
    let config: EffectConfig;
    const scene: MissionScene = Object.create(null);
    const tween = {};
    Object.assign(scene, {
        add: {
            image: vi.fn((x: number, y: number) => {
                const bolt = {
                    x, y, alpha: 1,
                    setOrigin: vi.fn().mockReturnThis(),
                    setScale: vi.fn().mockReturnThis(),
                    setDepth: vi.fn().mockReturnThis(),
                    texture: {setFilter: vi.fn()},
                    destroy: vi.fn(),
                };
                bolts.push(bolt);
                return bolt;
            }),
        },
        tweens: {
            addCounter: vi.fn(options => { config = options; return tween; }),
        },
    });
    const impact = vi.fn();
    const targets = [{x: 1500, y: 520}, {x: 1720, y: 500}];
    lightning(scene, targets, impact);
    return {
        scene, bolts, impact, targets,
        config: () => config,
        advance: (elapsed: number) => config.onUpdate({getValue: () => elapsed}),
    };
}

afterEach(() => vi.unstubAllGlobals());

describe("Pixel lightning", () => {
    it("uses the card artwork and pixel filtering for each resolved target", () => {
        const {scene, bolts} = createEffect();
        expect(bolts).toHaveLength(6);
        expect(scene.add.image).toHaveBeenNthCalledWith(1, 1500, 360, "lightning_strike");
        expect(scene.add.image).toHaveBeenNthCalledWith(2, 1472, 360, "lightning_strike");
        expect(scene.add.image).toHaveBeenNthCalledWith(3, 1528, 360, "lightning_strike");
        expect(scene.add.image).toHaveBeenNthCalledWith(4, 1720, 340, "lightning_strike");
        for (const [index, bolt] of bolts.entries()) {
            expect(bolt.setOrigin).toHaveBeenCalledWith(0.25, 29 / 32);
            expect(bolt.setScale).toHaveBeenCalledWith([10, 9, 8][index % 3]);
            expect(bolt.texture.setFilter).toHaveBeenCalledWith(0);
        }
    });

    it("connects from above at 110ms, fades, and finishes within 300ms", () => {
        const {bolts, targets, impact, config, advance} = createEffect();
        expect(config().duration).toBe(280);
        expect(config().duration).toBeLessThan(300);
        advance(109);
        expect(impact).not.toHaveBeenCalled();
        expect(bolts[0].y).toBeLessThan(targets[0].y);
        advance(110);
        expect(impact).toHaveBeenCalledOnce();
        expect(bolts.map(bolt => bolt.y)).toEqual([520, 520, 520, 500, 500, 500]);
        advance(220);
        expect(bolts[0].alpha).toBe(0);
        expect(bolts[1].alpha).toBeGreaterThan(0);
        expect(bolts[1].alpha).toBeLessThan(1);
        advance(280);
        config().onComplete();
        expect(impact).toHaveBeenCalledOnce();
        for (const bolt of bolts) expect(bolt.destroy).toHaveBeenCalledOnce();
    });

    it("staggers independent flickers and stepped offsets without moving the main strike off target", () => {
        const {bolts, advance, impact} = createEffect();
        advance(0);
        expect(bolts.slice(0, 3).map(bolt => bolt.alpha)).toEqual([1, 0, 0]);
        const sideX = bolts[1].x;
        advance(24);
        expect(bolts.slice(0, 3).map(bolt => bolt.alpha)).toEqual([0, 1, 0]);
        advance(48);
        expect(bolts.slice(0, 3).map(bolt => bolt.alpha)).toEqual([1, 0, 1]);
        expect(bolts[1].x).not.toBe(sideX);
        expect(bolts[0].x).toBe(1500);
        expect(bolts[3].x).toBe(1720);
        expect(impact).not.toHaveBeenCalled();
    });

    it("delivers impact once even if a slow frame skips the final update", () => {
        const {impact, config, advance} = createEffect();
        advance(50);
        config().onComplete();
        expect(impact).toHaveBeenCalledOnce();
    });

    it("cleans up temporary objects when the tween stops", () => {
        const {bolts, impact, config} = createEffect();
        config().onStop();
        expect(impact).not.toHaveBeenCalled();
        for (const bolt of bolts) expect(bolt.destroy).toHaveBeenCalledOnce();
    });
});
