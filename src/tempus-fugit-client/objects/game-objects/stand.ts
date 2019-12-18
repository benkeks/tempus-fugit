import {Player, PlayerListener} from "./player"
import {Card} from "./card"
import {Enemy} from "./enemy"
import {GameState} from "./game-state"


export class Stand {
    public name: string; // Stand's name
    public cardImage: string; // Image of the card attached to the stand
    private card: Card; // The card that is associated with the stand
    private roundsRemaining: number; // The rounds that the stand will still be alive
    public standAttack: number // Strength of attack
    public targets: Enemy[]; // A list of targets the stand will attack
    public listener:StandListener[]; // List of objects listening to stand events
    public active: boolean;

    // Getter method for the card attribute
    public getCard(): Card {
        return this.card;
    }

    public decreaseRoundsRemaining() {
        this.roundsRemaining -= 1;
        for (var l of this.listener) {
            l.updateStandText();
        }
    }

    // Getter method for the roundsRemaining attribute
    public getRoundsRemaining(): number {
        return this.roundsRemaining;
    }

    constructor(card: Card, roundsActive: number, standAttack: number, standName: string, cardImage: string, targets: Enemy[]) {
        this.name = standName;
        this.cardImage = cardImage;
        this.card = card;
        this.roundsRemaining = roundsActive;
        this.standAttack = standAttack;
        this.targets = targets;
        this.listener = [];
        this.active = false;
    }

    public spawn(enemy: Enemy) {
        console.log("spawned");
        this.active = true;
        this.targets = [enemy];
        for (let i in this.listener) {
            console.log(i);
            this.listener[i].activateStand(this);
        }

    }

    public attackTargets(gameState: GameState, player: Player): void {
        for (var target of this.targets) {
            if (gameState.evaluate(this.card) && this.roundsRemaining > 0) {
                target.takeHit(this.card.getAttackPower(), gameState, player)
            }
        }
        this.roundsRemaining -= 1;
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


    /**
     * Interface for objects that listen to changes in enemy objects
     * @author Florian
     */
export interface EnemyListener {
    remainingRoundsChanged(changedTo: number): void;
}


/**
 * Interface for objects that listen to changes in stand objects
 * @author Florian
 */
export interface StandListener {
    activateStand(stand: Stand): void;
    deactiveStand(stand: Stand):void;
    updateStandText(): void;
    turnRed(): void;
    turnNormal(): void;
}