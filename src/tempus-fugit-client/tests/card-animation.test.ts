import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Mission } from "../mechanics/mission";
import type { CardActionImpact, CardActionTarget } from "../mechanics/card-action-animation";
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
    let impact: CardActionImpact;
    let complete: () => void;
    let targets: readonly CardActionTarget[];
    const play = vi.fn((_card: Card, resolvedTargets, onImpact, onComplete) => {
        targets = resolvedTargets;
        impact = onImpact;
        complete = onComplete;
    });
    mission.cardActionAnimator = {
        has: key => [
            "lightning", "root-pierce", "healing", "positive-aura", "negative-aura", "fireball",
            "light-beam", "dark-beam", "incinerate", "sun-wave", "magic-bolts", "magic-rain",
        ].includes(key),
        play,
    };
    const card = Card.cards["Lightning strike"].copy();
    mission.player.hand.cards[0] = card;
    const attacking = vi.fn();
    const cardPlayed = vi.fn();
    mission.player.listener.push({
        Attacking: attacking, cardPlayed,
        playerHpChanged: vi.fn(), stateValuesChanged: vi.fn(), Activated: vi.fn(),
    });
    return {
        mission, enemy, other, card, play, attacking, cardPlayed,
        impact: (index?: number) => impact(index), complete: () => complete(), targets: () => targets,
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
    it.each([
        ["Fireball", "fireball"],
        ["Lightning strike", "lightning"],
        ["Lightning rain", "lightning"],
        ["Lightning stand", "lightning"],
        ["Root pierce", "root-pierce"],
        ["Lower woodland stand", "root-pierce"],
        ["Natural heal", "healing"],
        ["Unnatural heal", "healing"],
        ["Heal stand", "healing"],
        ["Higher heal stand", "healing"],
        ["Strength", "positive-aura"],
        ["Guiding Light", "positive-aura"],
        ["Aura of Weakness", "negative-aura"],
        ["Higher nature stand", "root-pierce"],
        ["Light stand", "light-beam"],
        ["Dark beam", "dark-beam"],
        ["Incinerate", "incinerate"],
        ["Sun flare", "sun-wave"],
        ["Anti-evolution", "magic-bolts"],
        ["Obliterate", "magic-rain"],
        ["Tempus Fugit", "magic-rain"],
    ])("preserves %s animation metadata through card and deck copies", (name, animation) => {
        const card = Card.cards[name].copy();
        expect(card.animation).toBe(animation);
        expect(card.healing).toBe(Card.cards[name].healing);
        const deck = new Deck();
        deck.deck = {[card.key]: card};
        deck.setUpDeck();
        expect(deck.copy().cards.every(copy => copy.animation === animation)).toBe(true);
        expect(deck.copy().cards.every(copy => copy.healing === card.healing)).toBe(true);
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

    it.each([0, -1, "40", null, {}, Infinity])("rejects invalid healing strength %s", healing => {
        const json = JSON.parse(cardsJSON);
        json.cards.find(card => card.name === "Natural heal").healing = healing;
        expect(() => Card.createFromJSON(JSON.stringify(json))).toThrow("Invalid healing for card Natural heal");
    });

    it.each([Card.DIRECTED, Card.RANDOM])("reports missing targets for a %s card", kind => {
        const {mission, card} = createBattle();
        card.cardKind = kind;
        expect(() => card.getActionTargets(mission, [])).toThrow("No targets for card " + card.name);
    });
});

describe("Animated card resolution", () => {
    it.each([
        ["Dark beam", 50],
        ["Incinerate", 100],
        ["Anti-evolution", 16],
    ])("delays %s's damage and rune changes until impact without multiplying damage", (name, damage) => {
        const {mission, enemy, other, impact, complete, attacking, cardPlayed} = createBattle();
        const card = Card.cards[name].copy();
        mission.player.hand.cards[0] = card;
        mission.gameState.evaluate = () => true;
        const runes = vi.spyOn(mission.gameState, "setVariableValues");
        const allRunes = vi.spyOn(mission.gameState, "setAllVariableValues");
        mission.player.applyCard(card, enemy, mission);
        expect([enemy.currentHP, other.currentHP]).toEqual([100, 100]);
        expect(runes).not.toHaveBeenCalled();
        expect(allRunes).not.toHaveBeenCalled();
        impact();
        expect([enemy.currentHP, other.currentHP]).toEqual([100 - damage, 100]);
        if (name === "Anti-evolution") {
            expect(mission.gameState.getVariable("n").getValue(0)).toBe(false);
        } else if (name === "Dark beam") {
            expect(mission.gameState.getVariable("l").getValue(0)).toBe(false);
            expect(mission.gameState.getVariable("t").getValue(2)).toBe(true);
        } else {
            expect(mission.gameState.getVariable("n").getValue(0)).toBe(false);
            expect(mission.gameState.getVariable("s").getValue(2)).toBe(true);
        }
        impact();
        expect(enemy.currentHP).toBe(100 - damage);
        expect(cardPlayed).toHaveBeenCalledOnce();
        expect(attacking).not.toHaveBeenCalled();
        expect(mission.cardActionInProgress).toBe(true);
        complete();
        expect(mission.cardActionInProgress).toBe(false);
    });

    it.each(["Obliterate", "Tempus Fugit"])("delays %s's entire global action until the rune rain hits", name => {
        const {mission, enemy, other, impact, complete, targets} = createBattle();
        const card = Card.cards[name].copy();
        mission.player.hand.cards[0] = card;
        mission.gameState.evaluate = () => true;
        const hits = [vi.spyOn(enemy, "takeHit"), vi.spyOn(other, "takeHit")];
        const runes = vi.spyOn(mission.gameState, "setAllVariableValues");
        mission.player.applyCard(card, undefined, mission);
        expect(targets()).toEqual([enemy, other]);
        expect(hits.every(hit => hit.mock.calls.length === 0)).toBe(true);
        expect(mission.player.baseAttack).toBe(10);
        expect(mission.player.currentHP).toBe(100);
        expect(runes).not.toHaveBeenCalled();
        impact();
        impact();
        hits.forEach(hit => expect(hit).toHaveBeenCalledOnce());
        const remainingHP = 100 - (name === "Tempus Fugit" ? 10000 : 1000);
        expect([enemy.currentHP, other.currentHP]).toEqual([remainingHP, remainingHP]);
        expect(mission.gameState.getVariable("n").getValue(0)).toBe(name === "Tempus Fugit");
        // Global action strings still execute once per enemy, including their existing player bonuses.
        expect(mission.player.baseAttack).toBe(name === "Tempus Fugit" ? 30 : 10);
        expect(mission.player.currentHP).toBe(name === "Tempus Fugit" ? 2100 : 100);
        complete();
        expect(mission.cardActionInProgress).toBe(false);
    });

    it("hits Sun flare targets individually and emits cardPlayed only after the final contact", () => {
        const {mission, enemy, other, impact, complete, cardPlayed} = createBattle();
        mission.gameState.evaluate = () => true;
        const card = Card.cards["Sun flare"].copy();
        mission.player.hand.cards[0] = card;
        mission.player.applyCard(card, undefined, mission);
        expect([enemy.currentHP, other.currentHP]).toEqual([100, 100]);
        expect(mission.gameState.getVariable("s").getValue(0)).toBe(false);
        impact(1);
        impact(1);
        expect([enemy.currentHP, other.currentHP]).toEqual([100, 80]);
        expect(mission.gameState.getVariable("s").getValue(2)).toBe(true);
        expect(mission.gameState.getVariable("l").getValue(2)).toBe(true);
        expect(cardPlayed).not.toHaveBeenCalled();
        expect(mission.active).toBe(false);
        expect(complete).toThrow("Card animation settled without impact: sun-wave");
        impact(0);
        impact();
        expect([enemy.currentHP, other.currentHP]).toEqual([80, 80]);
        expect(cardPlayed).toHaveBeenCalledOnce();
        expect(mission.active).toBe(false);
        complete();
        expect(mission.active).toBe(true);
    });

    it("settles only unhit wave targets when an interrupted sweep falls back to full impact", () => {
        const {mission, enemy, other, impact, complete, cardPlayed} = createBattle();
        const card = Card.cards["Sun flare"].copy();
        mission.gameState.evaluate = () => true;
        mission.player.applyCard(card, undefined, mission);
        impact(0);
        expect([enemy.currentHP, other.currentHP]).toEqual([80, 100]);
        impact();
        impact(1);
        expect([enemy.currentHP, other.currentHP]).toEqual([80, 80]);
        expect(cardPlayed).toHaveBeenCalledOnce();
        complete();
        expect(mission.cardActionInProgress).toBe(false);
    });

    it.each([-1, 2, 0.5, NaN])("rejects invalid per-target impact index %s", index => {
        const {mission, enemy, other, impact} = createBattle();
        mission.gameState.evaluate = () => true;
        mission.player.applyCard(Card.cards["Sun flare"].copy(), undefined, mission);
        expect(() => impact(index)).toThrow("Invalid card animation target index");
        expect([enemy.currentHP, other.currentHP]).toEqual([100, 100]);
    });

    it("ignores remaining wave contacts after the mission is destroyed", () => {
        const {mission, enemy, other, impact, complete, cardPlayed} = createBattle();
        mission.gameState.evaluate = () => true;
        mission.player.applyCard(Card.cards["Sun flare"].copy(), undefined, mission);
        impact(0);
        mission.destroy();
        impact(1);
        impact();
        complete();
        expect([enemy.currentHP, other.currentHP]).toEqual([80, 100]);
        expect(cardPlayed).not.toHaveBeenCalled();
    });

    it("keeps Vase of Desire on its ordinary draw path with no combat effect", () => {
        const {mission, play, attacking} = createBattle();
        const card = Card.cards["Vase of Desire"].copy();
        expect(card.animation).toBeUndefined();
        mission.player.hand.cards[0] = card;
        mission.gameState.evaluate = () => true;
        const drawn = ["Fireball", "Root pierce", "Natural heal"].map(name => Card.cards[name].copy());
        mission.deck.cards = [...drawn];
        mission.player.applyCard(card, undefined, mission);
        expect(mission.player.hand.cards.filter(card => card !== null)).toEqual(expect.arrayContaining(drawn));
        expect(mission.deck.cards).toHaveLength(0);
        expect(play).not.toHaveBeenCalled();
        expect(attacking).not.toHaveBeenCalled();
    });

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

    it("delays Fireball's damage and future strength until the projectile hits its chosen enemy", () => {
        const {mission, enemy, other, play, impact, complete, targets, attacking} = createBattle();
        const card = Card.cards["Fireball"].copy();
        mission.player.hand.cards[0] = card;
        mission.gameState.setVariableValues({s: {0: true}});
        mission.player.applyCard(card, enemy, mission);
        expect(play).toHaveBeenCalledWith(card, [enemy], expect.any(Function), expect.any(Function), mission.player);
        expect(targets()).toEqual([enemy]);
        expect([enemy.currentHP, other.currentHP]).toEqual([100, 100]);
        expect(mission.gameState.getVariable("s").getValue(2)).toBe(false);
        expect(mission.active).toBe(false);
        impact();
        expect([enemy.currentHP, other.currentHP]).toEqual([92, 100]);
        expect(mission.gameState.getVariable("s").getValue(2)).toBe(true);
        expect(attacking).not.toHaveBeenCalled();
        expect(mission.cardActionInProgress).toBe(true);
        impact();
        expect(enemy.currentHP).toBe(92);
        complete();
        expect(mission.cardActionInProgress).toBe(false);
        expect(mission.active).toBe(true);
    });

    it("supports reusing the Fireball effect for multiple resolved targets", () => {
        const {mission, enemy, other, impact, complete, targets} = createBattle();
        const card = Card.cards["Fireball"].copy();
        card.cardKind = Card.GLOBAL;
        mission.gameState.setVariableValues({s: {0: true}});
        mission.player.applyCard(card, undefined, mission);
        expect(targets()).toEqual([enemy, other]);
        expect([enemy.currentHP, other.currentHP]).toEqual([100, 100]);
        impact();
        expect([enemy.currentHP, other.currentHP]).toEqual([92, 92]);
        complete();
        expect(mission.cardActionInProgress).toBe(false);
    });

    it.each([undefined, "not-implemented"])("keeps Fireball's existing damage and movement fallback for %s", animation => {
        const {mission, enemy, play, attacking} = createBattle();
        const card = Card.cards["Fireball"].copy();
        card.animation = animation;
        mission.gameState.setVariableValues({s: {0: true}});
        mission.player.applyCard(card, enemy, mission);
        expect(enemy.currentHP).toBe(92);
        expect(mission.gameState.getVariable("s").getValue(2)).toBe(true);
        expect(attacking).toHaveBeenCalledOnce();
        expect(play).not.toHaveBeenCalled();
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

    it.each([["Lightning stand", 25], ["Light stand", 8]])("uses %s's configured effect for all targets on each activation", (name, damage) => {
        const {mission, enemy, other, play, impact, complete, targets} = createBattle();
        const stand = Card.cards[name].copy();
        mission.gameState.evaluate = () => true;
        mission.curPhase = Mission.STAND_PHASE;
        for (let round = 0; round < 2; round++) {
            expect(stand.act(mission, mission.player)).toBe(true);
            expect(play).toHaveBeenCalledTimes(round + 1);
            expect(targets()).toEqual([enemy, other]);
            expect([enemy.currentHP, other.currentHP]).toEqual([100 - round * damage, 100 - round * damage]);
            impact();
            expect([enemy.currentHP, other.currentHP]).toEqual([100 - (round + 1) * damage, 100 - (round + 1) * damage]);
            expect(stand.getRoundsRemaining()).toBe(3 - round);
            complete();
            expect(mission.cardActionInProgress).toBe(false);
            expect(mission.active).toBe(false);
        }
    });

    it("delays Root pierce's directed damage and rune effects until the root connects", () => {
        const {mission, enemy, other, play, impact, complete, targets, attacking} = createBattle();
        const root = Card.cards["Root pierce"].copy();
        mission.player.hand.cards[0] = root;
        mission.player.applyCard(root, enemy, mission);
        expect(play).toHaveBeenCalledWith(root, [enemy], expect.any(Function), expect.any(Function), mission.player);
        expect(targets()).toEqual([enemy]);
        expect([enemy.currentHP, other.currentHP]).toEqual([100, 100]);
        expect(mission.gameState.getVariable("t").getValue(1)).toBe(false);
        expect(mission.gameState.getVariable("s").getValue(1)).toBe(false);
        expect(mission.active).toBe(false);
        impact();
        expect([enemy.currentHP, other.currentHP]).toEqual([92, 100]);
        expect(mission.gameState.getVariable("t").getValue(1)).toBe(true);
        expect(mission.gameState.getVariable("t").getValue(2)).toBe(true);
        expect(mission.gameState.getVariable("s").getValue(1)).toBe(true);
        expect(attacking).not.toHaveBeenCalled();
        complete();
        expect(mission.active).toBe(true);
    });

    it("animates all Lower woodland stand targets on every activation", () => {
        const {mission, enemy, other, play, impact, complete, targets} = createBattle();
        const stand = Card.cards["Lower woodland stand"].copy();
        mission.curPhase = Mission.STAND_PHASE;
        for (let round = 0; round < 2; round++) {
            expect(stand.act(mission, mission.player)).toBe(true);
            expect(play).toHaveBeenCalledTimes(round + 1);
            expect(play.mock.calls[round][0]).toBe(stand);
            expect(targets()).toEqual([enemy, other]);
            expect([enemy.currentHP, other.currentHP]).toEqual([100 - round * 3, 100 - round * 3]);
            impact();
            expect([enemy.currentHP, other.currentHP]).toEqual([97 - round * 3, 97 - round * 3]);
            expect(stand.getRoundsRemaining()).toBe(3 - round);
            complete();
            expect(mission.cardActionInProgress).toBe(false);
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

    it.each([
        ["Natural heal", 40],
        ["Unnatural heal", 100],
    ])("delays %s healing and rune changes until the hearts reach the mage", (name, amount) => {
        const {mission, play, impact, complete, targets, attacking} = createBattle();
        const card = Card.cards[name].copy();
        mission.player.hand.cards[0] = card;
        mission.player.currentHP = 20;
        mission.gameState.evaluate = () => true;
        mission.gameState.setVariableValues({n: {0: true, 1: false}});
        mission.player.applyCard(card, undefined, mission);
        expect(play).toHaveBeenCalledWith(card, [mission.player], expect.any(Function), expect.any(Function), mission.player);
        expect(targets()).toEqual([mission.player]);
        expect(mission.player.currentHP).toBe(20);
        expect(mission.active).toBe(false);
        expect(mission.gameState.getVariable("n").getValue(0)).toBe(true);
        expect(mission.gameState.getVariable("n").getValue(1)).toBe(false);
        impact();
        expect(mission.player.currentHP).toBe(20 + amount);
        expect(mission.gameState.getVariable("n").getValue(name === "Natural heal" ? 1 : 0)).toBe(name === "Natural heal");
        expect(attacking).not.toHaveBeenCalled();
        expect(mission.cardActionInProgress).toBe(true);
        complete();
        expect(mission.active).toBe(true);
    });

    it.each([
        {name: "Strength", amount: 4, variable: "s", lastRound: 2},
        {name: "Guiding Light", amount: 2, variable: "l", lastRound: 5},
    ])("delays $name's attack and rune buffs until the positive aura peaks", ({name, amount, variable, lastRound}) => {
        const {mission, play, impact, complete, targets, attacking} = createBattle();
        const card = Card.cards[name].copy();
        mission.player.hand.cards[0] = card;
        mission.gameState.evaluate = () => true;
        mission.player.applyCard(card, undefined, mission);
        expect(play).toHaveBeenCalledWith(card, [mission.player], expect.any(Function), expect.any(Function), mission.player);
        expect(targets()).toEqual([mission.player]);
        expect(mission.player.baseAttack).toBe(10);
        expect(mission.gameState.getVariable(variable).getValue(1)).toBe(false);
        expect(mission.active).toBe(false);
        impact();
        expect(mission.player.baseAttack).toBe(10 + amount);
        expect(mission.player.currentHP).toBe(100);
        expect(mission.gameState.getVariable(variable).getValue(1)).toBe(true);
        expect(mission.gameState.getVariable(variable).getValue(lastRound)).toBe(true);
        expect(attacking).not.toHaveBeenCalled();
        expect(mission.cardActionInProgress).toBe(true);
        impact();
        expect(mission.player.baseAttack).toBe(10 + amount);
        complete();
        expect(mission.active).toBe(true);
    });

    it("weakens all enemies together at the dark aura's impact without dealing damage or lunging", () => {
        const {mission, enemy, other, play, impact, complete, targets, attacking} = createBattle();
        const card = Card.cards["Aura of Weakness"].copy();
        mission.player.hand.cards[0] = card;
        mission.gameState.evaluate = () => true;
        other.baseAttack = 2;
        mission.player.applyCard(card, undefined, mission);
        expect(play).toHaveBeenCalledWith(card, [enemy, other], expect.any(Function), expect.any(Function), mission.player);
        expect(targets()).toEqual([enemy, other]);
        expect([enemy.baseAttack, other.baseAttack]).toEqual([10, 2]);
        expect(mission.active).toBe(false);
        impact();
        expect([enemy.baseAttack, other.baseAttack]).toEqual([7, 0]);
        expect([enemy.currentHP, other.currentHP]).toEqual([100, 100]);
        expect(attacking).not.toHaveBeenCalled();
        expect(mission.cardActionInProgress).toBe(true);
        complete();
        expect(mission.active).toBe(true);
    });

    it.each(["Strength", "Guiding Light", "Aura of Weakness"])("preserves %s's synchronous fallback without an aura implementation", name => {
        const {mission, enemy, play, attacking} = createBattle();
        const card = Card.cards[name].copy();
        const baseAttack = mission.player.baseAttack;
        card.animation = "not-implemented";
        mission.gameState.evaluate = () => true;
        mission.player.applyCard(card, undefined, mission);
        expect(play).not.toHaveBeenCalled();
        expect(mission.cardActionInProgress).toBe(false);
        if (name === "Aura of Weakness") {
            expect(enemy.baseAttack).toBe(7);
            expect(attacking).toHaveBeenCalledOnce();
        } else {
            expect(mission.player.baseAttack).toBe(baseAttack + (name === "Strength" ? 4 : 2));
            expect(attacking).not.toHaveBeenCalled();
        }
    });

    it.each([
        ["Heal stand", 50],
        ["Higher heal stand", 100],
    ])("passes the specific %s to the animator on every activation", (name, amount) => {
        const {mission, play, impact, complete, targets} = createBattle();
        const stand = Card.cards[name].copy();
        mission.curPhase = Mission.STAND_PHASE;
        mission.gameState.evaluate = () => true;
        mission.player.currentHP = 20;
        for (let round = 0; round < 2; round++) {
            stand.act(mission, mission.player);
            expect(play.mock.calls[round][0]).toBe(stand);
            expect(targets()).toEqual([mission.player]);
            expect(mission.player.currentHP).toBe(20 + round * amount);
            impact();
            expect(mission.player.currentHP).toBe(20 + (round + 1) * amount);
            complete();
            expect(mission.active).toBe(false);
        }
    });

    it("finishes the first healing stand's stream before starting the second stand", () => {
        const {mission, play, impact, complete} = createBattle();
        const first = Card.cards["Heal stand"].copy();
        const second = Card.cards["Higher heal stand"].copy();
        mission.pushStand(first);
        mission.pushStand(second);
        mission.gameState.evaluate = () => true;
        mission.nextPhase(Mission.STAND_PHASE);
        mission.nextPlayer();
        expect(play).toHaveBeenCalledOnce();
        expect(play.mock.calls[0][0]).toBe(first);
        impact();
        expect(mission.player.currentHP).toBe(150);
        complete();
        expect(play).toHaveBeenCalledTimes(2);
        expect(play.mock.calls[1][0]).toBe(second);
        expect(mission.player.currentHP).toBe(150);
        impact();
        expect(mission.player.currentHP).toBe(250);
        complete();
        expect(mission.cardActionInProgress).toBe(false);
    });

    it.each(["Heal stand", "Light stand"])("keeps an expiring %s visible as the source until its final action settles", name => {
        const {mission, impact, complete} = createBattle();
        const stand = Card.cards[name].copy();
        stand.standRounds = 1;
        mission.pushStand(stand);
        mission.gameState.evaluate = () => true;
        const updateStandGUI = vi.fn();
        const attacking = vi.fn();
        mission.standListener.push({updateStandGUI, Attacking: attacking});
        mission.nextPhase(Mission.STAND_PHASE);
        expect(stand.getRoundsRemaining()).toBe(0);
        expect(updateStandGUI.mock.lastCall[0][0]).toBe(stand);
        expect(attacking).toHaveBeenCalledWith(stand, 0);
        impact();
        expect(updateStandGUI.mock.lastCall[0][0]).toBe(stand);
        complete();
        expect(updateStandGUI.mock.lastCall[0][0]).toBeNull();
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
