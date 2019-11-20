import {Card} from "./card";
import {PlayerListener} from "./player";

export class Deck {
    cards: Card[];
    listener:DeckListener[];

    /**
     * Constructor for the Deck class
     */
    constructor() {
        this.cards = [];
        this.listener = []
    }

    /**
     * Puts the card on top of the deck and informs deck listeners
     * @param card The card that is to be added to the deck
     * @example someDeck.addCard(dummyCard);
     * @author Florian
     */
    addCard(card: Card) {
        this.cards.push(card);
        for (let i in this.listener) {
            this.listener[i].numCardsChanged(this.cards.length);
        }
    }

    /**
     * Returns the card on top of the deck (i.e. the one that has been in the deck the longest)
     * @example myCard = someDeck.takeCardOnTop();
     * @author Florian
     */
    takeCardOnTop(): Card {
        var theCard = this.cards.shift();
        for (let i in this.listener) {
            this.listener[i].numCardsChanged(this.cards.length);
        }
        return theCard;
    }

}

/**
 * Interface for objects that listen to changes in deck objects
 * @author Florian
 */
export interface DeckListener {
    numCardsChanged(numCards: number): void;
}