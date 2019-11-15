import {Enemy} from "./enemy"
import {Card} from "./card"
import {Deck} from "./deck"
import {Hand} from "./hand"

export class Player {
    get maxHP(): number {
        return this._maxHP;
    }

    set maxHP(value: number) {
        let oldHp = value;

        this._maxHP = value;

        for (let i in this.listener) {
            this.listener[i].hpchanged(oldHp, value, null);

        }
    }
    name: String;
    private _maxHP: number;
    currentHP: number;
    baseAttack: number;
    hand: Hand;

    listener:PlayerListener[];

    constructor(name: String, hp: number, baseAttack: number) {
        this.name = name;
        this._maxHP = hp;
        this.currentHP = this._maxHP;
        this.baseAttack = baseAttack;
        this.hand = new Hand(5);
    }

    // Returns a string with the current HP
    getHP(): string {
        return this.currentHP.toString();
    }

    // Deals damage to a given enemy, either according to the base attack or according to a specified card
    attack(enemy: Enemy, baseAttack: boolean, n: number) {
        var attackPoints = 0;
        if (baseAttack) {
            attackPoints = this.baseAttack
        } else {
            attackPoints = this.hand.getCard(n).getPower();
        }
        enemy.takeHit(attackPoints);
    }

    // Causes player to lose 'number' HP
    takeHit(hitPower: number) {
        this.currentHP -= hitPower;
    }

    // Player takes the card on top of 'deck' and adds it to his hand
    takeCard(deck: Deck) {
        this.hand.addCard(deck.takeCardOnTop(), 1);
    }

    // Returns the nth card on the players hand
    getCard(n: number): Card {
        return this.hand.getCard(n);
    }

    // Returns true if the player is still alive
    isAlive() {
        return this.currentHP > 0;
    }

}

export interface PlayerListener {
    hpchanged(oldHP: number, newHP: number, enemy: Enemy): void;
}