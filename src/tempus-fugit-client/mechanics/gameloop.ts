import EventEmitter = Phaser.Events.EventEmitter;
import {Deck} from "../objects/game-objects/deck";
import {Player} from "../objects/game-objects/player";
import {Hand} from "../objects/game-objects/hand";
import {GameState} from "../objects/game-objects/game-state";
import {Enemy} from "../objects/game-objects/enemy";

export class Gameloop {
    private readonly numPhases: 5;
    private curPhase: number;
    private emitter: EventEmitter;
    private curTurn: number;
    private toPhase: Map<number, string>;

    constructor() {
        this.curPhase = 0;
        this.emitter = new EventEmitter();
        this.curTurn = 0;

        this.toPhase = new Map<number,string>();
        this.toPhase.set(0, 'draw-phase');
        this.toPhase.set(1, 'energy-phase');
        this.toPhase.set(2, 'play-phase');
        this.toPhase.set(3, 'enemy-phase');
        this.toPhase.set(4, 'effect-phase');
    }

    /**
     * Switches phases
     * --- Player's turn ---
     * 0 -> Draw Phase
     * 1 -> Energy Phase
     * 2 -> Play Phase
     * --- Enemy's turn ---
     * 3 -> Enemy Phase
     * 4 -> Effect Phase
     *
     * emits an event for each phase, names can be seen in toPhase map
     * increments turn counter every time player turn is reached
     */
    public nextPhase():void {
        this.curPhase = (this.curPhase + 1) % this.numPhases;
        this.emitter.emit(this.getPhaseString());
        if (this.curPhase === 0) {
            this.incrementTurnCount();
            this.emitter.emit('next-round');
        }
    }

    /**
     * Emits 'draw-phase' event to start the combat
     */
    public startCombat():void {
        this.emitter.emit('draw-phase');
    }

    /**
     * Returns the current phase as a string, in pascal case
     */
    public getPhaseString():string {
        return this.toPhase.get(this.curPhase);
    }

    /**
     * Returns the current phase as a number 0-4
     * 0 -> Draw Phase
     * 1 -> Energy Phase
     * 2 -> Play Phase
     * 3 -> Enemy Phase
     * 4 -> Effect Phase
     */
    public getPhase():number {
        return this.curPhase;
    }

    /**
     * return curTurn
     */
    public getTurnCount():number {
        return this.curTurn;
    }

    /**
     * sets curPhase and curTurn to 0
     */
    public resetGameLoop():void {
        this.resetPhase();
        this.resetTurnCount();
    }

    /**
     * sets curPhase to 0
     */
    public resetPhase():void {
        this.curPhase = 0;
    }

    /**
     * sets curTurn to 0
     */
    public resetTurnCount():void {
        this.curTurn = 0;
    }

    /**
     * increase turn count by 1
     */
    public incrementTurnCount():void {
        this.curTurn++;
    }

    /**
     * Darw a card, go to next phase
     *
     * @param deck
     * @param player
     */
    public drawPhaseHandler(deck: Deck, player: Player) {

    }

    /**
     * Enable gamestate changes
     *
     * @param state
     */
    public energyPhaseHandler(state: GameState) {

    }

    /**
     * Disable gamestate changes
     * Enable cards
     *
     */
    public playPhaseHandler(player: Player, enemies: Enemy[]) {

    }

    /**
     * Disable cards
     * Trigger enemy attack
     */
    public enemyPhaseHandler(player: Player, enemy: Enemy[]) {

    }

    /**
     * Trigger all player and enemy effects
     */
    public effectPhaseHandler(player: Player, enemies: Enemy[]) {

    }

}