import {Enemy} from "./enemy"
import {Card} from "./card"
import {Deck} from "./deck"
import {Hand} from "./hand";


export class Player {
    private name: String;
    private maxHP: number;
    private currentHP: number;
    private baseAttack: number;
    hand: Hand;
    listener:PlayerListener[];

    getMaxHP(): number {
        return this.maxHP;
    }

    setMaxHP(value: number) {
        this.maxHP = value;
    }

    getHP(): number {
        return this.currentHP;
    }

    getName(): String {
        return this.name;
    }

    // Returns the nth card on the players hand
    getCard(n: number): Card {
        return this.hand.getCard(n);
    }


    constructor(name: String, hp: number, baseAttack: number) {
        this.name = name;
        this.maxHP = hp;
        this.currentHP = this.maxHP;
        this.baseAttack = baseAttack;
        this.hand = new Hand(5);
        this.listener = [];
    }

    // Deals damage to a given enemy, either according to the base attack or according to a specified card
    attack(enemy: Enemy, baseAttack: boolean, n: number, gameState: boolean[]) {
        var attackPoints = 0;
        if (baseAttack) {
            attackPoints = this.baseAttack
        } else {
            attackPoints = this.hand.getCard(n).evaluateAttack(gameState);
        }
        enemy.takeHit(attackPoints);
    }

    // Causes player to lose 'number' HP
    takeHit(hitPower: number) {
        this.currentHP -= hitPower;

        for (let i in this.listener) {
            this.listener[i].playerHpChanged(this.currentHP);
        }
    }

    // Player takes the card on top of 'deck' and adds it to his hand
    takeCard(deck: Deck) {
        this.hand.addCard(deck.takeCardOnTop(), 0);
    }


    // Returns true if the player is still alive
    isAlive() {
        return this.currentHP > 0;
    }

}

export interface PlayerListener {
    playerHpChanged(changedTo: number): void;
}