import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Mission } from "../mechanics/mission";
import { Card } from "../objects/game-objects/card";
import { Deck } from "../objects/game-objects/deck";
import { Enemy } from "../objects/game-objects/enemy";
import { Player } from "../objects/game-objects/player";
import { ProgressStore } from "../progress/progress-store";

function createMission() {
    const mission = new Mission();
    mission.player = new Player("Wizard", 100, 10);
    mission.deck = new Deck();
    const card = new Card("Test", "", "", "l", Card.OTHER, false, 1, "");
    mission.deck.deck = {Test: card};
    mission.deck.setUpDeck();
    const hand = mission.player.hand;
    hand.missionScene = {tfgame: mission, callNextPhase: () => mission.nextPhase()};
    hand.listener.push({
        addCard: () => hand.playNextCard(),
        removeCard: vi.fn(),
        discardCard: vi.fn(),
        Activated: vi.fn(),
    });
    const enemy = new Enemy("first", 100, 10, undefined, "", [32, 32]);
    const nextEnemy = new Enemy("next", 100, 10, undefined, "", [32, 32]);
    mission.enemies = [[enemy], [nextEnemy]];
    mission.curPhase = Mission.ENERGY_PHASE;
    mission.active = true;
    return {mission, enemy, nextEnemy};
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("Mission catalog loading", () => {
    let previousCatalogs: {
        cards: typeof Card.cards;
        enemies: typeof Enemy.enemies;
        missions: typeof Mission.Missions;
        decks: typeof Deck.Decks;
    };

    beforeEach(() => {
        previousCatalogs = {cards: Card.cards, enemies: Enemy.enemies, missions: Mission.Missions, decks: Deck.Decks};
        Card.cards = {};
        Enemy.enemies = {};
        Mission.Missions = {};
        Deck.Decks = {};
        Card.createFromJSON(readFileSync("src/tempus-fugit-client/json/cards.json", "utf8"));
        const scene: Phaser.Scene = Object.create(null);
        Object.assign(scene, {load: {spritesheet: vi.fn()}});
        Enemy.createFromJSON(readFileSync("src/tempus-fugit-client/json/enemies.json", "utf8"), scene);
    });

    afterEach(() => {
        Card.cards = previousCatalogs.cards;
        Enemy.enemies = previousCatalogs.enemies;
        Mission.Missions = previousCatalogs.missions;
        Deck.Decks = previousCatalogs.decks;
        vi.restoreAllMocks();
    });

    it("resolves every shipped mission's enemy, loot, and deck references", () => {
        const missionsJSON = readFileSync("src/tempus-fugit-client/json/mission.json", "utf8");
        expect(() => Mission.createFromJSON(missionsJSON)).not.toThrow();
        const definitions = JSON.parse(missionsJSON).missions;
        expect(Object.keys(Mission.Missions)).toHaveLength(definitions.length);
        for (const definition of definitions) {
            const key = definition.key || definition.name;
            expect(Mission.Missions[key].getMaxWaveCount()).toBe(definition.enemies.length);
            if (definition.deck) expect(Object.keys(Deck.Decks[key].deck)).toHaveLength(definition.deck.length);
        }
    });

    it("restores Lightning strike using its card name", () => {
        vi.spyOn(ProgressStore, "load").mockReturnValue({
            version: 1,
            missionStates: [false],
            unlockedCardKeys: ["Lightning strike"],
            customDeckCardKeys: ["Lightning strike"],
            playerMaxHP: 125,
            playerBaseAttack: 2,
            newCardNames: [],
            tutorialShown: false,
            deckBuilderTutorialShown: false,
            lastPlayedLevelIndex: -1,
            musicMuted: false,
        });
        const player = new Player("Wizard", 125, 2);
        const deck = new Deck();
        ProgressStore.applyToPlayerAndDeck(player, deck, 9);
        expect(player.cardTypes["Lightning strike"]?.name).toBe("Lightning strike");
        expect(deck.deck["Lightning strike"]?.name).toBe("Lightning strike");
        expect(deck.deck["Lightning strike"]?.animation).toBe("lightning");
    });
});

describe("Wave transition input locking", () => {
    it("locks inputs immediately on the final kill, including the death-animation delay", () => {
        const {mission, enemy} = createMission();
        enemy.takeHit(100, mission);
        expect(mission.waveTransitionInProgress).toBe(true);
        expect(mission.active).toBe(false);
        expect(mission.player.active).toBe(false);
        expect(mission.gameState.active).toBe(false);
        expect(mission.gameState.invertVariableUser("l")).toBe(4);
        expect(mission.tryConsumeBaseAttack()).toBe(false);

        vi.advanceTimersByTime(349);
        expect(mission.waveCounter).toBe(0);
        vi.advanceTimersByTime(1);
        expect(mission.waveCounter).toBe(1);
        expect(mission.active).toBe(false);
        vi.advanceTimersByTime(2000);
        expect(mission.waveTransitionInProgress).toBe(true);
        expect(mission.active).toBe(false);
    });

    it("does not unlock on dialog resume or allow stale phase continuations", () => {
        const {mission, enemy} = createMission();
        enemy.takeHit(100, mission);
        vi.advanceTimersByTime(350);
        mission.setPaused(true);
        mission.nextPhase(Mission.STAND_PHASE);
        mission.setPaused(false);
        mission.active = true;
        mission.nextPlayer();
        mission.nextPhase(Mission.DRAW_PHASE);

        expect(mission.curPhase).toBe(Mission.ENERGY_PHASE);
        expect(mission.active).toBe(false);
        expect(mission.player.hand.getCards().filter(Boolean)).toHaveLength(0);

        mission.startWaveCombat();
        expect(mission.waveTransitionInProgress).toBe(false);
        expect(mission.curPhase).toBe(Mission.ENERGY_PHASE);
        expect(mission.active).toBe(true);
        expect(mission.gameState.active).toBe(true);
        expect(mission.player.hand.getCards().filter(Boolean)).toHaveLength(1);
        mission.startWaveCombat();
        expect(mission.player.hand.getCards().filter(Boolean)).toHaveLength(1);
    });

    it("locks the initial presentation and starts combat only when it finishes", () => {
        const {mission} = createMission();
        mission.startCombat();
        expect(mission.active).toBe(false);
        expect(mission.waveTransitionInProgress).toBe(true);
        mission.startWaveCombat();
        expect(mission.active).toBe(true);
        expect(mission.curPhase).toBe(Mission.ENERGY_PHASE);
    });

    it("keeps inputs locked after the final wave while victory animations play", () => {
        const {mission, enemy} = createMission();
        mission.enemies = [[enemy]];
        enemy.takeHit(100, mission);
        vi.advanceTimersByTime(350);
        expect(mission.isGameWon()).toBe(true);
        mission.active = true;
        mission.startWaveCombat();
        expect(mission.active).toBe(false);
        expect(mission.waveTransitionInProgress).toBe(true);
    });

    it.each([Mission.ENERGY_PHASE, Mission.PLAY_PHASE])("restores correct inputs if a clear is cancelled in phase %i", phase => {
        const {mission, enemy} = createMission();
        mission.curPhase = phase;
        enemy.takeHit(100, mission);
        enemy.currentHP = 10;
        vi.advanceTimersByTime(350);
        expect(mission.waveCounter).toBe(0);
        expect(mission.waveTransitionInProgress).toBe(false);
        expect(mission.active).toBe(true);
        expect(mission.gameState.active).toBe(phase === Mission.ENERGY_PHASE);
    });

    it("keeps a paused clear locked until it can advance and finish presentation", () => {
        const {mission, enemy} = createMission();
        enemy.takeHit(100, mission);
        mission.setPaused(true);
        vi.advanceTimersByTime(350);
        expect(mission.waveCounter).toBe(0);
        mission.setPaused(false);
        expect(mission.waveCounter).toBe(1);
        expect(mission.active).toBe(false);
        mission.startWaveCombat();
        expect(mission.active).toBe(true);
    });
});
