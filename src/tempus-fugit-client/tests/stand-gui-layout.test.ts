import { afterAll, describe, expect, it, vi } from "vitest";
import { Card } from "../objects/game-objects/card";
import { CardAnimationRegistry } from "../animations/card-animation-registry";
import { StandGUILayout } from "../objects/game-gui-objects/stand-gui-layout";

vi.hoisted(() => vi.stubGlobal("Phaser", {GameObjects: {Container: class {}}}));
vi.mock("../objects/game-gui-objects/stand-description-gui", () => ({StandDescriptionGUI: class {}}));
afterAll(() => vi.unstubAllGlobals());

function createStands() {
    const first = new Card("Heal stand", "", "", "n", Card.PLAYER, true, 4, "");
    first.animation = "healing";
    const second = first.copy();
    const sprites = [0, 200].map(x => ({x, y: -3, angle: 0, active: true}));
    const idleTweens = sprites.map(() => ({pause: vi.fn(), resume: vi.fn(), stop: vi.fn()}));
    const createAttackAnimation = vi.fn();
    const cardAnimations = new CardAnimationRegistry();
    cardAnimations.register("healing", vi.fn());
    cardAnimations.register("light-beam", vi.fn());
    const gui: StandGUILayout = Object.create(StandGUILayout.prototype);
    Object.assign(gui, {
        stands: [first, second],
        spritedStands: [first, second],
        elementList: sprites,
        idleTweens,
        hoverElementList: [null, null],
        roundList: [null, null],
        previewTweens: [null, null],
        scene: {
            createAttackAnimation, cardAnimations,
            tweens: {add: vi.fn()},
            trackCombatAnimation: vi.fn(),
            tfgame: {gameState: {}},
        },
    });
    return {gui, first, second, sprites, idleTweens, createAttackAnimation, cardAnimations};
}

describe("Stand effect sources", () => {
    it("selects stands by identity, including two copies of the same card", () => {
        const {gui, first, second, sprites, idleTweens} = createStands();
        const effect = gui.beginEffect(second);
        expect(effect.sprite).toBe(sprites[1]);
        expect(idleTweens[1].pause).toHaveBeenCalledOnce();
        expect(idleTweens[0].pause).not.toHaveBeenCalled();
        sprites[1].y = -25;
        effect.restore();
        expect(sprites[1].y).toBe(-3);
        expect(idleTweens[1].resume).toHaveBeenCalledOnce();
        expect(() => gui.beginEffect(first.copy())).toThrow("Missing stand animation source");
    });

    it("does not restore or resume an already destroyed source", () => {
        const {gui, first, sprites, idleTweens} = createStands();
        const effect = gui.beginEffect(first);
        sprites[0].active = false;
        effect.restore();
        expect(idleTweens[0].resume).not.toHaveBeenCalled();
    });

    it.each(["healing", "light-beam"])("lets %s own the cast instead of playing the horizontal attack", animation => {
        const {gui, first, createAttackAnimation} = createStands();
        first.animation = animation;
        gui.Attacking(first, 0);
        expect(createAttackAnimation).not.toHaveBeenCalled();
    });

    it.each([undefined, "root-pierce", "not-implemented"])("preserves ordinary stand movement for %s", animation => {
        const {gui, first, sprites, createAttackAnimation} = createStands();
        first.animation = animation;
        gui.Attacking(first, 0);
        expect(createAttackAnimation).toHaveBeenCalledWith(gui.scene, sprites[0], "+");
    });

    it.each(["healing", "light-beam"])("preserves default movement when %s has no registered implementation", animation => {
        const {gui, first, createAttackAnimation} = createStands();
        first.animation = animation;
        Object.assign(gui.scene, {cardAnimations: new CardAnimationRegistry()});
        gui.Attacking(first, 0);
        expect(createAttackAnimation).toHaveBeenCalledOnce();
    });

    it("stops idle tweens when their stand slots disappear", () => {
        const {gui, idleTweens} = createStands();
        const tweens = [...idleTweens];
        gui.updateStandGUI([null, null]);
        for (const tween of tweens) expect(tween.stop).toHaveBeenCalledOnce();
    });
});
