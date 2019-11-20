export class Effect {
    private name: String;
    private baseAttack: number;
    private numRoundsLeft: number;

    constructor(name: String, baseAttack: number, numRoundsLeft: number) {
        this.name = name;
        this.baseAttack = baseAttack;
        this.numRoundsLeft = numRoundsLeft;
    }
    

}