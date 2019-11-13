import {Card} from "./card";

export class Hand {
    cards: Card[];

    constructor() {
        this.cards = [];
    }

    addCard(card: Card) {
        this.cards.push(card);
    }

    getCard(n: number) {
        return this.cards[n];
    }

}