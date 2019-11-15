import {Card} from "./card";

export class Hand {
    cards: Card[];
    size: number;

    constructor(size: number) {
        this.cards = [];
        this.size = size;
        for (var i = 0;i < this.size;i++) {
            this.cards[i] = new Card("Empty", "", "","", 0);
        }
    }

    // Puts a card at 'position' into the hand
    addCard(card: Card, position: number) {
        this.cards[position] = card;
    }

    // Removes the card a 'position'
    removeCard(position: number) {
        this.cards[position] = new Card("Empty", "", "","", 0);
    }

    // Returns the card at position 'n'
    getCard(n: number): Card {
        if (n < 0  || n >= this.size) {
            return null;
        }
        return this.cards[n];
    }

}