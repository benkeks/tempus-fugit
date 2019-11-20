import {Formula} from "../../temporal-logic/Formula";

export class Card {
    name: String;
    description: String;
    image: String;
    formula: Formula;
    attackPower: number;

    /**
     * Constructor for the Card class
     * @param name Name of the card
     * @param description Description of the card
     * @param image Description  of the card's image
     * @param formula The formula of the card
     * @param attackPower The attack power of the card
     * @author Florian
     */
    constructor(name: String, description: String, image: String, formula: String, attackPower: number) {
        this.name = name;
        this.description = description;
        this.image = image;
        this.formula = new Formula();
        this.formula.parse(formula);
        this.attackPower = attackPower;
    }

    /**
     * This function checks whether an attack is in accordance with the game state. If it is, it returns the card's damage, otherwise 0.
     * @param gameState A simple representation  of a game state. NOT the way it will eventually be implemented.
     * @author Florian
     */
    evaluateAttack(gameState: boolean[]): number {
        this.formula.variables['a'].values = gameState;
        if (this.formula.evaluate(0) == false) {
            return 0;
        } else return this.attackPower;
    }


}