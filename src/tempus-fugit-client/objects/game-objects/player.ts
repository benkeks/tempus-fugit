import {Enemy} from "./enemy"
import {Card} from "./card"
import {Deck} from "./deck"
import {Hand} from "./hand";
import {Mission} from "../../mechanics/mission";


export class Player {
    get currentHP(): number {
        return this._currentHP;
    }

    set currentHP(value: number) {
        this._currentHP = value;
        this.listener.map(obj => obj.playerHpChanged(value));
    }
    get baseAttack(): number {
        return this._baseAttack;
    }

    set baseAttack(value: number) {
        this._baseAttack = value;
    }
    public name: string; // Player's name
    public maxHP: number; // Player's maximum hit points
    private _currentHP: number; // Player's currentHP
    private _baseAttack: number; // Player's attack strength without using a card
    public states: string[]; // List of player's states, such as "burning", "healing" etc.
    hand: Hand; // Hand containing the player's cards
    listener:PlayerListener[]; // List of objects listening to player events


    /**
     * Setter for the player's hit points
     * @param value Number of hit points
     * @return No return value
     * @author Florian
     */
    public setHP(value: number): void {
        this.maxHP = value;
    }

    /**
     * Getter for the player's hit points
     * @return Return the current hit points
     * @author Florian
     */
    public getHP(): number {
        return this._currentHP;
    }

    /**
     * Getter for the player's name
     * @return Returns the player's name
     * @author Florian
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Returns the nth card on the players hand
     * @param n Which card in the hand is returned
     * @return Returns a specific card in the player's deck
     * @author Florian
     */
    public getCard(n: number): Card {
        return this.hand.getCard(n);
    }

    /**
     * Constructor for the Player class
     * @param name Name of the player
     * @param hp Maximum hit points the player has
     * @param baseAttack Strength of the player's base attack
     * @example
     * new Player("Nice player", 20, 30);
     * @author Florian
     */
    constructor(name: string, hp: number, baseAttack: number) {
        this.name = name;
        this.maxHP = hp;
        this._currentHP = this.maxHP;
        this._baseAttack = baseAttack;
        this.hand = new Hand(5);
        this.states = [];
        this.listener = [];
    }

    /**
     * Deals damage to a given enemy, either according to the base attack or according to a specified card
     * @param enemy The enemy that is attacked
     * @param baseAttack Whether base attack is used or not
     * @param n The position of the card that is played
     * @param gameState The current game state
     * @example attack(dummyEnemy, false, 3, [false, true, true]);
     * @return Does not have a return value
     * @author Florian
     */
    public applyCard(card: Card, enemy: Enemy, mission: Mission): void {
        let val:boolean = mission.gameState.evaluate(card.getFormula());
        if (val) {
            if (card.stand()) {
                mission.pushStand(card);
                card.spawnStand(enemy, mission);
            } else {
                switch (card.getKind()) {
                    case Card.OTHER:
                        card.action(mission, null);
                        break;
                    case Card.GLOBAL:
                        for (let e of mission.getEnemies()) {
                            console.log(e);
                            card.action(mission, e);
                        }
                        break;
                    case Card.RANDOM:
                        var enemies = mission.getEnemies();
                        var target = enemies[Math.floor(Math.random() * enemies.length)];
                        card.action(mission, target);
                        break;
                    case Card.DIRECTED:
                        card.action(mission, enemy);
                        break;
                }
            }
        }
    }


    /**
     * Causes player to lose 'number' HP; informs player listeners
     * @param hitPower The strength of the hit (i.e. how many HP are lost)
     * @example dummyPlayer.takeHit(15);
     * @return Does not have a return value
     * @author Florian
     */
    public takeHit(hitPower: number): void {
        this.currentHP -= hitPower;
    }

    public heal(life:number):void  {
        this.currentHP += life;
    }

    /**
     * Player takes the card on top of 'deck' and adds it to his hand
     * @param deck The deck that the card is taken from
     * @example takeCard(someDeck);
     * @return Does not have a return value
     * @author Florian
     */
    //
    public takeCard(deck: Deck): Card {
        var card = deck.takeCardOnTop();
        this.hand.addCard(card);
        return card;
    }


    /**
     * Returns true if the player is still alive
     * @example isThePlayerAlive = dummyPlayer.isAlive();
     * @return Returns a boolean that indicates whether the player is alive
     * @author Florian
     */
    public isAlive(): boolean {
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