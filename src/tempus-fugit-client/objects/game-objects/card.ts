import {Formula} from "../../temporal-logic/formula";

export class Card {
    private name: string; // Name of the card
    private description: string; // Description of the card
    private image: string; // A string describing the image on the card
    private formula: Formula; // A formula attached to the card
    private attackPower: number; // The stregth of an attack based on this card

    /**
     * Getter method for the name attribute
     * @author Florian
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Getter method for the description attribute
     * @author Florian
     */
    public getDescription(): string {
        return this.description;
    }

    /**
     * Getter method for the image attribute
     * @author Florian
     */
    public getImage(): string {
        return this.image;
    }

    /**
     * Getter method for the formula attribute
     * @author Florian
     */
    public getFormula(): Formula {
        return this.formula;
    }


    /**
     * Getter method for the attack power attribute
     * @author Florian
     */
    public getAttackPower(): number {
        return this.attackPower;
    }

    /**
     * Constructor for the Card class
     * @param name Name of the card
     * @param description Description of the card
     * @param image Description  of the card's image
     * @param formula The formula of the card
     * @param attackPower The attack power of the card
     * @author Florian
     */
    constructor(name: string, description: string, image: string, formula: string, attackPower: number) {
        this.name = name;
        console.log(formula);
        console.log(name);
        this.description = description;
        this.image = image;
        this.formula = new Formula();
        this.formula.parse(formula);
        this.attackPower = attackPower;
        console.log(name + " is being created");
    }

    /**
     * This function checks whether an attack is in accordance with the game state. If it is, it returns the card's damage, otherwise 0.
     * @param gameState A simple representation  of a game state. NOT the way it will eventually be implemented.
     * @author Florian
     */
    public evaluateAttack(gameState: boolean[]): number {
        this.formula.variables['a'].values = gameState;
        if (this.formula.evaluate(0) == false) {
            return 0;
        } else return this.attackPower;
    }


}