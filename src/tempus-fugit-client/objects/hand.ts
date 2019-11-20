import {Card} from "./card";
import {PlayerListener} from "./player";

export class Hand {
    cards: Card[];
    size: number;
    listener:HandListener[];

    constructor(size: number) {
        this.cards = [];
        this.size = size;
        for (var i = 0;i < this.size;i++) {
            this.cards[i] = new Card("Empty", "", "","", 0);
        }
        this.listener = [];
    }

    // Puts a card at 'position' into the hand
    addCard(card: Card, position: number) {
        this.cards[position] = card;

        for (let i in this.listener) {
            this.listener[i].handChanged(position, card);
        }
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


export interface HandListener {
    handChanged(pos: number, card: Card): void;
}