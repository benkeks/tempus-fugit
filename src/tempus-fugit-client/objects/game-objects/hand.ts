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
            this.cards[i] = new Card("Empty", "", "","", 0);
        }
        this.listener = [];
    }

    /**
     * Puts a card at 'position' into the hand and informs hand listeners
     * @param card Card that should be added
     * @param position Position in the hand at which the card will be placed
     * @return No return value
     * @example dummyPlayer.hand.addCard(dummyCard, 3);
     * @author Florian
     */
    addCard(card: Card, position: number): void {
        this.cards[position] = card;

        for (let i in this.listener) {
            this.listener[i].handChanged(position, card);
        }
    }

    /**
     * Removes the card a 'position'
     * @param position Position at which the card should be removed
     * @return No return value
     * @example dummyPlayer.hand.removeCard(2);
     * @author Florian
     */
    removeCard(position: number): void {
        this.cards[position] = new Card("Empty", "", "","", 0);
    }

    /**
     * Returns the card at position 'n'
     * @param n Position in the hand at which the card of interest is
     * @return The selected card
     * @example dummyPlayer.hand.getCard(4);
     * @author Florian
     */
    getCard(n: number): Card {
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