import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Mission } from "../mechanics/mission";
import { Card } from "../objects/game-objects/card";
import { Deck } from "../objects/game-objects/deck";
import { Enemy } from "../objects/game-objects/enemy";
import { Player } from "../objects/game-objects/player";

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
