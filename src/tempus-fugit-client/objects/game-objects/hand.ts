import { Card } from "./card";
import { PlayerListener } from "./player";
import { Mission } from "../../mechanics/mission";

export class Hand {
    get active(): boolean {
        return this._active;
    }

    set active(value: boolean) {
        this._active = value;

        this.listener.map(l => l.Activated(this, this.active));
    }

    cards: Card[]; // A list of cards contained in the hand
    size: number; // The number of cards the hand can hold
    listener: HandListener[] = []; // A list of objects listening to events happening to this hand

    public _active: boolean = true;
    public cardQueue: Card[] = [];
    public missionScene;
    public discardGUIStarted = false;

    /**
     * Constructor for the Hand class
     * @param size size of the hand
     * @author Florian
     */
    constructor(size: number) {
        this.cards = [];
        this.size = size;
        for (var i = 0; i < this.size; i++) {
            this.cards[i] = null;
        }
        this.listener = [];
    }

    /**
     * Adds card to queue
     * @param card Card that should be added
     * @example dummyPlayer.hand.addCard(dummyCard, 3);
     * @author Florian
     */
    public addCard(card: Card) {
        //console.log('added card to queue', this.cardQueue);
        this.cardQueue.push(card);
        this.playNextCard();
    }

    public playNextCard() {
        if (this.cardQueue.length == 0) {
            //console.log('no more cards to play, going to next phase')
            if (this.missionScene.tfgame.curPhase == Mission.DRAW_PHASE) {
                this.missionScene.callNextPhase();
            }
            return;
        }
        else {
            if (this.isFull() && this.discardGUIStarted) {
                //console.log('hand is full and discardgui already started');
                return;
            }

            let card = this.cardQueue.shift();
            if (this.isFull() && !this.discardGUIStarted) {
                //console.log('starting discard gui since hand if ful')
                this.discardGUIStarted = true;
                for (let i in this.listener) {
                    this.listener[i].discardCard(card);
                }
            } else {
                //console.log('added card to non full hand', this.cardQueue);
                this.addCardToGUI(card);
            }
        }
    }

    public addCardToGUI(card: Card) {
        let position = -1;
        if (position != -1) {
            this.cards[position] = card;
        } else {
            for (let i of [0, 1, 2, 3, 4]) {
                if (this.cards[i] == null) {
                    this.cards[i] = card;
                    position = i;
                    break;
                }
            }
        }

        for (let i in this.listener) {
            this.listener[i].addCard(card);
        }
    }

    // Checks whether the hand is full
    public isFull(): boolean {
        var full = true;
        for (let i of [0, 1, 2, 3, 4]) {
            if (this.cards[i] == null) {
                full = false;
            }
        }
        return full;
    }


    /**
     * Removes a card 
     * @return No return value
     * @example dummyPlayer.hand.removeCard(2);
     * @author Florian
     */
    public removeCard(card: Card): void {
        for (let i in this.cards) {
            let c = this.cards[i];
            if (c == card) {
                for (let k in this.listener) {
                    this.listener[k].removeCard(this.cards[i]);
                }
                this.cards[i] = null;
                return;
            }
        }
    }

    /**
     * Returns the card at position 'n'
     * @param n Position in the hand at which the card of interest is
     * @return The selected card
     * @example dummyPlayer.hand.getCard(4);
     * @author Florian
     */
    public getCard(n: number): Card {
        if (n < 0 || n >= this.size) {
            return null;
        }
        return this.cards[n];
    }

    /**
     * Returns all cards
     */
    getCards(): Card[] {
        return this.cards;
    }
}

/**
 * Interface for objects that listen to changes in hand objects
 * @author Florian
 */
export interface HandListener {
    addCard(card: Card): void;
    removeCard(card: Card): void;
    Activated(hand: Hand, active: boolean);
    discardCard(card: Card): void;
}