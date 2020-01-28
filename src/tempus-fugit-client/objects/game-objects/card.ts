import {Formula} from "../../temporal-logic/formula";
import {Mission} from "../../mechanics/mission";
import {Enemy} from "./enemy";
import {Player} from "./player";

export class Card {
    public static cards:{[name:string]:Card} = {};

    public static readonly GLOBAL = "global";
    public static readonly DIRECTED = "directed";
    public static readonly RANDOM = "random";
    public static readonly PLAYER = "player";
    public static readonly OTHER = "other";

    public name: string; // Name of the card
    public description: string; // Description of the card
    public image: string; // A string describing the image on the card
    public formula: Formula; // A formula attached to the card
    public cardKind: string; // can be "global", "random", "directed" or "other"
    public isStandCard: boolean;
    public standRounds: number;
    public targets: Enemy[];
    public action:Function;
    public inDeckAtStart:number;
    public maxCardsInDeck:number = 5;
    public formulaRepresentation:string = undefined;

    public stand(): boolean {
        return this.isStandCard;
    }

    public getKind(): string {
        return this.cardKind;
    }

    public getRoundsRemaining(): number {
        return this.standRounds;
    }

    public copy():Card {
        let c:Card = new Card(this.name, this.description,
            this.image, this.formula.generateRepresentation(true, false),
            this.cardKind, this.isStandCard, this.standRounds, "");
        c.action = this.action;
        c.inDeckAtStart = this.inDeckAtStart;

        return c;
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

    public getFormulaGuiString():string {
        if (this.formulaRepresentation !== undefined) return this.formulaRepresentation;
        else return this.formula.generateRepresentation(true, true);
    }


    /**
     * Getter method for the attack power attribute
     * @author Florian
     */

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
    constructor(name: string, description: string, image: string, formula: string, cardKind: string,
                isStandCard: boolean, standRounds: number, actionString: string) {
        this.name = name;
        this.description = description;
        this.image = image;
        this.formula = new Formula();
        this.formula.parse(formula);
        this.setActionFunction(actionString);
        this.cardKind = cardKind;
        this.isStandCard = isStandCard;
        this.standRounds = standRounds;
        this.action = eval("(function(mission, target){"+actionString+"})");
    }

    public spawnStand(enemy: Enemy, mission: Mission) {
        if (enemy != null) {
            this.targets =  [enemy];
        } else {
            this.targets = mission.getEnemies();
        }
        /*for (let i in this.listener) {
            this.listener[i].activateStand(this);
        }*/

    }

    public act(mission: Mission, player: Player): void {
        if (this.standRounds > 0) {
            if (mission.gameState.evaluate(this.getFormula())) {
                if (this.cardKind == Card.RANDOM) {
                    this.action(mission, this.targets[Math.floor(Math.random() * this.targets.length)])
                } else if (this.cardKind == Card.DIRECTED) {
                    for (var target of this.targets) {
                        this.action(mission, target);
                    }
                } else if (this.cardKind == Card.GLOBAL) {
                    for (let target of mission.getEnemies()) {
                        this.action(mission, target);
                    }
                } else if (this.cardKind == Card.OTHER) {
                    this.action(mission, null);
                } else if (this.cardKind == Card.PLAYER) {
                    this.action(mission, mission.player);
                } else {
                    throw new TypeError("Card Type of card " + this.name + " is wrong!");
                }
            }
            this.decreaseRoundsRemaining();
        }

    }

    public decreaseRoundsRemaining() {
        this.standRounds -= 1;
        /*for (var l of this.listener) {
            l.updateStandText();
        }*/
    }


    public turnRed() {
        /*for (let i in this.listener) {
            this.listener[i].turnRed();
        }*/
    }


    public turnNormal() {
        /*for (let i in this.listener) {
            this.listener[i].turnNormal();
        }*/
    }

    public static createFromJSON(jString:string) {
        let json = JSON.parse(jString);

        for (let c of json.cards) {
            let isStandCard;
            if (c.isStandCard == "true") {
                isStandCard = true;
            } else if (c.isStandCard == "false") {
                isStandCard = false;
            } else {
                console.warn("isStandCard in " + c.name + " has to be true or false! Will be set to false now.");
                isStandCard = false;
            }

            if (c.cardKind != Card.RANDOM && c.cardKind != Card.OTHER && c.cardKind != Card.GLOBAL && c.cardKind != Card.DIRECTED) {
                console.warn("Card Type of card " + this.name + " is wrong!");
            }

            let new_c:Card = new Card(
                c.name,
                c.description,
                c.image,
                c.formula,
                c.cardKind,
                isStandCard,
                parseInt(c.standRounds),
                c.action
            );
            new_c.inDeckAtStart = parseInt(c.inDeckAtStart);
            
            if (c.formulaRepresentation) new_c.formulaRepresentation = c.formulaRepresentation;

            if (c.maxCardsInDeck) new_c.maxCardsInDeck = c.maxCardsInDeck;

            this.cards[c.name] = new_c;
        }
    }


}
