import {Formula} from "../../temporal-logic/formula";
import {Mission} from "../../mechanics/mission";
import {Enemy} from "./enemy";
import {GameState} from "./game-state";
import {Player} from "./player";

export class Card {
    private name: string; // Name of the card
    private description: string; // Description of the card
    private image: string; // A string describing the image on the card
    private formula: Formula; // A formula attached to the card
    private cardKind: string; // can be "global", "random", "directed" or "other"
    private isStandCard: boolean;
    private standRounds: number;
    private targets: Enemy[];
    public action:Function;
    public listener:StandListener[]; // List of objects listening to stand events

    public stand(): boolean {
        return this.isStandCard;
    }

    public getKind(): string {
        return this.cardKind;
    }

    public getRoundsRemaining(): number {
        return this.standRounds;
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

    /**
     * Constructor for the Card class
     * @param name Name of the card
     * @param description Description of the card
     * @param image Description  of the card's image
     * @param formula The formula of the card
     * @param attackPower The attack power of the card
     * @author Florian
     */
    constructor(mission: Mission, name: string, description: string, image: string, formula: string, cardKind: string, isStandCard: boolean, standRounds: number, actionString: string) {
        this.name = name;
        this.description = description;
        this.image = image;
        this.formula = new Formula();
        this.formula.parse(formula);
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
        for (let i in this.listener) {
            console.log(i);
            this.listener[i].activateStand(this);
        }

    }

    public act(mission: Mission, player: Player): void {
        if (this.standRounds > 0) {
            if (this.cardKind == "random") {
                this.action(mission, this.targets[Math.floor(Math.random() * this.targets.length)])
            } else if (this.cardKind == "global" || this.cardKind == "directed") {
                for (var target of this.targets) {
                    this.action(mission, target);
                }
            } else {
                this.action(mission, null);
            }
            this.decreaseRoundsRemaining();
        }

    }

    public decreaseRoundsRemaining() {
        this.standRounds -= 1;
        for (var l of this.listener) {
            l.updateStandText();
        }
    }


    public turnRed() {
        for (let i in this.listener) {
            this.listener[i].turnRed();
        }
    }


    public turnNormal() {
        for (let i in this.listener) {
            this.listener[i].turnNormal();
        }
    }

}

export interface StandListener {
    activateStand(stand: Card): void;
    deactiveStand(stand: Card):void;
    updateStandText(): void;
    turnRed(): void;
    turnNormal(): void;
}