import {Card} from "./card";

export class Hand {
    private cards: Card[] = [];
    getCards(): Card[] {
        return this.cards;
    }
    setCards(cards: Card[]): void {
        this.cards = cards;
    }
}