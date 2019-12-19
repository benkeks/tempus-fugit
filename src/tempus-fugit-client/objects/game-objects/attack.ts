import {Formula} from "../../temporal-logic/formula";

export class Attack {
    private formula: Formula; // formula of the attack
    private attackStrength: number; // Simple attack strength in case there is no attack  string
    private attackString: string; // Encodes the function that the attack executes
    private attackKind: string // Can be "global", "random" or "directed"

    public getFormula():  Formula {
        return this.formula;
    }

    public getAttackStrength(): number {
        return this.attackStrength;
    }

    public getAttackString(): string {
        return this.attackString;
    }

    constructor (formula: string, attackStrength: number, attackString: string, attackKind: string) {
        this.formula = new Formula();
        this.formula.parse(formula);
        this.attackStrength = attackStrength;
        this.attackString = attackString;
        this.attackKind = attackKind;
    }
}