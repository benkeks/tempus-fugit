import {Enemy} from "./enemy"
import {Card} from "./card"
import {Deck} from "./deck"
import {Hand} from "./hand"

export class Player {
    maxHealth: number;
    currentHealth: number;
    hand: Hand;

    constructor() {
        this.maxHealth = 50;
        this.currentHealth = this.maxHealth;
        this.hand = new Hand();
    }

    getHealth(): string {
        return this.currentHealth.toString();
    }

    attack(enemy: Enemy, n: number) {
        enemy.takeHit(this.hand.getCard(n).getPower());
    }

    takeHit(hitPower: number) {
        this.currentHealth -= hitPower;
    }

    takeCard(deck: Deck) {
        this.hand.addCard(deck.takeCardOnTop());
    }

    getCard(n: number): Card {
        return this.hand.getCard(n);
    }

}
