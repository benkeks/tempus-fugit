import {Enemy} from "./enemy"
import {Card} from "./card"
import {Deck} from "./deck"
import {Hand} from "./hand"

export class Player {
    name: String;
    maxHP: number;
    currentHP: number;
    baseAttack: number;
    hand: Hand;

    constructor(name: String, baseAttack: number) {
        this.name = name;
        this.maxHP = 50;
        this.currentHP = this.maxHP;
        this.baseAttack = baseAttack;
        this.hand = new Hand();
    }

    getHP(): string {
        return this.currentHP.toString();
    }

    attack(enemy: Enemy, baseAttack: boolean, n: number) {
        var attackPoints = 0;
        if (baseAttack) {
            attackPoints = this.baseAttack
        } else {
            attackPoints = this.hand.getCard(n).getPower();
        }
        enemy.takeHit(attackPoints);
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
