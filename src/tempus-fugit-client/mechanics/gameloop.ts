import EventEmitter = Phaser.Events.EventEmitter;

export class Gameloop {
    private readonly numPhases: 6;
    private curPhase: number;
    private emitter: EventEmitter;
    private turnCount: number;
    private toPhase: Map<number, string>;

    //TODO change everything heyyyyy
    constructor() {
        this.curPhase = 0;
        this.emitter = new EventEmitter();
        this.turnCount = 0;

        this.toPhase = new Map<number,string>();
        this.toPhase.set(0, 'draw-phase');
        this.toPhase.set(1, 'energy-phase');
        this.toPhase.set(2, 'attack-phase');
        this.toPhase.set(3, 'effect-phase');
        this.toPhase.set(4, 'enemy-attack-phase');
        this.toPhase.set(5, 'enemy-effect-phase');
    }

    /**
     * Switches phases
     * --- Player's turn ---
     * 0 -> Draw Phase
     * 1 -> Energy Phase
     * 2 -> Play/Attack Phase
     * 3 -> Effect Phase (Player or Enemy)
     * --- Enemy's turn ---
     * 4 -> Attack Phase
     * 5 -> Effect Phase
     *
     * emits an event for each phase, names can be seen in toPhase map
     * increments turn counter every time player turn is reached
     */
    public nextPhase() {
        this.curPhase = (this.curPhase + 1) % this.numPhases;
        let event = this.toPhase.get(this.curPhase);
        this.emitter.emit(event);
        if (this.curPhase === 0) {
            this.incrementTurnCount();
        }
    }

    public getPhase() {
        return this.curPhase;
    }

    public getTurnCount() {
        return this.turnCount;
    }

    public resetGameLoop() {
        this.resetPhase();
        this.resetTurnCount();
    }

    public resetPhase() {
        this.curPhase = 0;
    }

    public resetTurnCount() {
        this.turnCount = 0;
    }

    public incrementTurnCount() {
        this.turnCount++;
    }

}