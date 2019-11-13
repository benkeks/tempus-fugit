import {Enemy} from "./enemy"
import {Card} from "./card"
import {Deck} from "./deck"
import {Hand} from "./hand"

export class Player {
    name: String;
    maxHP: number;
    currentHP: number;
    hand: Hand;

    constructor(name: String) {
        this.name = name;
        this.maxHP = 50;
        this.currentHP = this.maxHP;
        this.hand = new Hand();
    }

    getHealth(): string {
        return this.currentHP.toString();
    }

    attack(enemy: Enemy, n: number) {
        enemy.takeHit(this.hand.getCard(n).getPower());
    }

    takeHit(hitPower: number) {
        this.currentHP -= hitPower;
    }

    takeCard(deck: Deck) {
        this.hand.addCard(deck.takeCardOnTop());
    }

    getCard(n: number): Card {
        return this.hand.getCard(n);
    }

    isAlive() {
        return this.currentHP > 0;
    }

}
