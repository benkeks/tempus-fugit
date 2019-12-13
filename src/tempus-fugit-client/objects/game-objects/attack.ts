import {Formula} from "../../temporal-logic/formula";

export class Attack {
    private formula: Formula;
    private attackStrength: number;

    public getFormula():  Formula {
        return this.formula;
    }

    public getAttackStrength(): number {
        return this.attackStrength;
    }

    constructor (formula: string, attackStrength: number) {
        this.formula = new Formula();
        console.log(formula);
        this.formula.parse(formula);
        this.attackStrength = attackStrength;
    }
}