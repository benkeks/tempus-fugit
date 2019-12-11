import {Player, PlayerListener} from "./player"
import {Card} from "./card"
import {Enemy} from "./enemy"
import {GameState} from "./game-state"


export class Stand {
    private card: Card; // The card that is associated with the stand
    private roundsRemaining: number; // The rounds that the stand will still be alive
    public targets: Enemy[]; // A list of targets the stand will attack
    listener:StandListener[]; // List of objects listening to stand events

    // Getter method for the card attribute
    public getCard(): Card {
        return this.card;
    }

    // Getter method for the roundsRemaining attribute
    public getRoundsRemaining(): number {
        return this.roundsRemaining;
    }

    constructor(card: Card, roundsActive: number, targets: Enemy[]) {
        this.card = card;
        this.roundsRemaining = roundsActive;
        this.targets = targets;
        this.listener = [];
    }


    public attackTargets(gameState: GameState): void {
        for (var target of this.targets) {
            if (gameState.evaluate(this.card) && this.roundsRemaining > 0) {
                target.takeHit(this.card.getAttackPower())
            }
        }
        this.roundsRemaining -= 1;
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
    activateStand(): void;
}