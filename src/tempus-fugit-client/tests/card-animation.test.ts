import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Mission } from "../mechanics/mission";
import type { CardActionTarget } from "../mechanics/card-action-animation";
import { Card } from "../objects/game-objects/card";
import { Deck } from "../objects/game-objects/deck";
import { Enemy } from "../objects/game-objects/enemy";
import { Player } from "../objects/game-objects/player";
import { CardAnimationRegistry } from "../animations/card-animation-registry";

const cardsJSON = readFileSync("src/tempus-fugit-client/json/cards.json", "utf8");

function createBattle() {
    const mission = new Mission();
    mission.player = new Player("Wizard", 100, 10);
    mission.deck = new Deck();
    mission.curPhase = Mission.ENERGY_PHASE;
    const enemy = new Enemy("first", 100, 10, undefined, "", [32, 32]);
    const other = new Enemy("other", 100, 10, undefined, "", [32, 32]);
    mission.enemies = [[enemy, other]];
    mission.gameState.setVariableValues({l: {0: true}, n: {0: true}});
    mission.active = true;
    let impact: () => void;
    let complete: () => void;
    let targets: readonly CardActionTarget[];
    const play = vi.fn((_key, resolvedTargets, onImpact, onComplete) => {
        targets = resolvedTargets;
        impact = onImpact;
        complete = onComplete;
    });
    mission.cardActionAnimator = {has: key => key === "lightning", play};
    const card = Card.cards["Lightning Strike"].copy();
    mission.player.hand.cards[0] = card;
    const attacking = vi.fn();
    const cardPlayed = vi.fn();
    mission.player.listener.push({
        Attacking: attacking, cardPlayed,
        playerHpChanged: vi.fn(), stateValuesChanged: vi.fn(), Activated: vi.fn(),
    });
    return {
        mission, enemy, other, card, play, attacking, cardPlayed,
        impact: () => impact(), complete: () => complete(), targets: () => targets,
    };
}

beforeEach(() => {
    vi.useFakeTimers();
    Card.createFromJSON(cardsJSON);
});
afterEach(() => {
    vi.useRealTimers();
    Card.cards = {};
});

describe("Card animation metadata and registration", () => {
    it.each(["Lightning Strike", "Lightning rain", "Lightning stand"])("preserves %s animation metadata through card and deck copies", name => {
        const card = Card.cards[name].copy();
        expect(card.animation).toBe("lightning");
        const deck = new Deck();
        deck.deck = {[card.key]: card};
        deck.setUpDeck();
        expect(deck.copy().cards.every(copy => copy.animation === "lightning")).toBe(true);
    });

    it("looks up effects independently of card names and rejects duplicate registrations", () => {
        const registry = new CardAnimationRegistry();
        const animation = vi.fn();
        registry.register("lightning", animation);
        expect(registry.get("lightning")).toBe(animation);
        expect(registry.get("not-implemented")).toBeUndefined();
        expect(() => registry.register("lightning", animation)).toThrow("already registered");
    });

    it("registers an optional reusable hit reaction together with a card effect", () => {
        const registry = new CardAnimationRegistry();
        const animation = vi.fn();
        const damageAnimation = vi.fn();
        registry.register("lightning", animation, damageAnimation);
        registry.register("ordinary", animation);
        expect(registry.get("lightning")).toBe(animation);
        expect(registry.getDamageAnimation("lightning")).toBe(damageAnimation);
        expect(registry.getDamageAnimation("ordinary")).toBeUndefined();
        expect(registry.getDamageAnimation("not-implemented")).toBeUndefined();
    });

    it("rejects malformed animation metadata", () => {
        const json = JSON.parse(cardsJSON);
        json.cards[0].animation = {};
        expect(() => Card.createFromJSON(JSON.stringify(json))).toThrow("Invalid animation");
    });

    it.each([Card.DIRECTED, Card.RANDOM])("reports missing targets for a %s card", kind => {
        const {mission, card} = createBattle();
        card.cardKind = kind;
        expect(() => card.getActionTargets(mission, [])).toThrow("No targets for card Lightning Strike");
    });
});

describe("Animated card resolution", () => {
    it("delays HP and rune changes until impact, and locks inputs through the hit reaction", () => {
        const {mission, enemy, other, card, impact, complete, targets, attacking, cardPlayed} = createBattle();
        mission.player.applyCard(card, enemy, mission);
        expect(targets()).toEqual([enemy]);
        expect(enemy.currentHP).toBe(100);
        expect(mission.gameState.getVariable("l").getValue(0)).toBe(true);
        expect(mission.player.hand.cards[0]).toBeNull();
        expect(mission.active).toBe(false);
        expect(mission.player.active).toBe(false);
        expect(mission.gameState.active).toBe(false);
        expect(mission.tryConsumeBaseAttack()).toBe(false);
        mission.active = true;
        expect(mission.active).toBe(false);

        impact();
        expect(enemy.currentHP).toBe(88);
        expect(other.currentHP).toBe(100);
        expect(mission.gameState.getVariable("l").getValue(0)).toBe(false);
        expect(attacking).not.toHaveBeenCalled();
        expect(cardPlayed).toHaveBeenCalledOnce();
        expect(mission.cardActionInProgress).toBe(true);
        expect(mission.curPhase).toBe(Mission.ENERGY_PHASE);
        expect(mission.active).toBe(false);

        impact();
        complete();
        complete();
        expect(enemy.currentHP).toBe(88);
        expect(cardPlayed).toHaveBeenCalledOnce();
        expect(mission.cardActionInProgress).toBe(false);
        expect(mission.curPhase).toBe(Mission.PLAY_PHASE);
        expect(mission.active).toBe(true);
        expect(mission.gameState.active).toBe(false);
        expect(mission.tryConsumeBaseAttack()).toBe(false);
    });

    it.each([undefined, "not-implemented"])("keeps synchronous damage and movement fallback for %s", animation => {
        const {mission, enemy, card, play, attacking} = createBattle();
        card.animation = animation;
        mission.player.applyCard(card, enemy, mission);
        expect(enemy.currentHP).toBe(88);
        expect(attacking).toHaveBeenCalledOnce();
        expect(play).not.toHaveBeenCalled();
        expect(mission.cardActionInProgress).toBe(false);
        expect(mission.curPhase).toBe(Mission.PLAY_PHASE);
    });

    it("resolves synchronously without a scene animator", () => {
        const {mission, enemy, card, attacking} = createBattle();
        mission.cardActionAnimator = undefined;
        mission.player.applyCard(card, enemy, mission);
        expect(enemy.currentHP).toBe(88);
        expect(attacking).toHaveBeenCalledOnce();
    });

    it("does not start a second card while an animated action is pending", () => {
        const {mission, enemy, card, play} = createBattle();
        mission.player.applyCard(card, enemy, mission);
        mission.player.applyCard(card, enemy, mission);
        expect(play).toHaveBeenCalledOnce();
    });

    it("uses Lightning rain's configured effect for all targets", () => {
        const {mission, enemy, other, impact, complete, targets} = createBattle();
        const rain = Card.cards["Lightning rain"].copy();
        mission.gameState.evaluate = () => true;
        mission.player.applyCard(rain, undefined, mission);
        expect(targets()).toEqual([enemy, other]);
        expect([enemy.currentHP, other.currentHP]).toEqual([100, 100]);
        impact();
        expect([enemy.currentHP, other.currentHP]).toEqual([65, 65]);
        complete();
        expect(mission.cardActionInProgress).toBe(false);
    });

    it("uses Lightning stand's configured effect for all targets on each activation", () => {
        const {mission, enemy, other, play, impact, complete, targets} = createBattle();
        const stand = Card.cards["Lightning stand"].copy();
        mission.gameState.evaluate = () => true;
        mission.curPhase = Mission.STAND_PHASE;
        for (let round = 0; round < 2; round++) {
            expect(stand.act(mission, mission.player)).toBe(true);
            expect(play).toHaveBeenCalledTimes(round + 1);
            expect(targets()).toEqual([enemy, other]);
            expect([enemy.currentHP, other.currentHP]).toEqual([100 - round * 25, 100 - round * 25]);
            impact();
            expect([enemy.currentHP, other.currentHP]).toEqual([75 - round * 25, 75 - round * 25]);
            expect(stand.getRoundsRemaining()).toBe(3 - round);
            complete();
            expect(mission.cardActionInProgress).toBe(false);
            expect(mission.active).toBe(false);
        }
    });

    it("resolves a random target once, before the animation starts", () => {
        const {mission, enemy, other, card, impact, targets} = createBattle();
        card.cardKind = Card.RANDOM;
        const random = vi.spyOn(Math, "random").mockReturnValueOnce(0).mockReturnValue(0.99);
        mission.player.applyCard(card, undefined, mission);
        expect(targets()).toEqual([enemy]);
        impact();
        expect(random).toHaveBeenCalledOnce();
        expect([enemy.currentHP, other.currentHP]).toEqual([88, 100]);
        random.mockRestore();
    });

    it("uses the same impact path for stand activations", () => {
        const {mission, enemy, card, impact, complete} = createBattle();
        card.isStandCard = true;
        card.targets = [enemy];
        mission.curPhase = Mission.STAND_PHASE;
        expect(card.act(mission, mission.player)).toBe(true);
        expect(enemy.currentHP).toBe(100);
        expect(card.standRounds).toBe(2);
        impact();
        expect(enemy.currentHP).toBe(88);
        complete();
        expect(mission.active).toBe(false);
    });

    it("holds the next participant until an animated stand and its reaction have settled", () => {
        const {mission, enemy, card, impact, complete} = createBattle();
        card.isStandCard = true;
        card.targets = [enemy];
        mission.pushStand(card);
        const enemyTurn = vi.spyOn(enemy, "performTurn");
        mission.nextPhase(Mission.STAND_PHASE);
        mission.nextPlayer();
        expect(enemyTurn).not.toHaveBeenCalled();
        impact();
        expect(enemy.currentHP).toBe(88);
        expect(mission.curPhase).toBe(Mission.STAND_PHASE);
        expect(enemyTurn).not.toHaveBeenCalled();
        complete();
        expect(mission.curPhase).toBe(Mission.ENEMY_PHASE);
        expect(enemyTurn).toHaveBeenCalledOnce();
    });

    it("does not animate a card with an unsatisfied formula", () => {
        const {mission, enemy, card, play} = createBattle();
        mission.gameState.setVariableValues({l: {0: false}});
        mission.player.applyCard(card, enemy, mission);
        expect(play).not.toHaveBeenCalled();
        expect(mission.player.hand.cards[0]).toBe(card);
        expect(enemy.currentHP).toBe(100);
    });

    it("does not unlock on dialog resume before the action completes", () => {
        const {mission, enemy, card, impact, complete} = createBattle();
        mission.player.applyCard(card, enemy, mission);
        mission.setPaused(true);
        mission.setPaused(false);
        expect(mission.active).toBe(false);
        impact();
        mission.setPaused(true);
        complete();
        expect(mission.active).toBe(false);
        expect(mission.curPhase).toBe(Mission.ENERGY_PHASE);
        mission.setPaused(false);
        expect(mission.curPhase).toBe(Mission.PLAY_PHASE);
        expect(mission.active).toBe(true);
    });

    it("starts the final-kill wave delay at impact, never at cast time", () => {
        const {mission, enemy, other, card, impact, complete} = createBattle();
        other.currentHP = 0;
        enemy.currentHP = 12;
        mission.player.applyCard(card, enemy, mission);
        vi.advanceTimersByTime(1000);
        expect(mission.waveTransitionInProgress).toBe(false);
        expect(mission.waveCounter).toBe(0);
        impact();
        expect(mission.waveTransitionInProgress).toBe(true);
        vi.advanceTimersByTime(349);
        expect(mission.waveCounter).toBe(0);
        complete();
        expect(mission.active).toBe(false);
        vi.advanceTimersByTime(1);
        expect(mission.isGameWon()).toBe(true);
    });

    it("cancels stale impact and completion callbacks on mission destruction", () => {
        const {mission, enemy, card, impact, complete, cardPlayed} = createBattle();
        mission.player.applyCard(card, enemy, mission);
        mission.destroy();
        impact();
        complete();
        expect(enemy.currentHP).toBe(100);
        expect(cardPlayed).not.toHaveBeenCalled();
        expect(mission.active).toBe(false);
    });

    it("reports an invalid animator that completes without delivering impact", () => {
        const {mission, enemy, card, complete} = createBattle();
        mission.player.applyCard(card, enemy, mission);
        expect(complete).toThrow("Card animation settled without impact: lightning");
        expect(enemy.currentHP).toBe(100);
        expect(mission.active).toBe(false);
    });
});
