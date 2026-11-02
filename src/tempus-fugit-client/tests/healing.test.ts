import { afterEach, describe, expect, it, vi } from "vitest";
import { healing } from "../animations/healing";
import { Card } from "../objects/game-objects/card";
import type { MissionScene } from "../scenes/mission-scene";

type EffectConfig = {
    duration: number;
    onUpdate(tween: {getValue(): number}): void;
    onComplete(): void;
    onStop(): void;
};

function createEffect(strength = 40, isStand = false) {
    vi.stubGlobal("Phaser", {Textures: {FilterMode: {NEAREST: 0}}});
    const card = new Card("Heal", "", "", "n", Card.PLAYER, isStand, 4, "");
    card.healing = strength;
    const source = {
        x: isStand ? 200 : 0, y: -3, active: true,
        getCenter: vi.fn((): {x: number; y: number} => ({
            x: source.x + (isStand ? 500 : 960),
            y: source.y + (isStand ? 600 : 675),
        })),
    };
    const restore = vi.fn(() => { source.y = -3; });
    const beginEffect = vi.fn(() => ({sprite: source, restore}));
    const hearts: Array<{
        x: number; y: number;
        setScale: ReturnType<typeof vi.fn>;
        setDepth: ReturnType<typeof vi.fn>;
        setVisible: ReturnType<typeof vi.fn>;
        texture: {setFilter: ReturnType<typeof vi.fn>};
        destroy: ReturnType<typeof vi.fn>;
    }> = [];
    let config: EffectConfig;
    const scene: MissionScene = Object.create(null);
    Object.assign(scene, {
        cardChannel: {book: source},
        standGUI: {beginEffect},
        add: {image: vi.fn((x: number, y: number) => {
            const heart = {
                x, y,
                setScale: vi.fn().mockReturnThis(),
                setDepth: vi.fn().mockReturnThis(),
                setVisible: vi.fn().mockReturnThis(),
                texture: {setFilter: vi.fn()},
                destroy: vi.fn(),
            };
            hearts.push(heart);
            return heart;
        })},
        tweens: {addCounter: vi.fn(options => { config = options; return {}; })},
    });
    const impact = vi.fn();
    const target = {x: 300, y: 500, groundY: 620};
    healing(scene, [target], impact, card);
    return {
        scene, card, hearts, source, restore, beginEffect, impact, target, config: () => config,
        advance: (elapsed: number) => config.onUpdate({getValue: () => elapsed}),
    };
}

afterEach(() => vi.unstubAllGlobals());

describe("Healing heart stream", () => {
    it.each([[40, 3], [50, 4], [100, 8]])("emits %s HP as %s pixel hearts in a longer stream", (strength, count) => {
        const {hearts, scene, config} = createEffect(strength);
        expect(hearts).toHaveLength(count);
        expect(config().duration).toBe(260 + (count - 1) * 38);
        for (const heart of hearts) {
            expect(heart.texture.setFilter).toHaveBeenCalledWith(0);
            expect(heart.setScale).toHaveBeenCalledWith(1.5);
            expect(heart.setVisible).toHaveBeenCalledWith(false);
        }
        expect(scene.add.image).toHaveBeenCalledWith(0, 0, "heartFont");
    });

    it("starts at the book's world center, staggers hearts, and does not move the book", () => {
        const {hearts, source, beginEffect, advance} = createEffect();
        advance(0);
        expect([hearts[0].x, hearts[0].y]).toEqual([960, 672]);
        expect(source.getCenter).toHaveBeenCalledWith(undefined, true);
        expect(hearts[0].setVisible).toHaveBeenLastCalledWith(true);
        expect(hearts[1].setVisible).toHaveBeenLastCalledWith(false);
        advance(38);
        expect([hearts[1].x, hearts[1].y]).toEqual([960, 672]);
        expect(hearts[1].setVisible).toHaveBeenLastCalledWith(true);
        expect(hearts[2].setVisible).toHaveBeenLastCalledWith(false);
        expect(source.y).toBe(-3);
        expect(beginEffect).not.toHaveBeenCalled();
    });

    it("curves toward the mage and heals exactly once on the first arrival", () => {
        const {hearts, impact, target, advance, config} = createEffect();
        advance(130);
        expect(hearts[0].x).toBe(630);
        expect(hearts[0].y).toBe(531);
        expect(impact).not.toHaveBeenCalled();
        advance(259);
        expect(impact).not.toHaveBeenCalled();
        advance(260);
        expect([hearts[0].x, hearts[0].y]).toEqual([target.x, target.y]);
        expect(impact).toHaveBeenCalledOnce();
        advance(300);
        expect(hearts[0].setVisible).toHaveBeenLastCalledWith(false);
        config().onComplete();
        expect(impact).toHaveBeenCalledOnce();
    });

    it("emits from the specific stand, bobs it up and down, and bends the stream with it", () => {
        const {card, hearts, source, beginEffect, advance, config, restore} = createEffect(100, true);
        expect(beginEffect).toHaveBeenCalledWith(card);
        advance(0);
        expect([hearts[0].x, hearts[0].y]).toEqual([700, 597]);
        advance(config().duration / 4);
        expect(source.y).toBeCloseTo(-27);
        const progress = config().duration / 4 / 260;
        expect(hearts[0].y).toBe(Math.round(573 + (500 - 573) * progress - Math.sin(Math.PI * progress) * 55));
        advance(config().duration * 3 / 4);
        expect(source.y).toBeCloseTo(21);
        expect(source.x).toBe(200);
        config().onComplete();
        expect(source.y).toBe(-3);
        expect(restore).toHaveBeenCalledOnce();
    });

    it("delivers impact and destroys every heart when a slow frame skips completion", () => {
        const {hearts, impact, config} = createEffect();
        config().onComplete();
        expect(impact).toHaveBeenCalledOnce();
        for (const heart of hearts) expect(heart.destroy).toHaveBeenCalledOnce();
    });

    it("cleans up and restores the stand on interruption without applying a premature heal", () => {
        const {hearts, impact, config, advance, source, restore} = createEffect(50, true);
        advance(100);
        expect(source.y).not.toBe(-3);
        config().onStop();
        expect(impact).not.toHaveBeenCalled();
        expect(source.y).toBe(-3);
        expect(restore).toHaveBeenCalledOnce();
        for (const heart of hearts) expect(heart.destroy).toHaveBeenCalledOnce();
    });

    it("rejects missing healing strength and missing mage targets explicitly", () => {
        const {scene, card, target} = createEffect();
        expect(() => healing(scene, [target], vi.fn())).toThrow("Missing healing strength");
        card.healing = 0;
        expect(() => healing(scene, [target], vi.fn(), card)).toThrow("Missing healing strength");
        card.healing = 40;
        expect(() => healing(scene, [], vi.fn(), card)).toThrow("requires one mage target");
    });
});
