import {Card} from "./card";

export class Deck {
    cards: Card[];

    constructor() {
        this.cards = [];
    }

    addCard(card: Card) {
        this.cards.push(card);
    }

    takeCardOnTop(): Card {
        return this.cards.pop();
    }

}