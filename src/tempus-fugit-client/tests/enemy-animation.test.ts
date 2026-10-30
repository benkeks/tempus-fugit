import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Mission } from "../mechanics/mission";
import { Enemy } from "../objects/game-objects/enemy";
import { Player } from "../objects/game-objects/player";
import { Card } from "../objects/game-objects/card";
import { Deck } from "../objects/game-objects/deck";
import type { CardActionImpact, CardActionSource, CardActionTarget } from "../mechanics/card-action-animation";

const enemiesJSON = readFileSync("src/tempus-fugit-client/json/enemies.json", "utf8");
let previousEnemies: typeof Enemy.enemies;

function loadEnemies(json = enemiesJSON) {
    const scene: Phaser.Scene = Object.create(null);
    Object.assign(scene, {load: {spritesheet: vi.fn()}});
    Enemy.createFromJSON(json, scene);
}

function createBattle(key = "slime3") {
    const mission = new Mission();
    mission.player = new Player("Wizard", 500, 10);
    mission.deck = new Deck();
    const enemy = Enemy.enemies[key].copy();
    const other = Enemy.enemies.slime2.copy();
    mission.enemies = [[enemy, other]];
    mission.curPhase = Mission.ENEMY_PHASE;
    mission.gameState.evaluate = () => true;
    const casts: Array<{
        card: Card; targets: readonly CardActionTarget[]; source: CardActionSource; repeat: boolean;
        impact: CardActionImpact; complete: () => void;
    }> = [];
    const play = vi.fn((card: Card, targets: readonly CardActionTarget[], impact: CardActionImpact,
        complete: () => void, source: CardActionSource, repeat = false) => {
        casts.push({card, targets, impact, complete, source, repeat});
    });
    mission.cardActionAnimator = {
        has: key => animatedEnemies.some(([, animation]) => animation === key),
        play,
    };
    const attacking = vi.fn();
    enemy.listener.push({Attacking: attacking, enemyHpChanged: vi.fn(), baseAttackChanged: vi.fn()});
    return {mission, enemy, other, casts, play, attacking};
}

beforeEach(() => {
    vi.useFakeTimers();
    previousEnemies = Enemy.enemies;
    Enemy.enemies = {};
    loadEnemies();
});

afterEach(() => {
    Enemy.enemies = previousEnemies;
    vi.useRealTimers();
});

const animatedEnemies = [
    ["slime1", "slime-splash", 5],
    ["slime_mother", "slime-splash", 20],
    ["slime2", "magic-bolts", 10],
    ["slime3", "fireball", 15],
    ["ghost", "dark-beam", 25],
    ["pharaoh_yeah", "dark-beam", 30],
    ["goblin1", "slash", 10],
    ["goblin2", "slash", 15],
    ["goblin3", "slash", 15],
    ["goblin_general1", "slash", 20],
    ["goblin_general2", "slash", 50],
    ["cactus1", "needle-volley", 15],
    ["cactus2", "needle-volley", 15],
    ["kingtus", "needle-volley", 28],
    ["moleg", "stone-throw", 25],
    ["wormling", "ground-impact", 15],
    ["darude_sandworm", "ground-impact", 25],
    ["snake", "green-beam", 17],
    ["mummy", "sand-beam", 20],
    ["bgpuff1", "puff-blast", 25],
    ["bgpuff2", "puff-blast", 25],
    ["jkpuff", "puff-blast", 25],
    ["stand1", "dark-beam", 35],
    ["stand2", "magic-bolts", 35],
    ["boss", "magic-swarm", 50],
] as const;

describe("Enemy animation metadata", () => {
    it.each(animatedEnemies)("loads and preserves %s's %s effect when copying the enemy", (key, animation) => {
        const enemy = Enemy.enemies[key];
        expect(enemy.specialAttack.animation).toBe(animation);
        expect(enemy.copy().specialAttack.animation).toBe(animation);
        expect(enemy.specialAttack.copy().animation).toBe(animation);
    });

    it.each([null, "", " ", 5, {}])("rejects malformed enemy animation metadata %s", animation => {
        const json = JSON.parse(enemiesJSON);
        json.enemies[0].specialAttack.animation = animation;
        expect(() => loadEnemies(JSON.stringify(json))).toThrow("Invalid animation for card Slime_special_attack");
    });

    it("provides animation metadata for every enemy in the real catalog", () => {
        expect(Object.keys(Enemy.enemies).sort()).toEqual(animatedEnemies.map(([key]) => key).sort());
        expect(animatedEnemies).toHaveLength(25);
        expect(Object.values(Enemy.enemies).filter(enemy => enemy.specialAttack.animation)).toHaveLength(animatedEnemies.length);
    });
});

describe("Enemy special resolution", () => {
    it.each(animatedEnemies)("delays %s's damage until %s impact, applying exactly %i damage once", (key, _animation, damage) => {
        const {mission, enemy, other, casts, play, attacking} = createBattle(key);
        enemy.performTurn(mission);
        expect(play).toHaveBeenCalledExactlyOnceWith(
            enemy.specialAttack, [mission.player], expect.any(Function), expect.any(Function), enemy, true);
        expect(mission.player.currentHP).toBe(500);
        expect(mission.cardActionInProgress).toBe(true);
        expect(mission.active).toBe(false);
        expect(mission.player.active).toBe(false);
        expect(mission.gameState.active).toBe(false);
        expect(attacking).toHaveBeenCalledWith(enemy, true);
        casts[0].impact();
        casts[0].impact();
        expect(mission.player.currentHP).toBe(500 - damage);
        expect(other.currentHP).toBe(other.maxHP);
        expect(mission.cardActionInProgress).toBe(true);
        casts[0].complete();
        casts[0].complete();
        expect(mission.cardActionInProgress).toBe(false);
        expect(mission.active).toBe(false);
        expect(mission.curPhase).toBe(Mission.ENEMY_PHASE);
    });

    it.each(animatedEnemies)("animates %s's standard attack with %s but deals only base damage", (key, _animation) => {
        const {mission, enemy, casts, play, attacking} = createBattle(key);
        const specialAction = vi.fn();
        enemy.specialAttack.action = specialAction;
        const evaluate = vi.fn(() => false);
        mission.gameState.evaluate = evaluate;
        const damage = enemy.baseAttack;
        enemy.performTurn(mission);
        expect(play).toHaveBeenCalledExactlyOnceWith(
            enemy.specialAttack, [mission.player], expect.any(Function), expect.any(Function), enemy, false);
        expect(mission.player.currentHP).toBe(500);
        expect(mission.cardActionInProgress).toBe(true);
        expect(attacking).toHaveBeenCalledWith(enemy, false);
        casts[0].impact();
        casts[0].impact();
        expect(mission.player.currentHP).toBe(500 - damage);
        expect(specialAction).not.toHaveBeenCalled();
        expect(evaluate).toHaveBeenCalledOnce();
        expect(mission.cardActionInProgress).toBe(true);
        casts[0].complete();
        expect(mission.cardActionInProgress).toBe(false);
        expect(mission.active).toBe(false);
    });

    it("uses the base damage chosen at the start of an animated standard attack", () => {
        const {mission, enemy, casts} = createBattle();
        mission.gameState.evaluate = () => false;
        enemy.performTurn(mission);
        enemy.baseAttack = 50;
        casts[0].impact();
        expect(mission.player.currentHP).toBe(496);
    });

    it.each([undefined, "not-implemented"])("preserves immediate standard damage with %s animation", animation => {
        const {mission, enemy, play, attacking} = createBattle();
        mission.gameState.evaluate = () => false;
        enemy.specialAttack.animation = animation;
        enemy.performTurn(mission);
        expect(mission.player.currentHP).toBe(496);
        expect(attacking).toHaveBeenCalledWith(enemy, false);
        expect(play).not.toHaveBeenCalled();
        expect(mission.cardActionInProgress).toBe(false);
    });

    it.each([undefined, "not-implemented"])("preserves immediate special damage with %s animation", animation => {
        const {mission, enemy, play, attacking} = createBattle();
        enemy.specialAttack.animation = animation;
        enemy.performTurn(mission);
        expect(mission.player.currentHP).toBe(485);
        expect(attacking).toHaveBeenCalledWith(enemy, true);
        expect(play).not.toHaveBeenCalled();
        expect(mission.cardActionInProgress).toBe(false);
    });

    it.each([true, false])("preserves immediate damage without an animator when special is %s", special => {
        const {mission, enemy, play} = createBattle();
        mission.gameState.evaluate = () => special;
        mission.cardActionAnimator = undefined;
        enemy.performTurn(mission);
        expect(mission.player.currentHP).toBe(special ? 485 : 496);
        expect(play).not.toHaveBeenCalled();
    });

    it("keeps an enemy without a special on its basic attack", () => {
        const {mission, enemy, play, attacking} = createBattle();
        Object.assign(enemy, {specialAttack: undefined});
        enemy.performTurn(mission);
        expect(mission.player.currentHP).toBe(496);
        expect(attacking).toHaveBeenCalledWith(enemy, false);
        expect(play).not.toHaveBeenCalled();
    });

    it("delays any associated rune changes together with damage", () => {
        const {mission, enemy, casts} = createBattle();
        mission.gameState.setVariableValues({n: {0: true}});
        enemy.specialAttack.action = (mission: Mission, target: Player) => {
            target.takeHit(15);
            mission.gameState.setVariableValues({n: {0: false}});
        };
        enemy.performTurn(mission);
        expect(mission.gameState.getVariable("n").getValue(0)).toBe(true);
        casts[0].impact();
        expect(mission.player.currentHP).toBe(485);
        expect(mission.gameState.getVariable("n").getValue(0)).toBe(false);
    });

    it("retains the null-target behavior of other-kind enemy actions", () => {
        const {mission, enemy, casts} = createBattle();
        enemy.specialAttack.cardKind = Card.OTHER;
        const action = vi.fn();
        enemy.specialAttack.action = action;
        expect(enemy.applyCard(enemy.specialAttack, mission)).toBe(true);
        expect(casts[0].targets).toEqual([null]);
        expect(action).not.toHaveBeenCalled();
        casts[0].impact();
        expect(action).toHaveBeenCalledExactlyOnceWith(mission, null);
    });

    it.each([true, false])("holds the next enemy through cast and hit reaction when special is %s", special => {
        const {mission, enemy, other, casts, play} = createBattle();
        mission.gameState.evaluate = () => special;
        mission.nextPlayer();
        mission.nextPlayer();
        expect(play).toHaveBeenCalledOnce();
        expect(casts[0].source).toBe(enemy);
        casts[0].impact();
        expect(play).toHaveBeenCalledOnce();
        casts[0].complete();
        expect(play).toHaveBeenCalledTimes(2);
        expect(casts[1].source).toBe(other);
        casts[0].complete();
        expect(mission.cardActionInProgress).toBe(true);
        casts[1].impact();
        expect(mission.player.currentHP).toBe(special ? 475 : 493);
        casts[1].complete();
        expect(mission.cardActionInProgress).toBe(false);
    });

    it("does not unlock a batch of enemy actions when only the first one completes", () => {
        const {mission, casts} = createBattle();
        mission.iterateEachParticipand = false;
        mission.nextPhase(Mission.ENEMY_PHASE);
        expect(casts).toHaveLength(2);
        mission.nextPhase(Mission.ENERGY_PHASE);
        casts[0].impact();
        casts[0].complete();
        expect(mission.cardActionInProgress).toBe(true);
        expect(mission.curPhase).toBe(Mission.ENEMY_PHASE);
        casts[1].impact();
        casts[1].complete();
        expect(mission.cardActionInProgress).toBe(false);
        expect(mission.curPhase).toBe(Mission.ENERGY_PHASE);
        expect(mission.active).toBe(true);
    });

    it("does not advance an enemy turn while paused, even if a completion callback arrives", () => {
        const {mission, casts, play} = createBattle();
        mission.nextPlayer();
        mission.nextPlayer();
        mission.setPaused(true);
        casts[0].impact();
        casts[0].complete();
        expect(play).toHaveBeenCalledOnce();
        expect(mission.active).toBe(false);
        mission.setPaused(false);
        expect(play).toHaveBeenCalledTimes(2);
    });

    it.each([true, false])("ignores stale enemy callbacks after destruction when special is %s", special => {
        const {mission, enemy, casts} = createBattle();
        mission.gameState.evaluate = () => special;
        enemy.performTurn(mission);
        mission.destroy();
        casts[0].impact();
        casts[0].complete();
        expect(mission.player.currentHP).toBe(500);
    });
});
