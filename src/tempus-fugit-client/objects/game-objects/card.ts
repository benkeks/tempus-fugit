import {Formula} from "../../temporal-logic/formula";
import {Stand} from "../../objects/game-objects/stand";
import {Mission} from "../../mechanics/mission";
import {Enemy} from "./enemy";

export class Card {
    public static cards:{[name:string]:Card} = {};

    public name: string; // Name of the card
    public description: string; // Description of the card
    public image: string; // A string describing the image on the card
    public formula: Formula; // A formula attached to the card
    public attackPower: number; // The stregth of an attack based on this card
    public isBaseAttackCard: boolean; // Determines whether the card deals base attack when formula is not fulfilled or not
    public stand: Stand; // The stand that is associeted with the card
    public action:Function;
    public inDeckAtStart:number;

    public copy():Card {
        let c:Card = new Card(this.name, this.description, this.image, this.formula.generateRepresentation(true), this.attackPower,
        this.isBaseAttackCard, this.stand.roundsRemaining, this.stand.standAttack, this.stand.name, "");
        c.action = this.action;

        return c;
    }

    /**
     * Getter method for the stand attribute
     * @author Florian
     */
    public getStand(): Stand {
        return this.stand;
    }


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

    public setActionFunction(actionString:string) {
        this.action = eval("(function(mission, enemy){"+actionString+"})");
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
    constructor(name: string, description: string, image: string, formula: string, attackPower: number, isBaseAttackCard: boolean, standRounds: number, standsAttack: number, standName: string, actionString: string) {
        this.name = name;
        this.description = description;
        this.image = image;
        this.formula = new Formula();
        this.formula.parse(formula);
        this.attackPower = attackPower;
        this.isBaseAttackCard = isBaseAttackCard;
        this.stand = new Stand(this, standRounds, standsAttack, standName,image,null);
        this.setActionFunction(actionString);
    }

    public performAction(mission: Mission, enemy: Enemy)  {
        return this.action(mission, enemy);
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

    public static createFromJSON(jString:string) {
        let json = JSON.parse(jString);

        for (let c of json.cards) {
            let isBaseAttack;
            if (c.isBaseAttackCard == "true") {
                isBaseAttack = true;
            } else if (c.isBaseAttackCard == "false") {
                isBaseAttack = false;
            } else {
                console.warn("isBaseAttack in " + c.name + " has to be true or false! Will be set to false now.");
                isBaseAttack = false;
            }

            let new_c:Card = new Card(
                c.name,
                c.description,
                c.image,
                c.formula,
                parseInt(c.attackPower),
                isBaseAttack,
                parseInt(c.standRounds),
                parseInt(c.standsAttack),
                c.standName,
                c.action
            );
            new_c.inDeckAtStart = parseInt(c.inDeckAtStart);

            this.cards[c.name] = new_c;
        }
    }
}