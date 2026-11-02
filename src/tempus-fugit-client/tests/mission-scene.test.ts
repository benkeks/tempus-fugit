import { EventEmitter } from "node:events";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MissionScene } from "../scenes/mission-scene";
import { Mission } from "../mechanics/mission";
import { Deck } from "../objects/game-objects/deck";
import { Enemy } from "../objects/game-objects/enemy";
import { Player } from "../objects/game-objects/player";
import { Card } from "../objects/game-objects/card";
import { DiscardGUI } from "../objects/game-gui-objects/discard-gui";
import { HandGUI } from "../objects/game-gui-objects/hand-gui";
import type { CardGUI } from "../objects/game-gui-objects/card-gui";
import { PlayerGUI } from "../objects/game-gui-objects/player-gui";

const {discardChoices} = vi.hoisted(() => ({
    discardChoices: [] as {card: Card; click(): void}[],
}));

vi.hoisted(() => {
    class GameObject {}
    vi.stubGlobal("Phaser", {
        Scene: class {},
        GameObjects: {Container: GameObject, Sprite: GameObject, Group: GameObject},
        Geom: {Rectangle: class {}},
        Scenes: {Events: {SHUTDOWN: "shutdown"}},
    });
});
vi.mock("../game", () => ({GameInfo: {}}));
vi.mock("../scenes/music-scene", () => ({MusicScene: {instance: {play: vi.fn()}}}));
vi.mock("../objects/tutorial-objects/tutorial-window", () => ({TutorialWindow: class {}}));
vi.mock("../objects/game-gui-objects/discard-card", () => ({
    DiscardCard: class {
        private callback: (() => void) | undefined;
        constructor(_scene: MissionScene, _x: number, _y: number, public card: Card) {discardChoices.push(this);}
        setScale() {return this;}
        on(_event: string, callback: () => void) {this.callback = callback; return this;}
        click() {this.callback?.call(this);}
        destroy() {}
    },
}));

function createMission() {
    const mission = new Mission();
    mission.player = new Player("Wizard", 100, 10);
    mission.deck = new Deck();
    mission.enemies = [
        [new Enemy("first", 100, 10, undefined, "", [32, 32])],
        [new Enemy("next", 100, 10, undefined, "", [32, 32])],
    ];
    mission.curPhase = Mission.ENERGY_PHASE;
    return mission;
}

function createScene() {
    const scene = new MissionScene();
    const events = new EventEmitter();
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const delayedCall = vi.fn((delay: number, callback: () => void) => {
        const timer = setTimeout(() => {
            timers.delete(timer);
            callback();
        }, delay);
        timers.add(timer);
        return {remove: () => {clearTimeout(timer); timers.delete(timer);}};
    });
    const start = vi.fn();
    Object.assign(scene, {
        tfgame: createMission(),
        events,
        time: {delayedCall},
        tweens: {},
        scene: {
            start,
            pause: () => events.emit("pause"),
            setVisible: vi.fn(),
            run: vi.fn(),
        },
        enemyGUI: {setEnemies: vi.fn(), fadeInDuration: 400},
        updateHelp: vi.fn(),
    });
    // Phaser removes scene-clock timers before notifying the scene of shutdown.
    events.once("shutdown", () => timers.forEach(timer => clearTimeout(timer)));
    events.on("pause", scene["handleScenePause"]);
    events.on("resume", scene["handleSceneResume"]);
    events.once("shutdown", scene["handleSceneShutdown"]);
    scene.tfgame.player.hand.missionScene = scene;
    const tween: Phaser.Tweens.Tween = Object.create(EventEmitter.prototype);
    Object.assign(tween, new EventEmitter(), {stop: () => {tween.emit("stop"); return tween;}});
    return {scene, events, delayedCall, start, tween};
}

beforeEach(() => {
    vi.useFakeTimers();
    discardChoices.length = 0;
});
afterAll(() => vi.unstubAllGlobals());
afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe("Mission scene animation lifecycle", () => {
    it("does not restart recoil over an already running death pose", async () => {
        const {scene, tween} = createScene();
        const add = vi.fn(() => tween);
        const track = vi.spyOn(scene, "trackCombatAnimation").mockImplementation(tween => tween);
        Object.assign(scene, {
            tweens: {add},
            add: {text: () => ({y: 0}), sprite: () => ({})},
        });
        const gui: PlayerGUI = Object.create(PlayerGUI.prototype);
        Object.assign(gui, {
            scene, x: 0, y: 0, angle: 0, isDead: false,
            hpText: {setText: vi.fn()}, baseAttackText: {}, sword: {}, heart: {},
        });
        await gui.playerHpChanged(0, -100);
        expect(track).toHaveBeenCalledTimes(3);
        await gui.playerHpChanged(0, -15);
        expect(track).toHaveBeenCalledTimes(3);
    });

    it("presents a simultaneous defeat only once, including repeated notifications before shutdown", async () => {
        const {scene, start, tween} = createScene();
        scene.trackCombatAnimation(tween);
        const endings = [scene.gameover(scene.tfgame, false), scene.gameover(scene.tfgame, false)];
        await vi.advanceTimersByTimeAsync(0);
        tween.emit("complete");
        await vi.advanceTimersByTimeAsync(300);
        await Promise.all(endings);
        await scene.gameover(scene.tfgame, false);
        expect(start).toHaveBeenCalledOnce();
    });

    it("waits for reactions and the settling delay before presenting defeat", async () => {
        const {scene, start, tween} = createScene();
        scene.trackCombatAnimation(tween);
        const ending = scene.gameover(scene.tfgame, false);
        await vi.advanceTimersByTimeAsync(500);
        expect(start).not.toHaveBeenCalled();
        tween.emit("complete");
        await vi.advanceTimersByTimeAsync(299);
        expect(start).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(1);
        await ending;
        expect(start).toHaveBeenCalledExactlyOnceWith("DeathScene", {mission: scene.tfgame, index: scene.missionIndex});
    });

    it.each(["same-frame", "combat", "settling"])("cancels a stale %s game-over on retry", async stage => {
        const {scene, events, start, tween, delayedCall} = createScene();
        scene.trackCombatAnimation(tween);
        const ending = scene.gameover(scene.tfgame, false);
        if (stage !== "same-frame") await vi.advanceTimersByTimeAsync(0);
        if (stage === "settling") {
            tween.emit("complete");
            await vi.advanceTimersByTimeAsync(0);
        }
        events.emit("shutdown");
        scene.tfgame = createMission();
        delayedCall.mockClear();
        await vi.advanceTimersByTimeAsync(1000);
        await ending;
        expect(start).not.toHaveBeenCalled();
        expect(delayedCall).not.toHaveBeenCalled();
        expect(scene.updateHelp).not.toHaveBeenCalled();
    });

    it.each(["delay", "combat"])("cancels a phase loop waiting for %s on retry", async stage => {
        const {scene, events, tween} = createScene();
        scene.tfgame.curPhase = Mission.ENEMY_PHASE;
        const oldNext = vi.spyOn(scene.tfgame, "nextPlayer").mockImplementation(async () => {});
        scene.trackCombatAnimation(tween);
        const iteration = scene.iteratePhases(Mission.ENEMY_PHASE, 500);
        if (stage === "combat") await vi.advanceTimersByTimeAsync(500);
        events.emit("shutdown");
        scene.tfgame = createMission();
        scene.tfgame.curPhase = Mission.ENEMY_PHASE;
        const newNext = vi.spyOn(scene.tfgame, "nextPlayer").mockImplementation(async () => {
            scene.tfgame.curPhase = Mission.ENERGY_PHASE;
        });
        await vi.advanceTimersByTimeAsync(1000);
        await iteration;
        expect(oldNext).toHaveBeenCalledTimes(stage === "combat" ? 1 : 0);
        expect(newNext).not.toHaveBeenCalled();
    });

    it("cancels victory and removes resume waiters when a monolog is abandoned", async () => {
        const {scene, events, start} = createScene();
        scene.tfgame.monologue[0] = "Victory";
        const ending = scene.gameover(scene.tfgame, true);
        await vi.advanceTimersByTimeAsync(0);
        expect(events.listenerCount("resume")).toBe(2);
        events.emit("shutdown");
        scene.tfgame = createMission();
        await ending;
        expect(events.listenerCount("resume")).toBe(0);
        expect(events.listenerCount("shutdown")).toBe(0);
        events.emit("resume");
        expect(start).not.toHaveBeenCalled();
        expect(scene.updateHelp).not.toHaveBeenCalled();
    });

    it.each(["monolog", "fade"])("cancels wave presentation during %s without touching the replacement battle", async stage => {
        const {scene, events} = createScene();
        const old = scene.tfgame;
        old.waveCounter = 1;
        const startCombat = vi.spyOn(old, "startWaveCombat");
        scene["pendingWavePresentation"] = {
            game: old, enemies: old.getEnemies(), dialogs: [],
            monolog: stage === "monolog" ? "Next wave" : undefined,
        };
        const presentation = scene["flushWavePresentation"](old);
        events.emit("shutdown");
        scene.tfgame = createMission();
        const setEnemies = vi.fn();
        Object.assign(scene, {enemyGUI: {setEnemies}});
        await presentation;
        expect(startCombat).not.toHaveBeenCalled();
        expect(setEnemies).not.toHaveBeenCalled();
        expect(events.listenerCount("resume")).toBe(0);
    });

    it("does not restore old dialog interactivity into a replacement mission", async () => {
        const {scene, events} = createScene();
        const presentation = scene["withMissionPresentation"](
            scene.tfgame, {blocking: false, suspendPlayerOnly: true}, vi.fn(),
        );
        events.emit("shutdown");
        scene.tfgame = createMission();
        scene.tfgame.active = false;
        await presentation;
        expect(scene.tfgame.active).toBe(false);
    });

    it("removes resume and shutdown listeners when a presentation resumes normally", async () => {
        const {scene, events} = createScene();
        const presentation = scene["withMissionPresentation"](scene.tfgame, {blocking: true}, vi.fn());
        events.emit("pause");
        events.emit("resume");
        await presentation;
        expect(scene.tfgame.paused).toBe(false);
        expect(events.listenerCount("resume")).toBe(1);
        expect(events.listenerCount("shutdown")).toBe(2);
    });

    it("defers wall-clock wave advancement while the scene is paused", async () => {
        const {scene, events} = createScene();
        const mission = scene.tfgame;
        mission.getEnemies()[0].takeHit(100, mission);
        events.emit("pause");
        expect(mission.paused).toBe(true);
        await vi.advanceTimersByTimeAsync(500);
        expect(mission.waveCounter).toBe(0);
        events.emit("resume");
        expect(mission.paused).toBe(false);
        expect(mission.waveCounter).toBe(1);
        expect(mission.active).toBe(false);
    });

    it("does not unlock an unfinished action on scene resume", () => {
        const {scene, events} = createScene();
        scene.tfgame.cardActionInProgress = true;
        events.emit("pause");
        events.emit("resume");
        expect(scene.tfgame.paused).toBe(false);
        expect(scene.tfgame.active).toBe(false);
    });

    it.each([Mission.ENERGY_PHASE, Mission.PLAY_PHASE])("keeps discard controls isolated in phase %i after resume", phase => {
        const {scene, events} = createScene();
        scene.tfgame.curPhase = phase;
        scene.tfgame.player.hand.discardGUIStarted = true;
        scene.tfgame.active = false;
        events.emit("pause");
        events.emit("resume");
        expect(scene.tfgame.active).toBe(false);
        expect(scene.tfgame.player.hand.active).toBe(false);
        expect(scene.tfgame.gameState.active).toBe(false);
        scene.tfgame.player.hand.discardGUIStarted = false;
        scene.onDiscardDialogClosed();
        expect(scene.tfgame.active).toBe(true);
        expect(scene.tfgame.gameState.active).toBe(phase === Mission.ENERGY_PHASE);
    });

    it("runs only one iteration chain for the same phase", async () => {
        const {scene} = createScene();
        scene.tfgame.curPhase = Mission.ENEMY_PHASE;
        const next = vi.spyOn(scene.tfgame, "nextPlayer").mockImplementation(async () => {
            scene.tfgame.curPhase = Mission.ENERGY_PHASE;
        });
        const first = scene.iteratePhases(Mission.ENEMY_PHASE, 500);
        const second = scene.iteratePhases(Mission.ENEMY_PHASE, 500);
        await vi.advanceTimersByTimeAsync(500);
        await Promise.all([first, second]);
        expect(next).toHaveBeenCalledOnce();
        expect(scene["phaseIteration"]).toBeNull();
    });

    it("resumes rather than losing a phase advance when its timer dispatches while paused", async () => {
        const {scene, events} = createScene();
        scene.tfgame.curPhase = Mission.ENEMY_PHASE;
        const next = vi.spyOn(scene.tfgame, "nextPlayer").mockImplementation(async () => {
            scene.tfgame.curPhase = Mission.ENERGY_PHASE;
        });
        const iteration = scene.iteratePhases(Mission.ENEMY_PHASE, 500);
        events.emit("pause");
        await vi.advanceTimersByTimeAsync(500);
        expect(next).not.toHaveBeenCalled();
        events.emit("resume");
        await iteration;
        expect(next).toHaveBeenCalledOnce();
    });

    it("does not let an abandoned iteration clear the replacement phase owner", async () => {
        const {scene, events} = createScene();
        scene.tfgame.curPhase = Mission.ENEMY_PHASE;
        const old = scene.iteratePhases(Mission.ENEMY_PHASE, 500);
        events.emit("shutdown");
        scene.tfgame = createMission();
        scene.tfgame.curPhase = Mission.ENEMY_PHASE;
        const next = vi.spyOn(scene.tfgame, "nextPlayer").mockImplementation(async () => {
            scene.tfgame.curPhase = Mission.ENERGY_PHASE;
        });
        const current = scene.iteratePhases(Mission.ENEMY_PHASE, 100);
        await vi.advanceTimersByTimeAsync(100);
        await Promise.all([old, current]);
        expect(next).toHaveBeenCalledOnce();
    });

    it("releases the animation lock once on watchdog timeout", async () => {
        const {scene, tween} = createScene();
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        scene.trackCombatAnimation(tween);
        const settled = vi.fn();
        void scene.waitForActionAnimations().then(settled);
        await vi.advanceTimersByTimeAsync(2500);
        expect(warn).toHaveBeenCalledExactlyOnceWith("Combat animation timed out after 2500ms");
        expect(settled).toHaveBeenCalledOnce();
        tween.emit("complete");
        await Promise.resolve();
        expect(settled).toHaveBeenCalledOnce();
        await expect(scene.waitForActionAnimations()).resolves.toBeUndefined();
    });
});

describe("Player turn completion", () => {
    it("locks input immediately and grants the bonus draw once despite duplicate Done requests", async () => {
        const {scene, events} = createScene();
        const game = scene.tfgame;
        const attack = vi.spyOn(game.player, "attackWithBaseAttack");
        const draw = vi.spyOn(game.player, "takeCard").mockReturnValue(new Card("Test", "", "", "l", Card.OTHER, false, 1, ""));
        const first = scene.endPlayerTurn(true);
        expect(game.active).toBe(false);
        expect(game.player.hand.active).toBe(false);
        expect(game.gameState.active).toBe(false);
        events.emit("pause");
        events.emit("resume");
        expect(game.active).toBe(false);
        const second = scene.endPlayerTurn(false);
        await vi.advanceTimersByTimeAsync(499);
        expect(draw).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(1);
        await Promise.all([first, second]);
        expect(attack).toHaveBeenCalledOnce();
        expect(draw).toHaveBeenCalledOnce();
        expect(game.curPhase).toBe(Mission.ENEMY_PHASE);
        expect(game.cardActionInProgress).toBe(false);
    });

    it("waits for outstanding fallback reactions even without a bonus attack", async () => {
        const {scene, tween} = createScene();
        const attack = vi.spyOn(scene.tfgame.player, "attackWithBaseAttack");
        const draw = vi.spyOn(scene.tfgame.player, "takeCard");
        scene.trackCombatAnimation(tween);
        const ending = scene.endPlayerTurn(false);
        await vi.advanceTimersByTimeAsync(500);
        expect(scene.tfgame.curPhase).toBe(Mission.ENERGY_PHASE);
        tween.emit("complete");
        await ending;
        expect(scene.tfgame.curPhase).toBe(Mission.ENEMY_PHASE);
        expect(attack).not.toHaveBeenCalled();
        expect(draw).not.toHaveBeenCalled();
    });

    it("retains a paused turn completion until resume instead of dropping its draw", async () => {
        const {scene, events} = createScene();
        const draw = vi.spyOn(scene.tfgame.player, "takeCard").mockReturnValue(new Card("Test", "", "", "l", Card.OTHER, false, 1, ""));
        const ending = scene.endPlayerTurn(true);
        events.emit("pause");
        await vi.advanceTimersByTimeAsync(500);
        expect(draw).not.toHaveBeenCalled();
        expect(scene.tfgame.cardActionInProgress).toBe(true);
        events.emit("resume");
        await ending;
        expect(draw).toHaveBeenCalledOnce();
        expect(scene.tfgame.curPhase).toBe(Mission.ENEMY_PHASE);
    });

    it("cancels an abandoned Done sequence without advancing the replacement mission", async () => {
        const {scene, events} = createScene();
        const draw = vi.spyOn(scene.tfgame.player, "takeCard");
        const ending = scene.endPlayerTurn(true);
        events.emit("shutdown");
        scene.tfgame = createMission();
        await ending;
        expect(draw).not.toHaveBeenCalled();
        expect(scene.tfgame.curPhase).toBe(Mission.ENERGY_PHASE);
        expect(scene.tfgame.cardActionInProgress).toBe(false);
    });

    it("rejects late Done events after shutdown without scheduling new work", async () => {
        const {scene, events, delayedCall} = createScene();
        const attack = vi.spyOn(scene.tfgame.player, "attackWithBaseAttack");
        events.emit("shutdown");
        delayedCall.mockClear();
        await scene.endPlayerTurn(true);
        expect(attack).not.toHaveBeenCalled();
        expect(delayedCall).not.toHaveBeenCalled();
    });

    it("does not grant a bonus draw or advance the old turn after its final kill", async () => {
        const {scene} = createScene();
        scene.tfgame.getEnemies()[0].currentHP = 10;
        const draw = vi.spyOn(scene.tfgame.player, "takeCard");
        const ending = scene.endPlayerTurn(true);
        await vi.advanceTimersByTimeAsync(500);
        await ending;
        expect(draw).not.toHaveBeenCalled();
        expect(scene.tfgame.waveCounter).toBe(1);
        expect(scene.tfgame.waveTransitionInProgress).toBe(true);
        expect(scene.tfgame.active).toBe(false);
    });
});

describe("Deferred hand controls", () => {
    function createDiscard() {
        const fixture = createScene();
        const {scene} = fixture;
        const hand = scene.tfgame.player.hand;
        const card = new Card("Test", "", "", "l", Card.OTHER, false, 1, "");
        hand.cards = Array.from({length: 5}, () => card.copy());
        hand.cardQueue = [card.copy()];
        hand.discardGUIStarted = true;
        const deck = {description: {setVisible: vi.fn()}, toggleVisible: vi.fn()};
        const gui = {cardGUIs: hand.cards.map(card => ({card, setVisible: vi.fn()}))};
        Object.assign(scene, {
            deckGUI: deck, handGUI: gui, add: {text: () => ({destroy: vi.fn()})},
        });
        new DiscardGUI(scene, hand, scene.deckGUI, scene.handGUI, card);
        return {...fixture, hand};
    }

    it("locks the hand and table immediately when a discard selection opens", () => {
        const {scene, hand} = createDiscard();
        expect(scene.tfgame.active).toBe(false);
        expect(hand.active).toBe(false);
        expect(scene.tfgame.gameState.active).toBe(false);
    });

    it("keeps input locked between queued discard choices", async () => {
        const {scene, hand} = createDiscard();
        const next = vi.spyOn(hand, "playNextCard");
        discardChoices[5].click();
        expect(hand.discardGUIStarted).toBe(true);
        scene.onDiscardDialogClosed();
        expect(scene.tfgame.active).toBe(false);
        await vi.advanceTimersByTimeAsync(249);
        expect(next).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(1);
        expect(next).toHaveBeenCalledOnce();
        expect(hand.discardGUIStarted).toBe(true);
        expect(scene.tfgame.active).toBe(false);
    });

    it("cancels a deferred discard callback on retry", async () => {
        const {scene, events, hand} = createDiscard();
        const next = vi.spyOn(hand, "playNextCard");
        discardChoices[5].click();
        events.emit("shutdown");
        scene.tfgame = createMission();
        await vi.advanceTimersByTimeAsync(500);
        expect(next).not.toHaveBeenCalled();
        expect(scene.tfgame.player.hand.discardGUIStarted).toBe(false);
    });

    function createHover() {
        const fixture = createScene();
        const {scene} = fixture;
        const cards = [0, 1].map(() => {
            const card: CardGUI = Object.create(null);
            Object.assign(card, {
                active: true, scene, hoverTween: {isPlaying: () => true}, hover: vi.fn(),
            });
            return card;
        });
        const gui: HandGUI = Object.create(HandGUI.prototype);
        Object.assign(gui, {
            scene, missionScene: scene, hand: scene.tfgame.player.hand,
            cardGUIs: cards, hoverRequest: 0, unhoverAll: vi.fn(),
        });
        return {...fixture, cards, gui};
    }

    it("runs only the latest pending hover request", async () => {
        const {gui, cards} = createHover();
        gui.toggleHovering(cards[0], false);
        gui.toggleHovering(cards[1], false);
        await vi.advanceTimersByTimeAsync(100);
        expect(cards[0].hover).not.toHaveBeenCalled();
        expect(cards[1].hover).toHaveBeenCalledOnce();
        expect(gui.unhoverAll).toHaveBeenCalledOnce();
    });

    it.each(["locked", "shutdown"])("cancels queued hover work when the hand becomes %s", async state => {
        const {scene, events, cards, gui} = createHover();
        gui.toggleHovering(cards[0], false);
        if (state === "shutdown") events.emit("shutdown");
        else scene.tfgame.active = false;
        await vi.advanceTimersByTimeAsync(100);
        expect(cards[0].hover).not.toHaveBeenCalled();
    });
});
