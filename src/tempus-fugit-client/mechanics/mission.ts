import { Deck } from "../objects/game-objects/deck";
import { Player, PlayerListener } from "../objects/game-objects/player";
import { GameState } from "../objects/game-objects/game-state";
import { Enemy, EnemyListener } from "../objects/game-objects/enemy";
import { StoryDialog } from "./story-dialog";
import { Card } from "../objects/game-objects/card";

type PendingMissionContinuation =
    | { kind: "nextPhase"; next: number }
    | { kind: "nextPlayer" };

export class Mission implements EnemyListener, PlayerListener {
    public static DEBUG_FLOW: boolean = false;

    private static readonly PHASE_HANDLERS: Array<{
        run(game: Mission): void;
        notify(listener: MissionListener, game: Mission): void;
    }> = [
        {
            run: game => game.drawPhase(),
            notify: (listener, game) => listener.drawPhase(game),
        },
        {
            run: game => game.energyPhase(),
            notify: (listener, game) => listener.energyPhase(game),
        },
        {
            run: game => game.playPhase(),
            notify: (listener, game) => listener.playPhase(game),
        },
        {
            run: game => game.standPhase(),
            notify: (listener, game) => listener.standPhase(game),
        },
        {
            run: game => game.enemyPhase(),
            notify: (listener, game) => listener.enemyPhase(game),
        },
    ];

    get enemies(): Enemy[][] {
        return this._enemies;
    }

    set enemies(value: Enemy[][]) {
        this._enemies = value;

        for (let i in value) {
            let eList: Enemy[] = value[i];

            eList.map(e => e.listener.push(this))
        }
    }

    get active(): boolean {
        return this._active;
    }

    set active(value: boolean) {
        this._active = value;
        this.player.active = value;
        this.gameState.active = value;

        this.listener.map(l => l.Activated(this, this.active));
    }

    get player(): Player {
        return this._player;
    }

    set player(value: Player) {
        this._player = value;
        this.player.listener.push(this);
    }

    public pushStand(stand: Card) {
        if (this.stands[0] != null && this.stands[1] != null) {
            if (this.stands[0].getRoundsRemaining() <= this.stands[1].getRoundsRemaining()) {
                this.stands[0] = stand;
            } else {
                this.stands[1] = stand;
            }
        } else {
            if (this.stands[0] == null) {
                this.stands[0] = stand;
            } else {
                this.stands[1] = stand;
            }
        }
        for (let l of this.standListener) {
            l.updateStandGUI(this.stands);
        }

    }

    public static readonly DRAW_PHASE: number = 0;
    public static readonly ENERGY_PHASE: number = 1;
    public static readonly PLAY_PHASE: number = 2;
    public static readonly STAND_PHASE: number = 3;
    public static readonly ENEMY_PHASE: number = 4;

    public static Missions: { [name: string]: Mission } = {};
    public name!: string;
    public key!: string;
    public background!: string;
    public waveCounter: number;
    public _enemies: Enemy[][] = [];
    public monologue: { [wave: string]: string } = {};
    public music: { [wave: string]: string } = {};
    public dialogue: StoryDialog[] = [];

    public readonly numPhases: number = 5;
    public curPhase: number;
    public curTurn: number;

    public listener: MissionListener[] = [];
    public standListener: StandListener[] = [];

    public deck!: Deck;
    public _player!: Player;
    public gameState: GameState;

    public _active: boolean = true;

    private stands: [Card | null, Card | null] = [null, null];

    public loot: Card[] = []; // card name and maximal number of occurances

    public iterateEachParticipand: boolean = true;
    public iteratorIndex: number = 0;
    public paused: boolean = false;
    private pendingContinuations: PendingMissionContinuation[] = [];
    private pendingWaveTransition: ReturnType<typeof setTimeout> | null = null;
    private aliveEnemiesCount = -1;
    // TODO: effect list

    private debugFlow(event: string, details: { [key: string]: unknown } = {}): void {
        if (!Mission.DEBUG_FLOW) return;

        console.log("[MissionFlow]", event, {
            wave: this.waveCounter,
            phase: this.curPhase,
            turn: this.curTurn,
            paused: this.paused,
            aliveEnemies: this.aliveEnemiesCount,
            ...details,
        });
    }

    private countAliveEnemies(): number {
        return this.getEnemies().filter(enemy => enemy.currentHP > 0).length;
    }

    private cancelPendingWaveTransition(): void {
        if (this.pendingWaveTransition === null) return;

        clearTimeout(this.pendingWaveTransition);
        this.pendingWaveTransition = null;
    }

    private beginWave(): void {
        this.cancelPendingWaveTransition();
        this.aliveEnemiesCount = this.countAliveEnemies();
    }

    private requestAdvanceIfWaveCleared(reason: string): boolean {
        if (this.getEnemies().length === 0) {
            return false;
        }

        this.aliveEnemiesCount = this.countAliveEnemies();
        if (this.aliveEnemiesCount > 0) {
            return false;
        }

        this.debugFlow("waveCleared", { reason });
        this.scheduleNextWave(this.waveCounter + 1, reason);
        return true;
    }

    private scheduleNextWave(next: number, reason: string): void {
        if (this.pendingWaveTransition !== null) {
            this.debugFlow("nextWave:alreadyScheduled", { nextWave: next, reason });
            return;
        }

        const scheduledFromWave = this.waveCounter;
        this.debugFlow("nextWave:scheduled", { fromWave: scheduledFromWave, toWave: next, reason, delayMs: 350 });
        this.pendingWaveTransition = setTimeout(() => {
            this.pendingWaveTransition = null;

            if (this.waveCounter !== scheduledFromWave) {
                this.debugFlow("nextWave:cancelled", { reason: "waveChanged", scheduledFromWave, currentWave: this.waveCounter });
                return;
            }

            this.aliveEnemiesCount = this.countAliveEnemies();
            if (this.aliveEnemiesCount > 0) {
                this.debugFlow("nextWave:cancelled", { reason: "enemyRevivedOrWaveNotCleared", aliveEnemies: this.aliveEnemiesCount });
                return;
            }

            this.nextWave(next);
        }, 350);
    }

    public setPaused(value: boolean): void {
        if (this.paused === value) return;

        this.debugFlow("setPaused", { from: this.paused, to: value });
        this.paused = value;
        if (value) {
            this.active = false;
            return;
        }

        if (this.curPhase === Mission.ENERGY_PHASE || this.curPhase === Mission.PLAY_PHASE) {
            this.active = true;
        }

        this.flushPendingContinuations();
    }

    private queueContinuation(continuation: PendingMissionContinuation): void {
        if (continuation.kind === "nextPhase") {
            const existingPhase = this.pendingContinuations.find(
                pendingContinuation => pendingContinuation.kind === "nextPhase"
            ) as { kind: "nextPhase"; next: number } | undefined;

            if (existingPhase) {
                existingPhase.next = continuation.next;
                return;
            }

            const nextPlayerIndex = this.pendingContinuations.findIndex(
                pendingContinuation => pendingContinuation.kind === "nextPlayer"
            );

            if (nextPlayerIndex >= 0) {
                this.pendingContinuations.splice(nextPlayerIndex, 0, continuation);
                return;
            }
        }

        if (
            continuation.kind === "nextPlayer" &&
            this.pendingContinuations.some(pendingContinuation => pendingContinuation.kind === "nextPlayer")
        ) {
            return;
        }

        this.pendingContinuations.push(continuation);
    }

    private runContinuation(continuation: PendingMissionContinuation): void {
        if (continuation.kind === "nextPhase") {
            this.nextPhase(continuation.next);
            return;
        }

        this.nextPlayer();
    }

    private flushPendingContinuations(): void {
        while (!this.paused && this.pendingContinuations.length > 0) {
            const continuation = this.pendingContinuations.shift();
            if (!continuation) return;

            this.runContinuation(continuation);
        }
    }

    private applyPhase(phase: number): void {
        this.curPhase = phase;
        this.gameState.active = false;

        const handler = Mission.PHASE_HANDLERS[this.curPhase];
        if (!handler) return;

        handler.run(this);
        this.listener.map(listener => handler.notify(listener, this));
    }

    private continuePlayerIterationForCurrentPhase(): void {
        switch (this.curPhase) {
            case Mission.STAND_PHASE:
                this.standPhaseIterator();
                break;
            case Mission.ENEMY_PHASE:
                this.enemyPhaseIterator();
                break;
        }
    }

    public copy(): Mission {
        let mission: Mission = new Mission();
        mission.enemies = [];
        for (let wave of this.enemies) {
            let new_wave: Enemy[] = [];
            for (let e of wave) {
                new_wave.push(e.copy());
            }
            mission.enemies.push(new_wave);
        }

        mission.key = this.key;
        mission.name = this.name;
        mission.background = this.background;
        mission.monologue = { ...this.monologue };
        mission.music = { ...this.music };
        mission.dialogue = [];
        for (let d of this.dialogue) {
            mission.dialogue.push(d.copy());
        }

        mission.stands = [null, null];
        for (let s of this.stands) {
            if (s != null) mission.stands.push(s.copy());
        }

        for (let c of this.loot) {
            mission.loot.push(c.copy());
        }

        return mission;
    }

    constructor() {
        this.curPhase = 0;
        this.curTurn = 0;
        this.waveCounter = 0;

        this.listener = [];

        this.gameState = new GameState();
        this.gameState.setVariable("l", false);
        this.gameState.setVariable("t", false);
        this.gameState.setVariable("n", false);
        this.gameState.setVariable("s", false);
    }

    public checkDialogEvents() {
        for (let i = 0; i < this.dialogue.length; i++) {
            let d: StoryDialog = this.dialogue[i];
            if (d.isTriggered(this)) {
                this.listener.map(l => l.storyDialog(this, d));
                this.dialogue.splice(i, 1);
            }
        }
    }

    /**
     * Switches phases
     * --- Player's turn ---
     * 0 -> Draw Phase
     * 1 -> Energy Phase
     * 2 -> Play Phase
     * 3 -> Stand Phase
     * --- Enemy's turn ---
     * 4 -> Enemy Phase
     * 5 -> Effect Phase
     *
     * increments turn counter every time player turn is reached
     */
    public async nextPhase(next: number = (this.curPhase + 1) % this.numPhases) {
        this.debugFlow("nextPhase:requested", { from: this.curPhase, to: next });
        if (this.requestAdvanceIfWaveCleared("nextPhase")) return;

        if (this.paused) {
            this.debugFlow("nextPhase:queued", { requested: next });
            this.queueContinuation({ kind: "nextPhase", next });
            return;
        }

        if (next < this.curPhase) {
            this.endOfRound();
        }
        this.applyPhase(next);

        this.checkDialogEvents();
        this.debugFlow("nextPhase:applied", { phase: this.curPhase });

        if (this.iterateEachParticipand) this.nextPlayer();
    }

    public async nextPlayer() {
        this.debugFlow("nextPlayer:requested", { phase: this.curPhase, iteratorIndex: this.iteratorIndex });
        if (this.requestAdvanceIfWaveCleared("nextPlayer")) return;

        if (this.paused) {
            this.debugFlow("nextPlayer:queued", { phase: this.curPhase, iteratorIndex: this.iteratorIndex });
            this.queueContinuation({ kind: "nextPlayer" });
            return;
        }

        this.continuePlayerIterationForCurrentPhase();
    }


    public displayStoryMonolog(): boolean {
        const monolog = this.monologue[this.waveCounter];
        if (!monolog || monolog.length === 0) {
            return false;
        }

        this.listener.map(l => l.storyMonolog(this, monolog));
        return true;
    }

    public nextWave(next: number = this.waveCounter + 1): void {
        this.debugFlow("nextWave:start", { fromWave: this.waveCounter, toWave: next });
        this.waveCounter = next;

        if (this.checkGameOver()) return;

        this.beginWave();
        for (let e of this.getEnemies()) {
            e.listener.push(this);
        }

        this.listener.map(l => l.waveChanged(this, next, this.getEnemies()));
        this.checkDialogEvents();

        this.displayStoryMonolog();

        if (this.waveCounter in this.music) {
            this.listener.map(l => l.music(this, this.music[this.waveCounter]));
        }

        this.listener.map(l => l.wavePresentationReady?.(this));

        this.debugFlow("nextWave:done", { wave: this.waveCounter });
    }

    public checkGameOver(): boolean {
        let gameWon
        if (this.waveCounter >= this.getMaxWaveCount()) {
            this.listener.map(l => l.gameover(this, this.isGameWon()));
            return true;
        }

        return false;
    }

    private drawPhase(): void {
        this.player.takeCard(this.deck);
    }

    private energyPhase(): void {
        this.active = true;
    }

    private playPhase(): void {
        this.player.active = true;
        this.gameState.active = false;
        this.listener.map(l => l.baseAttackPossible(this, true));
    }

    private standPhaseIterator() {
        const waveAtStart = this.waveCounter;

        while (this.iteratorIndex < this.stands.length && this.stands[this.iteratorIndex] == null) {
            this.iteratorIndex++;
        }

        if (this.iteratorIndex >= this.stands.length) {
            this.nextPhase(Mission.ENEMY_PHASE);
            return;
        }

        let i = this.iteratorIndex;
        let stand = this.stands[i];
        if (stand != null) {
            let attacked = stand.act(this, this.player);

            if (this.waveCounter !== waveAtStart || this.curPhase !== Mission.STAND_PHASE) {
                return;
            }

            if (stand.getRoundsRemaining() <= 0) {
                this.stands[i] = null;
            }
            for (var l of this.standListener) {
                l.updateStandGUI(this.stands);
                if (attacked) l.Attacking(stand, this.iteratorIndex);
            }
        }

        this.iteratorIndex++;
    }

    private standPhase(): void {
        this.iteratorIndex = 0;
        this.active = false;

        if (!this.iterateEachParticipand) {
            for (let i of [0, 1]) {
                this.standPhaseIterator();
            }
        }
    }

    private enemyPhaseIterator() {
        while (this.iteratorIndex < this.getEnemies().length && this.getEnemies()[this.iteratorIndex].currentHP <= 0) {
            this.iteratorIndex++;
        }

        if (this.iteratorIndex >= this.getEnemies().length) {
            this.nextPhase(Mission.DRAW_PHASE);
            return;
        }

        let e = this.getEnemies()[this.iteratorIndex];
        e.performTurn(this);

        this.iteratorIndex++;
    }

    private enemyPhase(): void {
        this.iteratorIndex = 0;
        this.active = false;

        for (var stand of this.stands) {
            if (stand != null) stand.turnNormal();
        }

        if (!this.iterateEachParticipand) this.getEnemies().map(e => e.performTurn(this));
    }

    private endOfRound(): void {
        this.gameState.changeRound();

        this.curTurn++;
    }

    /**
     * Emits 'draw-phase' event to start the combat
     */
    public startCombat(): void {
        this.curPhase = 0;
        this.curTurn = 0;
        this.nextWave(0);
    }

    public getEnemies(): Enemy[] {
        let i = this.waveCounter;
        if (i < 0 || i >= this.enemies.length) {
            return [];
        }

        return this.enemies[i];
    }

    public getStands(): (Card | null)[] {
        return this.stands;
    }

    public getStandCount(): number {
        let count = 0;
        for (let c of this.stands) {
            if (c != null) count++;
        }
        return count;
    }

    public getMaxWaveCount(): number {
        return this.enemies.length;
    }

    public destroy(): void {
        this.cancelPendingWaveTransition();
        this.player.listener = [];
        this.player.hand.listener = [];
        this.deck.listener = [];
        this.gameState.listener = [];
        this.listener = [];
    }

    public isGameOver(): boolean {
        return this.waveCounter >= this.getMaxWaveCount() || this.player.getHP() <= 0;
    }

    public isGameWon(): boolean {
        return this.waveCounter >= this.getMaxWaveCount();
    }

    async enemyHpChanged(enemy: Enemy, changedFrom: number, changedTo: number) {
        const currentWaveEnemies = this.getEnemies();
        if (!currentWaveEnemies.includes(enemy)) return;

        this.aliveEnemiesCount = this.countAliveEnemies();
        this.debugFlow("enemyHpChanged", {
            enemy: enemy.name,
            from: changedFrom,
            to: changedTo,
            aliveEnemies: this.aliveEnemiesCount,
        });
        this.checkDialogEvents();

        if (this.aliveEnemiesCount <= 0) {
            this.scheduleNextWave(this.waveCounter + 1, "enemyHpChanged");
        }
    }

    async playerHpChanged(changedTo: number, changedBy:number) {
        if (changedTo <= 0) {
            this.listener.map(l => l.gameover(this, false));
        }
    }

    async Activated(player: Player, active: boolean) { }

    async Attacking(actor: Enemy | Player, target?: Enemy | boolean) {
        this.debugFlow("attacking", {
            actor: actor.name,
            actorType: actor instanceof Enemy ? "enemy" : "player",
            target: target instanceof Enemy ? target.name : target,
        });
        this.requestAdvanceIfWaveCleared("Attacking");
    }

    baseAttackChanged(enemy: Enemy) { }

    async cardPlayed(player, card) {
        if (this.curPhase == Mission.ENERGY_PHASE) this.nextPhase(Mission.PLAY_PHASE);
        this.listener.map(l => l.baseAttackPossible(this, false));
    }


    async stateValuesChanged(player: Player) { }

    public static createFromJSON(jString): void {
        let json = JSON.parse(jString);
        for (let m of json.missions) {
            let mission = new Mission();
            mission.name = m.name;
            mission.background = m.background;
            for (let wave of m.enemies) {
                let wave_enemies: Enemy[] = [];
                for (let e of wave) {
                    wave_enemies.push(Enemy.enemies[e].copy());
                }
                mission.enemies.push(wave_enemies);
            }

            if (m.music) mission.music = m.music;
            mission.monologue = m.monologue;

            for (let dial of m.dialogue) {
                let sd: StoryDialog = new StoryDialog(dial.text);
                sd.triggerFunctionString = dial.triggerFunctionString;
                sd.blocking = dial.blocking;
                sd.parsetriggerFunctionString();
                mission.dialogue.push(sd);
            }

            if (m.loot) {
                for (let i in m.loot) {
                    mission.loot.push(Card.cards[m.loot[i]].copy());
                }
            }

            if (m.key) mission.key = m.key;
            else mission.key = m.name;

            if (m.deck) {
                let d: Deck = new Deck();
                for (let c of m.deck) {
                    let card = Card.cards[c].copy();
                    d.deck[card.name] = card;
                }

                Deck.Decks[mission.key] = d;
            }

            this.Missions[mission.key] = mission;
        }
    }

}

export interface MissionListener {
    drawPhase(game: Mission): void;
    energyPhase(game: Mission): void;
    playPhase(game: Mission): void;
    standPhase(game: Mission): void;
    enemyPhase(game: Mission): void;
    storyDialog(game: Mission, dialog: StoryDialog): void;
    storyMonolog(game: Mission, monolog: string): void;
    waveChanged(game: Mission, activeWave: number, enemies: Enemy[]): void;
    wavePresentationReady?(game: Mission): void;
    gameover(game: Mission, gameWon: boolean): void;
    Activated(game: Mission, active: boolean);
    music(game:Mission, key:string);
    baseAttackPossible(game: Mission, active: boolean);
}


export interface StandListener {
    updateStandGUI(stands: [Card | null, Card | null]): void;
    Attacking(stand: Card, index: number);
}