import {Card} from "./card";
import {PlayerListener} from "./player";

export class Deck {
    cards: Card[];
    listener:DeckListener[];

    constructor() {
        this.cards = [];
        this.listener = []
    }

    // Puts the card on top of the deck
    addCard(card: Card) {
        this.cards.push(card);
        for (let i in this.listener) {
            this.listener[i].numCardsChanged(this.cards.length);
        }
    }

    // Returns the card on top of the deck (i.e. the one that has been in the deck the longest)
    takeCardOnTop(): Card {
        var theCard = this.cards.shift();
        for (let i in this.listener) {
            this.listener[i].numCardsChanged(this.cards.length);
        }
        return theCard;
    }

}

export interface DeckListener {
    numCardsChanged(numCards: number): void;
}