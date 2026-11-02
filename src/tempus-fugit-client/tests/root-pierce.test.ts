import { afterEach, describe, expect, it, vi } from "vitest";
import { rootPierce } from "../animations/root-pierce";
import type { MissionScene } from "../scenes/mission-scene";

type EffectConfig = {
    duration: number;
    onUpdate(tween: {getValue(): number}): void;
    onComplete(): void;
    onStop(): void;
};

function createEffect() {
    vi.stubGlobal("Phaser", {Textures: {FilterMode: {NEAREST: 0}}});
    const roots: Array<{
        x: number; y: number; alpha: number;
        width: number; height: number; displayOriginY: number; scaleY: number;
        setOrigin: ReturnType<typeof vi.fn>;
        setScale: ReturnType<typeof vi.fn>;
        setDepth: ReturnType<typeof vi.fn>;
        setCrop: ReturnType<typeof vi.fn>;
        texture: {setFilter: ReturnType<typeof vi.fn>};
        destroy: ReturnType<typeof vi.fn>;
    }> = [];
    let config: EffectConfig;
    const scene: MissionScene = Object.create(null);
    Object.assign(scene, {
        add: {
            image: vi.fn((x: number, y: number) => {
                const sprite = {
                    x, y, alpha: 1, width: 32, height: 32, displayOriginY: 2, scaleY: 6,
                    setOrigin: vi.fn().mockReturnThis(),
                    setScale: vi.fn().mockReturnThis(),
                    setDepth: vi.fn().mockReturnThis(),
                    setCrop: vi.fn().mockReturnThis(),
                    texture: {setFilter: vi.fn()},
                    destroy: vi.fn(),
                };
                roots.push(sprite);
                return sprite;
            }),
        },
        tweens: {addCounter: vi.fn(options => { config = options; return {}; })},
    });
    const impact = vi.fn();
    const targets = [{x: 1500, y: 520, groundY: 600}, {x: 1720, y: 480, groundY: 640}];
    rootPierce(scene, targets, impact);
    return {
        scene, roots, impact, targets, config: () => config,
        advance: (elapsed: number) => config.onUpdate({getValue: () => elapsed}),
    };
}

afterEach(() => vi.unstubAllGlobals());

describe("Root pierce animation", () => {
    it("reuses the card sprite with pixel filtering, initially hidden beneath each target's feet", () => {
        const {scene, roots} = createEffect();
        expect(scene.add.image).toHaveBeenNthCalledWith(1, 1500, 696, "tree");
        expect(scene.add.image).toHaveBeenNthCalledWith(2, 1720, 736, "tree");
        for (const root of roots) {
            expect(root.setOrigin).toHaveBeenCalledWith(26 / 32, 2 / 32);
            expect(root.setScale).toHaveBeenCalledWith(6);
            expect(root.texture.setFilter).toHaveBeenCalledWith(0);
            expect(root.setCrop).toHaveBeenCalledWith(0, 0, 32, 0);
        }
    });

    it("rises continuously from below and applies impact exactly once at 120ms", () => {
        const {roots, targets, impact, advance, config} = createEffect();
        let previousY = roots[0].y;
        for (const elapsed of [0, 40, 80, 119]) {
            advance(elapsed);
            expect(roots[0].y).toBeLessThanOrEqual(previousY);
            previousY = roots[0].y;
            expect(impact).not.toHaveBeenCalled();
        }
        advance(120);
        expect(roots.map(root => root.y)).toEqual(targets.map(target => target.y));
        expect(impact).toHaveBeenCalledOnce();
        advance(160);
        config().onComplete();
        expect(impact).toHaveBeenCalledOnce();
    });

    it("clips roots to the ground for both short and tall targets", () => {
        const {roots, targets, advance} = createEffect();
        for (let elapsed = 0; elapsed <= 300; elapsed += 10) {
            advance(elapsed);
            roots.forEach((root, index) => {
                const height = root.setCrop.mock.lastCall[3];
                expect(height).toBeGreaterThanOrEqual(0);
                expect(height).toBeLessThanOrEqual(32);
                if (height > 0) {
                    const bottom = root.y - root.displayOriginY * root.scaleY + height * root.scaleY;
                    expect(bottom).toBeLessThanOrEqual(targets[index].groundY);
                }
            });
        }
    });

    it("never flickers, changes opacity, or shifts horizontally", () => {
        const {roots, targets, advance} = createEffect();
        for (let elapsed = 0; elapsed <= 300; elapsed += 10) {
            advance(elapsed);
            roots.forEach((root, index) => {
                expect(root.alpha).toBe(1);
                expect(root.x).toBe(targets[index].x);
            });
        }
    });

    it("holds the hit pose, retracts below the ground, and cleans up within 300ms", () => {
        const {roots, targets, config, advance} = createEffect();
        expect(config().duration).toBe(300);
        advance(180);
        expect(roots[0].y).toBe(targets[0].y);
        advance(240);
        expect(roots[0].y).toBeGreaterThan(targets[0].y);
        advance(300);
        expect(roots[0].y).toBeGreaterThan(targets[0].groundY);
        expect(roots[0].setCrop).toHaveBeenLastCalledWith(0, 0, 32, 0);
        config().onComplete();
        for (const root of roots) expect(root.destroy).toHaveBeenCalledOnce();
    });

    it("delivers impact if a slow frame skips the final update", () => {
        const {impact, config, advance} = createEffect();
        advance(50);
        config().onComplete();
        expect(impact).toHaveBeenCalledOnce();
    });

    it("cleans up without applying impact when stopped early", () => {
        const {roots, impact, config} = createEffect();
        config().onStop();
        expect(impact).not.toHaveBeenCalled();
        for (const root of roots) expect(root.destroy).toHaveBeenCalledOnce();
    });
});
