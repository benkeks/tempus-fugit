export class Gameloop {
    private readonly numPhases: 4;
    private curPhase: number;

    constructor() {
        this.curPhase = 0;
    }

    /**
     * Switches phases
     * 0 -> Energy Phase
     * 1 -> Card Phase
     * 2 -> Effect Phase
     * 3 -> Enemy Phase
     */
    nextPhase() {
        this.curPhase = (this.curPhase + 1) % this.numPhases;
    }

    getPhase() {
        return this.curPhase;
    }

}