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

    /**
     * Setter for the player's hit points
     * @param value Number of hit points
     * @author Florian
     */
    public setHP(value: number) {
        this.maxHP = value;
    }

    /**
     * Getter for the player's hit points
     * @author Florian
     */
    public getHP(): number {
        return this.currentHP;
    }

    /**
     * Getter for the player's name
     * @author Florian
     */
    public getName(): String {
        return this.name;
    }

    /**
     * Returns the nth card on the players hand
     * @param n Which card in the hand is returned
     * @author Florian
     */
    public getCard(n: number): Card {
        return this.hand.getCard(n);
    }

    /**
     * Constructor for the player class
     * @param name Name of the player
     * @param hp Maximum hit points the player has
     * @param baseAttack Strength of the player's base attack
     */
    constructor(name: String, hp: number, baseAttack: number) {
        this.name = name;
        this.maxHP = hp;
        this.currentHP = this.maxHP;
        this.baseAttack = baseAttack;
        this.hand = new Hand(5);
        this.listener = [];
    }

    /**
     * Attacks a given enemy
     * @param enemy The enemy that is attacked
     * @param baseAttack Whether base attack is used or not
     * @param n The position of the card that is played
     * @param gameState The current game state
     * @author Florian
     */
    // Deals damage to a given enemy, either according to the base attack or according to a specified card
    public attack(enemy: Enemy, baseAttack: boolean, n: number, gameState: boolean[]) {
        var attackPoints = 0;
        if (baseAttack) {
            attackPoints = this.baseAttack
        } else {
            attackPoints = this.hand.getCard(n).evaluateAttack(gameState);
        }
        enemy.takeHit(attackPoints);
    }

    /**
     * Causes player to lose 'number' HP; informs player listeners
     * @param hitPower The strength of the hit (i.e. how many HP are lost)
     * @author Florian
     */
    public takeHit(hitPower: number) {
        this.currentHP -= hitPower;

        for (let i in this.listener) {
            this.listener[i].playerHpChanged(this.currentHP);
        }
    }

    /**
     * Player takes the card on top of 'deck' and adds it to his hand
     * @param deck The deck that the card is taken from
     * @author Florian
     */
    //
    public takeCard(deck: Deck) {
        this.hand.addCard(deck.takeCardOnTop(), 0);
    }



    /**
     * Returns true if the player is still alive
     * @author Florian
     */
    public isAlive() {
        return this.currentHP > 0;
    }

}

/**
 * Interface for objects that listen to changes in player objects
 * @author Florian
 */
export interface PlayerListener {
    playerHpChanged(changedTo: number): void;
}