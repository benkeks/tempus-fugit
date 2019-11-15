import {Card} from "./card";

export class Deck {
    cards: Card[];

    constructor() {
        this.cards = [];
    }

    // Puts the card on top of the deck
    addCard(card: Card) {
        this.cards.push(card);
    }

    // Returns the card on top of the deck (i.e. the one that has been in the deck the longest)
    takeCardOnTop(): Card {
        return this.cards.shift();
    }

}