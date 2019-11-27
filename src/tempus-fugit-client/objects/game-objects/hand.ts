import {Card} from "./card";
import {PlayerListener} from "./player";

export class Hand {
    cards: Card[]; // A list of cards contained in the hand
    size: number; // The number of cards the hand can hold
    listener:HandListener[]; // A list of objects listening to events happening to this hand

    /**
     * Constructor for the Hand class
     * @param size size of the hand
     * @author Florian
     */
    constructor(size: number) {
        this.cards = [];
        this.size = size;
        for (var i = 0;i < this.size;i++) {
            this.cards[i] = null;
        }
        this.listener = [];
    }

    /**
     * Puts a card at 'position' into the hand and informs hand listeners
     * @param card Card that should be added
     * @param position Position in the hand at which the card will be placed
     * @return Returns 1 if it worked, otherwise 0
     * @example dummyPlayer.hand.addCard(dummyCard, 3);
     * @author Florian
     */
    public addCard(card: Card, position: number = -1): number {
        if (this.isFull()) return 0;

        if (position != -1) {
            this.cards[position] = card;
        } else {
            for (let i of [0,1,2,3,4]) {
                if (this.cards[i] == null) {
                    this.cards[i] = card;
                    break;
                }
            }
        }

        for (let i in this.listener) {
            this.listener[i].handChanged(position, card);
        }
        return 1;
    }

    // Checks whether the hand is full
    public isFull(): boolean {
        var full = true;
        for (let i of [0,1,2,3,4]) {
            if (this.cards[i] == null) {
                full = false;
            }
        }
        return full;
    }


    /**
     * Removes the card a 'position'
     * @param position Position at which the card should be removed
     * @return No return value
     * @example dummyPlayer.hand.removeCard(2);
     * @author Florian
     */
    public removeCard(position: number): void {
        this.cards[position] = new Card("Empty", "", "","", 0);
    }

    /**
     * Returns the card at position 'n'
     * @param n Position in the hand at which the card of interest is
     * @return The selected card
     * @example dummyPlayer.hand.getCard(4);
     * @author Florian
     */
    public getCard(n: number): Card {
        if (n < 0  || n >= this.size) {
            return null;
        }
        return this.cards[n];
    }

    /**
     * Returns all cards
     */
    getCards(): Card[]{
        return this.cards;
    }
}

/**
 * Interface for objects that listen to changes in hand objects
 * @author Florian
 */
export interface HandListener {
    handChanged(pos: number, card: Card): void;
}