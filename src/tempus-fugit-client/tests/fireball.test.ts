import { afterEach, describe, expect, it, vi } from "vitest";
import { fireball, incinerate } from "../animations/fireball";
import type { CardAnimation, CardAnimationPosition } from "../animations/card-animation-registry";
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
], animation: CardAnimation = fireball, caster?: CardAnimationPosition) {
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
        cameras: {main: {width: 1920, height: 1080}},
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
    animation(scene, targets, impact, undefined, caster);
    return {
        scene, projectiles, getCenter, targets, impact, config: () => config,
        advance: (elapsed: number) => config.onUpdate({getValue: () => elapsed}),
    };
}

afterEach(() => vi.unstubAllGlobals());

describe("Fireball projectile", () => {
    it("reverses the projectile from an enemy's world position toward the mage", () => {
        const {projectiles, advance, getCenter, impact, scene} = createEffect(
            [{x: 300, y: 460, groundY: 620}], fireball, {x: 1500, y: 520, groundY: 600});
        expect(getCenter).not.toHaveBeenCalled();
        expect(scene.add.image).toHaveBeenCalledWith(1500, 520, "fireball");
        expect(projectiles[0].setRotation).toHaveBeenCalledWith(Math.atan2(-60, -1200) + Math.PI / 4);
        advance(125);
        expect([projectiles[0].x, projectiles[0].y]).toEqual([900, 490]);
        expect(impact).not.toHaveBeenCalled();
        advance(250);
        expect([projectiles[0].x, projectiles[0].y]).toEqual([300, 460]);
        expect(impact).toHaveBeenCalledOnce();
    });

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

    describe("Incinerate projectiles", () => {
        it("launches exactly five pixel-art fireballs per enemy from five distinct incoming directions", () => {
            const {projectiles, targets, getCenter} = createEffect(undefined, incinerate);
            expect(getCenter).not.toHaveBeenCalled();
            expect(projectiles).toHaveLength(10);
            targets.forEach((target, index) => {
                const incoming = projectiles.slice(index * 5, (index + 1) * 5);
                const directions = incoming.map(sprite => Math.atan2(target.y - sprite.y, target.x - sprite.x));
                expect(new Set(directions).size).toBe(5);
                expect(incoming.some(sprite => sprite.x < target.x)).toBe(true);
                expect(incoming.some(sprite => sprite.x > target.x)).toBe(true);
                expect(incoming.some(sprite => sprite.y < target.y)).toBe(true);
                expect(incoming.some(sprite => sprite.y > target.y)).toBe(true);
                incoming.forEach(sprite => {
                    expect(sprite.setScale).toHaveBeenCalledWith(3);
                    expect(sprite.texture.setFilter).toHaveBeenCalledWith(0);
                    // Origins are rounded for pixel rendering; rotation uses their unrounded coordinates.
                    const rotation = sprite.setRotation.mock.calls[0][0];
                    expect(rotation).toBeCloseTo(Math.atan2(target.y - sprite.y, target.x - sprite.x) + Math.PI / 4, 2);
                });
            });
        });

        it("converges all five fireballs at 250ms but delivers only one action impact", () => {
            const {projectiles, targets, advance, impact, config} = createEffect(undefined, incinerate);
            const origins = projectiles.map(sprite => ({x: sprite.x, y: sprite.y}));
            advance(125);
            projectiles.forEach((sprite, index) => {
                expect(sprite.x).toBeCloseTo((origins[index].x + targets[Math.floor(index / 5)].x) / 2, 0);
            });
            advance(249);
            expect(impact).not.toHaveBeenCalled();
            advance(250);
            targets.forEach((target, index) => {
                expect(projectiles.slice(index * 5, (index + 1) * 5).map(sprite => [sprite.x, sprite.y]))
                    .toEqual(Array.from({length: 5}, () => [target.x, target.y]));
            });
            expect(impact).toHaveBeenCalledOnce();
            config().onComplete();
            config().onComplete();
            expect(impact).toHaveBeenCalledOnce();
            projectiles.forEach(sprite => expect(sprite.destroy).toHaveBeenCalledOnce());
        });

        it("keeps incoming fireballs above the lower interface and inside the horizontal viewport", () => {
            const {projectiles} = createEffect([{x: 1780, y: 570, groundY: 640}], incinerate);
            expect(projectiles.every(sprite => sprite.x >= 64 && sprite.x <= 1856 && sprite.y <= 656)).toBe(true);
        });

        it("removes all five approaches if the cast is interrupted", () => {
            const {projectiles, advance, impact, config} = createEffect(undefined, incinerate);
            advance(100);
            config().onStop();
            config().onStop();
            expect(impact).not.toHaveBeenCalled();
            projectiles.forEach(sprite => expect(sprite.destroy).toHaveBeenCalledOnce());
        });
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
