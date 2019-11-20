import {Player, PlayerListener} from "./player"
import {Enemy, EnemyListener} from "./enemy";
import {Hand, HandListener} from "./hand";
import {Card} from "./card";
import {DeckListener} from "./deck";


export class Display implements PlayerListener, EnemyListener, HandListener, DeckListener{
    state: String;
    name1: String;
    name2: String;
    hp1: number;
    hp2: number;
    handSize: number;
    cardNames: String[];
    cardsOnDeck: number;

    constructor(state: String, name1: String, name2: String, hp1: number, hp2: number, handSize: number, cards: Card[], cardsOnDeck: number) {
        this.state = state;
        this.name1 = name1;
        this.name2 = name2;
        this.hp1 = hp1;
        this.hp2 = hp2;
        this.handSize = handSize;
        this.cardNames = [];
        for (var i = 0; i < this.handSize; i = i + 1) {
            this.cardNames[i] = "a";//cards[i].name;
        }
        this.cardsOnDeck = cardsOnDeck;
    }

    playerHpChanged(changedTo: number): void {
        this.hp1 = changedTo;
    }

    enemyHpChanged(changedTo: number): void {
        this.hp2 = changedTo;
    }

    handChanged(pos: number, card: Card): void {
        this.cardNames[pos] = card.name;
    }

    numCardsChanged(numCards: number): void {
        this.cardsOnDeck = numCards;
    }

}