import { afterEach, describe, expect, it, vi } from "vitest";
import { fireball } from "../animations/fireball";
import type { CardAnimationPosition } from "../animations/card-animation-registry";
import type { MissionScene } from "../scenes/mission-scene";

type EffectConfig = {
    duration: number;
    onUpdate(tween: {getValue(): number | null}): void;
    onComplete(): void;
    onStop(): void;
};

function createEffect(targets: readonly CardAnimationPosition[] = [
    {x: 1500, y: 520, groundY: 600},
    {x: 1720, y: 400, groundY: 640},
]) {
    vi.stubGlobal("Phaser", {Textures: {FilterMode: {NEAREST: 0}}});
    const projectiles: Array<{
        x: number; y: number; alpha: number;
        setOrigin: ReturnType<typeof vi.fn>;
        setScale: ReturnType<typeof vi.fn>;
        setDepth: ReturnType<typeof vi.fn>;
        setRotation: ReturnType<typeof vi.fn>;
        texture: {setFilter: ReturnType<typeof vi.fn>};
        destroy: ReturnType<typeof vi.fn>;
    }> = [];
    let config: EffectConfig;
    const getCenter = vi.fn(() => ({x: 300, y: 460}));
    const scene: MissionScene = Object.create(null);
    Object.assign(scene, {
        playerGUI: {getCenter},
        add: {image: vi.fn((x: number, y: number) => {
            const sprite = {
                x, y, alpha: 1,
                setOrigin: vi.fn().mockReturnThis(),
                setScale: vi.fn().mockReturnThis(),
                setDepth: vi.fn().mockReturnThis(),
                setRotation: vi.fn().mockReturnThis(),
                texture: {setFilter: vi.fn()},
                destroy: vi.fn(),
            };
            projectiles.push(sprite);
            return sprite;
        })},
        tweens: {addCounter: vi.fn(options => { config = options; return {}; })},
    });
    const impact = vi.fn();
    fireball(scene, targets, impact);
    return {
        scene, projectiles, getCenter, targets, impact, config: () => config,
        advance: (elapsed: number) => config.onUpdate({getValue: () => elapsed}),
    };
}

afterEach(() => vi.unstubAllGlobals());

describe("Fireball projectile", () => {
    it("launches one pixel-filtered card sprite per target from the mage's world center", () => {
        const {scene, projectiles, getCenter} = createEffect();
        expect(getCenter).toHaveBeenCalledWith(undefined, true);
        expect(projectiles).toHaveLength(2);
        expect(scene.add.image).toHaveBeenCalledWith(300, 460, "fireball");
        for (const sprite of projectiles) {
            expect(sprite.setOrigin).toHaveBeenCalledWith(23 / 32, 8 / 32);
            expect(sprite.setScale).toHaveBeenCalledWith(4);
            expect(sprite.setDepth).toHaveBeenCalledWith(150);
            expect(sprite.texture.setFilter).toHaveBeenCalledWith(0);
        }
    });

    it("rotates the diagonal artwork so each flame head points along its own flight", () => {
        const {projectiles, targets} = createEffect();
        targets.forEach((target, index) => {
            expect(projectiles[index].setRotation).toHaveBeenCalledWith(Math.atan2(target.y - 460, target.x - 300) + Math.PI / 4);
        });
    });

    it("flies continuously to each target and delivers impact only when every projectile arrives", () => {
        const {projectiles, targets, advance, impact} = createEffect();
        advance(0);
        expect(projectiles.map(sprite => [sprite.x, sprite.y])).toEqual([[300, 460], [300, 460]]);
        advance(125);
        expect(projectiles.map(sprite => [sprite.x, sprite.y])).toEqual([[900, 490], [1010, 430]]);
        expect(projectiles.every(sprite => sprite.alpha === 1)).toBe(true);
        advance(249);
        expect(impact).not.toHaveBeenCalled();
        advance(250);
        expect(projectiles.map(sprite => [sprite.x, sprite.y])).toEqual(targets.map(target => [target.x, target.y]));
        expect(impact).toHaveBeenCalledOnce();
        advance(280);
        expect(impact).toHaveBeenCalledOnce();
    });

    it("holds the hit position while fading, then removes all projectiles within 320ms", () => {
        const {projectiles, targets, advance, config, impact} = createEffect();
        expect(config().duration).toBe(320);
        advance(285);
        expect(projectiles.every(sprite => sprite.alpha === 0.5)).toBe(true);
        expect(projectiles.map(sprite => [sprite.x, sprite.y])).toEqual(targets.map(target => [target.x, target.y]));
        advance(320);
        expect(projectiles.every(sprite => sprite.alpha === 0)).toBe(true);
        config().onComplete();
        expect(impact).toHaveBeenCalledOnce();
        for (const sprite of projectiles) expect(sprite.destroy).toHaveBeenCalledOnce();
    });

    it("applies impact once even when a slow frame skips arrival", () => {
        const {config, advance, impact, projectiles} = createEffect();
        advance(100);
        config().onComplete();
        config().onComplete();
        expect(impact).toHaveBeenCalledOnce();
        for (const sprite of projectiles) expect(sprite.destroy).toHaveBeenCalledOnce();
    });

    it("cleans up on interruption without applying premature damage", () => {
        const {config, advance, impact, projectiles} = createEffect();
        advance(100);
        config().onStop();
        config().onStop();
        expect(impact).not.toHaveBeenCalled();
        for (const sprite of projectiles) expect(sprite.destroy).toHaveBeenCalledOnce();
    });

    it("does not launch toward destroyed actors left in a global target list", () => {
        const sprite: Phaser.GameObjects.Sprite = Object.create(null);
        const {projectiles, impact, advance} = createEffect([
            {x: 1500, y: 520, groundY: 600},
            {x: 0, y: -100, groundY: 0, sprite},
        ]);
        expect(projectiles).toHaveLength(1);
        advance(250);
        expect(impact).toHaveBeenCalledOnce();
    });

    it("reports an unavailable clock explicitly and removes its projectiles without impact", () => {
        const {config, projectiles, impact} = createEffect();
        expect(() => config().onUpdate({getValue: () => null})).toThrow("Missing Fireball animation clock value");
        expect(impact).not.toHaveBeenCalled();
        for (const sprite of projectiles) expect(sprite.destroy).toHaveBeenCalledOnce();
    });
});
