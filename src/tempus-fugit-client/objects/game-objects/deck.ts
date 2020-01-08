import {Card} from "./card";
import {PlayerListener} from "./player";

export class Deck {
    cards: Card[]; // List of cards contained in the deck
    listener:DeckListener[]; // List of objects listening to events happening in the deck

    /**
     * Constructor for the Deck class (creates an empty deck)
     * @author Florian
     */
    constructor() {
        this.cards = [];
        this.listener = []
    }

    public copy():Deck {
        let d:Deck = new Deck();

        for (let c of this.cards) {
            d.cards.push(c.copy());
        }
        return d;
    }

    /**
     * Puts the card on top of the deck and informs deck listeners
     * @param card The card that is to be added to the deck
     * @return No return value
     * @example someDeck.addCard(dummyCard);
     * @author Florian
     */
    addCard(card: Card): void {
        this.cards.push(card);
        for (let i in this.listener) {
            this.listener[i].numCardsChanged(this.cards.length);
        }
    }

    /**
     * Returns the card on top of the deck (i.e. the one that has been in the deck the longest)
     * @example myCard = someDeck.takeCardOnTop();
     * @return Returns the card on top of the deck
     * @example myNewCard = someDeck.takeCardOnTop();
     * @author Florian
     */
    takeCardOnTop(): Card {
        var theCard = this.cards.shift();
        for (let i in this.listener) {
            this.listener[i].numCardsChanged(this.cards.length);
        }
        return theCard;
    }

    public shuffle():void {
        Deck.shuffle(this.cards);
    }

    public static shuffle(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    }

}

/**
 * Interface for objects that listen to changes in deck objects
 * @author Florian
 */
export interface DeckListener {
    numCardsChanged(numCards: number): void;
}
