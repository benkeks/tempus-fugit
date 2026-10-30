import {Formula} from "../../temporal-logic/formula";
import {Mission} from "../../mechanics/mission";
import {Enemy} from "./enemy";
import {Player} from "./player";
import type {CardActionTarget} from "../../mechanics/card-action-animation";

export class Card {
    public static cards:{[name:string]:Card} = {};

    public static readonly GLOBAL = "global";
    public static readonly DIRECTED = "directed";
    public static readonly RANDOM = "random";
    public static readonly PLAYER = "player";
    public static readonly OTHER = "other";

    public name: string; // Name of the card
    public key:string;
    public description: string; // Description of the card
    public image: string; // A string describing the image on the card
    public formula: Formula; // A formula attached to the card
    public cardKind: string; // can be "global", "random", "directed" or "other"
    public isStandCard: boolean;
    public standRounds: number;
    public targets: Enemy[] = [];
    public action:Function;
    public inDeckAtStart!:number;
    public maxCardsInDeck:number = 5;
    public formulaRepresentation:string | undefined = undefined;
    public animation: string | undefined;
    // Healing actions and their heart streams use the same amount from the card data.
    public healing: number | undefined;

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
        c.maxCardsInDeck = this.maxCardsInDeck;
        c.key = this.key;
        c.animation = this.animation;
        c.healing = this.healing;

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
        //console.log(this.name, "  ", actionString);
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
        this.key = name;
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

    public spawnStand(enemy: Enemy | undefined, mission: Mission) {
        if (enemy != null) {
            this.targets =  [enemy];
        } else {
            this.targets = mission.getEnemies();
        }
        /*for (let i in this.listener) {
            this.listener[i].activateStand(this);
        }*/

    }

    public act(mission: Mission, player: Player): boolean {
        let val:boolean = mission.gameState.evaluate(this.getFormula());
        if (this.standRounds > 0) {
            if (val) {
                const targets = this.getActionTargets(mission, this.targets);
                mission.performCardAction(this, targets, (_animated, hitTargets) => {
                    for (const target of hitTargets) this.action(mission, target);
                });
            }
            this.decreaseRoundsRemaining();
        }

        return val;
    }

    public getActionTargets(mission: Mission, targets: Enemy[]): CardActionTarget[] {
        if ((this.cardKind === Card.RANDOM || this.cardKind === Card.DIRECTED) && targets.length === 0) {
            throw new Error("No targets for card " + this.name);
        }
        switch (this.cardKind) {
            case Card.RANDOM:
                return [targets[Math.floor(Math.random() * targets.length)]];
            case Card.DIRECTED:
                return targets;
            case Card.GLOBAL:
                return [...mission.getEnemies()];
            case Card.OTHER:
                return [null];
            case Card.PLAYER:
                return [mission.player];
            default:
                throw new TypeError("Card Type of card " + this.name + " is wrong!");
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

            if (c.cardKind != Card.RANDOM && c.cardKind != Card.OTHER && c.cardKind != Card.GLOBAL && c.cardKind != Card.DIRECTED && c.cardKind != Card.PLAYER) {
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
            
            if (c.formulaRepresentation) new_c.formulaRepresentation = c.formulaRepresentation;

            if (c.maxCardsInDeck) new_c.maxCardsInDeck = c.maxCardsInDeck;
            if (c.key) new_c.key = c.key;
            if (c.animation !== undefined) {
                if (typeof c.animation !== "string" || !c.animation.trim()) {
                    throw new TypeError("Invalid animation for card " + c.name);
                }
                new_c.animation = c.animation;
            }
            if (c.healing !== undefined) {
                if (typeof c.healing !== "number" || !Number.isFinite(c.healing) || c.healing <= 0) {
                    throw new TypeError("Invalid healing for card " + c.name);
                }
                new_c.healing = c.healing;
            }

            this.cards[new_c.key] = new_c;
        }
    }


}
