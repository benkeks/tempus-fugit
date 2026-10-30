import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Enemy } from "../objects/game-objects/enemy";
import { EnemyGUI } from "../objects/game-gui-objects/enemy-gui";
import type { CardDamageAnimation } from "../animations/card-animation-registry";

const {baseDestroy} = vi.hoisted(() => ({baseDestroy: vi.fn()}));
vi.mock("../objects/game-gui-objects/list-gui", () => ({
    ListGUI: class {
        destroy(fromScene?: boolean) { baseDestroy(fromScene); }
        isHovered() { return true; }
    },
}));
vi.mock("../objects/game-gui-objects/tool-tip", () => ({ToolTip: class {}}));
vi.mock("../objects/game-gui-objects/formula-gui", () => ({FormulaGUI: class {}}));
vi.mock("../game", () => ({GameInfo: {}}));

type DeathAnimation = {
    duration: number;
    targets?: unknown;
    alpha?: number;
    scaleX?: number;
    scaleY?: number;
    angle?: {from: number; to: number};
    onUpdate?: (tween: {getValue(): number}) => void;
    onComplete?: () => void;
};

function createEnemyGUI(key = "moleg", size = [64, 64], survivors = true) {
    const enemy = new Enemy(key, 100, 10, undefined, "", size);
    enemy.currentHP = 0;
    const other = new Enemy("other", 100, 10, undefined, "", [32, 32]);
    if (!survivors) other.currentHP = 0;
    const wave = [enemy, other];
    const getEnemies = vi.fn(() => wave);
    const rotations: DeathAnimation[] = [];
    const counters: DeathAnimation[] = [];
    const stop = vi.fn();
    const trackCombatAnimation = vi.fn(tween => tween);
    const getCardDamageAnimation = vi.fn((_enemy: Enemy): CardDamageAnimation | undefined => undefined);
    const timerRemove = vi.fn();
    const sprite = {angle: 0, anims: {stop: vi.fn()}};
    const toolTip = {enabled: true, faderTimer: {destroy: vi.fn()}};
    const infoParts: object[] = [];
    const remove = vi.fn();
    const killTweensOf = vi.fn();
    const info = {
        x: 1500, y: 600, scaleX: 1, scaleY: 1,
        setRotation: vi.fn().mockReturnThis(),
        setScale: vi.fn().mockReturnThis(),
        setDepth: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
    };
    const addContainer = vi.fn(() => info);
    const addText = vi.fn((x: number, y: number, text: string) => ({x, y, text, destroy: vi.fn()}));
    const addSprite = vi.fn(() => ({alpha: 0, destroy: vi.fn()}));
    const gui: EnemyGUI = Object.create(EnemyGUI.prototype);
    Object.assign(gui, {
        enemy,
        x: 1500,
        y: 600,
        angle: 0,
        sprite,
        toolTip,
        getAll: () => [sprite, toolTip, ...infoParts],
        getWorldTransformMatrix: () => ({tx: 1500, ty: 600, rotation: 0, scaleX: 1, scaleY: 1}),
        remove,
        scene: {
            add: {container: addContainer, text: addText, sprite: addSprite},
            tfgame: {getEnemies},
            time: {
                delayedCall: (delay: number, callback: () => void) => {
                    const timer = setTimeout(callback, delay);
                    return {remove: () => { timerRemove(); clearTimeout(timer); }};
                },
            },
            tweens: {
                add: (config: DeathAnimation) => { rotations.push(config); return {stop}; },
                addCounter: (config: DeathAnimation) => { counters.push(config); return {stop}; },
                killTweensOf,
            },
            trackCombatAnimation,
            getCardDamageAnimation,
        },
        getBounds: () => ({height: 320}),
        clearDragOutline: vi.fn(),
        disableInteractive: vi.fn(),
        removeEnemyListener: vi.fn(),
        removeGameStateListener: vi.fn(),
        updateEnemyAttributes: vi.fn(),
    });
    return {
        gui, enemy, other, getEnemies, rotations, counters, stop, trackCombatAnimation, timerRemove,
        infoParts, info, remove, addContainer, killTweensOf, toolTip, sprite, getCardDamageAnimation, addText, addSprite,
    };
}

beforeEach(() => {
    vi.useFakeTimers();
    baseDestroy.mockClear();
});
afterEach(() => vi.useRealTimers());

describe("Enemy hit reactions", () => {
    it("tracks a registered special reaction instead of the default recoil and blood, retaining damage text", async () => {
        const {gui, enemy, sprite, getCardDamageAnimation, trackCombatAnimation, rotations, addText, addSprite} = createEnemyGUI();
        enemy.currentHP = 88;
        const tween: Phaser.Tweens.Tween = Object.create(null);
        const damageAnimation = vi.fn(() => tween);
        getCardDamageAnimation.mockReturnValue(damageAnimation);
        await gui.enemyHpChanged(enemy, 100, 88);
        expect(damageAnimation).toHaveBeenCalledExactlyOnceWith(gui.scene, sprite);
        expect(trackCombatAnimation).toHaveBeenCalledExactlyOnceWith(tween);
        expect(rotations).toHaveLength(1);
        expect(addText.mock.calls[0][2]).toBe("12");
        expect(addSprite).not.toHaveBeenCalled();
        expect(gui.updateEnemyAttributes).toHaveBeenCalledOnce();
    });

    it("keeps the normal recoil, blood, and damage text for an unregistered reaction", async () => {
        const {gui, enemy, sprite, rotations, addText, addSprite, trackCombatAnimation} = createEnemyGUI();
        enemy.currentHP = 88;
        await gui.enemyHpChanged(enemy, 100, 88);
        expect(rotations[0]).toMatchObject({targets: sprite, angle: {from: 0, to: 10}, duration: 150});
        expect(trackCombatAnimation).toHaveBeenCalledOnce();
        expect(addText.mock.calls[0][2]).toBe("12");
        expect(addSprite).toHaveBeenCalledWith(1500, 630, "blood");
    });

    it("still performs a lethal hit's death animation alongside electrocution", async () => {
        const {gui, enemy, getCardDamageAnimation, counters, trackCombatAnimation} = createEnemyGUI("boss");
        const tween: Phaser.Tweens.Tween = Object.create(null);
        getCardDamageAnimation.mockReturnValue(() => tween);
        await gui.enemyHpChanged(enemy, 12, 0);
        expect(counters[0].duration).toBe(1200);
        expect(trackCombatAnimation).toHaveBeenCalledTimes(2);
        expect(gui.updateEnemyAttributes).not.toHaveBeenCalled();
    });

    it("does not play a damage reaction for healing", async () => {
        const {gui, enemy, getCardDamageAnimation, trackCombatAnimation, addSprite} = createEnemyGUI();
        enemy.currentHP = 100;
        await gui.enemyHpChanged(enemy, 88, 100);
        expect(getCardDamageAnimation).not.toHaveBeenCalled();
        expect(trackCombatAnimation).not.toHaveBeenCalled();
        expect(addSprite).not.toHaveBeenCalled();
        expect(gui.updateEnemyAttributes).toHaveBeenCalledOnce();
    });
});

describe("Enemy defeat presentation", () => {
    it("anchors card effects to the sprite center in world space, not its parent-local position", () => {
        const {gui} = createEnemyGUI();
        const getCenter = vi.fn(() => ({x: 1500, y: 520}));
        Object.assign(gui, {sprite: {getCenter}});
        expect(gui.getEffectPosition()).toEqual({x: 1500, y: 520});
        expect(getCenter).toHaveBeenCalledWith(undefined, true);
    });

    it("removes a large defeated enemy after exactly one second while its wave has survivors", () => {
        const {gui, rotations} = createEnemyGUI();
        gui.die();
        expect(rotations[0].angle.to).toBe(90);
        rotations[0].onComplete();
        vi.advanceTimersByTime(999);
        expect(baseDestroy).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(baseDestroy).toHaveBeenCalledExactlyOnceWith(true);
    });

    it("keeps the final large enemy's pose when the wave is already cleared", () => {
        const {gui, rotations} = createEnemyGUI("moleg", [64, 64], false);
        gui.die();
        rotations[0].onComplete();
        vi.advanceTimersByTime(2000);
        expect(baseDestroy).not.toHaveBeenCalled();
    });

    it("keeps the final pose if the remaining enemies die during the delay", () => {
        const {gui, other, getEnemies} = createEnemyGUI();
        gui.die();
        other.currentHP = 0;
        // A pending wave transition must not mistake the next wave for survivors.
        getEnemies.mockReturnValue([new Enemy("next", 100, 10, undefined, "", [32, 32])]);
        vi.advanceTimersByTime(1000);
        expect(baseDestroy).not.toHaveBeenCalled();
    });

    it.each([true, false])("spirals the final boss above the screen with survivors=%s", survivors => {
        const {gui, counters, rotations, trackCombatAnimation} = createEnemyGUI("boss", [32, 64], survivors);
        gui.die();
        expect(rotations).toHaveLength(0);
        expect(counters).toHaveLength(1);
        expect(counters[0].duration).toBe(1200);
        expect(trackCombatAnimation).toHaveBeenCalledOnce();
        counters[0].onUpdate({getValue: () => 0.25});
        expect(gui.x).not.toBe(1500);
        expect(gui.y).toBeLessThan(600);
        expect(gui.angle).toBe(270);
        counters[0].onUpdate({getValue: () => 1});
        expect(gui.y + gui.getBounds().height).toBeLessThanOrEqual(0);
        expect(gui.angle).toBe(1080);
        expect(baseDestroy).not.toHaveBeenCalled();
        counters[0].onComplete();
        expect(baseDestroy).toHaveBeenCalledOnce();
    });

    it("preserves the small-enemy knock-away animation", () => {
        const {gui, counters, rotations} = createEnemyGUI("goblin1", [32, 32]);
        gui.die();
        expect(counters[0].duration).toBe(520);
        expect(rotations[0].duration).toBe(520);
        rotations[0].onComplete();
        expect(baseDestroy).toHaveBeenCalledOnce();
    });

    it("cancels a pending removal when the layout disposes the corpse early", () => {
        const {gui, timerRemove} = createEnemyGUI();
        gui.die();
        gui.die();
        expect(timerRemove).toHaveBeenCalledOnce();
        vi.advanceTimersByTime(1000);
        expect(baseDestroy).toHaveBeenCalledOnce();
    });

    it("stops a boss animation on early destruction", () => {
        const {gui, stop} = createEnemyGUI("boss", [32, 64]);
        gui.die();
        gui.destroy(true);
        gui.destroy(true);
        expect(stop).toHaveBeenCalledOnce();
        expect(baseDestroy).toHaveBeenCalledOnce();
    });

    it("does not reposition a defeated enemy during a phase change", () => {
        const {gui, counters} = createEnemyGUI("boss", [32, 64]);
        gui.die();
        counters[0].onUpdate({getValue: () => 0.5});
        const position = {x: gui.x, y: gui.y};
        gui.reposition();
        expect({x: gui.x, y: gui.y}).toEqual(position);
    });

    it.each(["goblin1", "moleg", "boss"])("shrinks and fades %s's complete info separately from its sprite", key => {
        const {gui, infoParts, info, rotations, remove, addContainer, toolTip} = createEnemyGUI(key);
        infoParts.push({name: "hpAttack"}, {name: "formula"}, {name: "attackDescription"}, {name: "background"});
        gui.die();

        expect(remove).toHaveBeenCalledExactlyOnceWith(infoParts);
        expect(addContainer).toHaveBeenCalledExactlyOnceWith(1500, 600, infoParts);
        expect(rotations[0]).toMatchObject({
            targets: info, alpha: 0, scaleX: 0.5, scaleY: 0.5, duration: 180,
        });
        expect(toolTip.enabled).toBe(false);
        gui.x += 100;
        gui.y -= 200;
        expect({x: info.x, y: info.y}).toEqual({x: 1500, y: 600});
        rotations[0].onComplete();
        expect(info.destroy).toHaveBeenCalledOnce();
        expect(baseDestroy).not.toHaveBeenCalled();
    });

    it("cleans up detached info and its tween when the enemy is destroyed early", () => {
        const {gui, infoParts, info, killTweensOf} = createEnemyGUI();
        infoParts.push({name: "hpAttack"});
        gui.die();
        gui.destroy(true);
        gui.destroy(true);
        expect(killTweensOf).toHaveBeenCalledExactlyOnceWith(info);
        expect(info.destroy).toHaveBeenCalledOnce();
    });

    it("rejects defeated enemies as targets before and throughout their death animation", () => {
        const {gui, enemy} = createEnemyGUI();
        enemy.currentHP = 100;
        expect(gui.isHovered(1500, 580)).toBe(true);

        enemy.currentHP = 0;
        expect(gui.isHovered(1500, 580)).toBe(false);
        expect(() => gui.setDragOutline(0xffffff)).not.toThrow();
        gui.die();
        expect(gui.isHovered(1500, 580)).toBe(false);
    });
});
