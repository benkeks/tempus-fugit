import { CardGUI } from "../game-gui-objects/card-gui";
import { Card } from "./card";

/**
 * @author Mustafa
 * graveyard for played cards
 */
export class Stack {
    private cards: Card[]; // a list of card on the stack


    constructor() {
        this.cards = [];
    }

    /**
     * adds a card object to the stack
     * @param card
     */
    addCard(card: Card) {
        //console.log('added card to stack');
        this.cards.push(card);
    }

    /**
     * deletes all cards on the stack
     */
    clear(): void {
        this.cards = [];
    }
}
