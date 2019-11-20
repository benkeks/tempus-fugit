import {Card} from "./card";
import {PlayerListener} from "./player";

export class Hand {
    cards: Card[];
    size: number;
    listener:HandListener[];

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
     * @example dummyPlayer.hand.addCard(dummyCard, 3);
     * @author Florian
     */
    addCard(card: Card, position: number) {
        this.cards[position] = card;

        for (let i in this.listener) {
            this.listener[i].handChanged(position, card);
        }
    }

    /**
     * Removes the card a 'position'
     * @param position Position at which the card should be removed
     * @example dummyPlayer.hand.removeCard(2);
     * @author Florian
     */
    removeCard(position: number) {
        this.cards[position] = new Card("Empty", "", "","", 0);
    }

    /**
     * Returns the card at position 'n'
     * @param n Position in the hand at which the card of interest is
     * @example dummyPlayer.hand.getCard(4);
     * @author Florian
     */
    getCard(n: number): Card {
        if (n < 0  || n >= this.size) {
            return null;
        }
        return this.cards[n];
    }

}

/**
 * Interface for objects that listen to changes in hand objects
 * @author Florian
 */
export interface HandListener {
    handChanged(pos: number, card: Card): void;
}