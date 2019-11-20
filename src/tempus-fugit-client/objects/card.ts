import {Formula} from "../temporal-logic/Formula";

export class Card {
    name: String;
    description: String;
    image: String;
    formula: Formula;
    attackPower: number;

    constructor(name: String, description: String, image: String, formula: String, attackPower: number) {
        this.name = name;
        this.description = description;
        this.image = image;
        this.formula = new Formula();
        this.formula.parse(formula);
        this.attackPower = attackPower;
    }

    evaluateAttack(gameState: boolean[]): number {
        this.formula.variables['a'].values = gameState;
        if (this.formula.evaluate(0) == false) {
            return 0;
        } else return this.attackPower;
    }


}