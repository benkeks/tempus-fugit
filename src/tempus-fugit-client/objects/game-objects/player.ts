import { Enemy } from "./enemy"
import { Card } from "./card"
import { Deck } from "./deck"
import { Hand } from "./hand";
import { Mission } from "../../mechanics/mission";


export class Player {

    public static readonly MISSION_DONE = 2;
    public static readonly MISSION_AVAILABLE = 1;
    public static readonly MISSION_UNDONE = 0;

    get currentHP(): number {
        return this._currentHP;
    }

    set currentHP(value: number) {
        this._currentHP = Math.max(0,value);
        //this.listener.map(obj => obj.playerHpChanged(value));
    }
    get baseAttack(): number {
        return this._baseAttack;
    }

    set baseAttack(value: number) {
        this._baseAttack = value;

        this.listener.map(obj => obj.stateValuesChanged(this));
    }
    get active(): boolean {
        return this._active;
    }

    set active(value: boolean) {
        this._active = value;
        this.hand.active = value;

        this.listener.map(l => l.Activated(this, this.active));
    }
    public name: string; // Player's name
    public maxHP: number; // Player's maximum hit points
    private _currentHP: number; // Player's currentHP
    private _baseAttack: number; // Player's attack strength without using a card
    public states: string[]; // List of player's states, such as "burning", "healing" etc.
    hand: Hand; // Hand containing the player's cards
    public listener: PlayerListener[] = []; // List of objects listening to player events
    public _active: boolean;

    public missionStates: boolean[] = [false, false, false, false, false, false, false, false, false];

    /**
     * Setter for the player's hit points
     * @param value Number of hit points
     * @return No return value
     * @author Florian
     */
    public setHP(value: number): void {
        this.maxHP = value;
    }

    public copy(): Player {
        let p: Player = new Player(this.name, this.maxHP, this.baseAttack);
        p.missionStates = [...this.missionStates];

        return p;
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
        this.listener = [];
        this.maxHP = hp;
        this._currentHP = this.maxHP;
        this._baseAttack = baseAttack;
        this.hand = new Hand(5);
        this.states = [];
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
        let val: boolean = mission.gameState.evaluate(card.getFormula());
        //console.log("valid: " + val);
        this.hand.removeCard(card);
        if (val) {
            if (card.stand()) {
                mission.pushStand(card);
                card.spawnStand(enemy, mission);
            } else {

                switch (card.getKind()) {

                    case Card.OTHER:
                        card.action(mission, null);
                        break;
                    case Card.PLAYER:
                        card.action(mission, mission.player);
                        break;
                    case Card.GLOBAL:
                        for (let e of mission.getEnemies()) {
                            card.action(mission, e);
                        }

                        this.listener.map(l => l.Attacking(this, enemy));
                        break;
                    case Card.RANDOM:
                        var enemies = mission.getEnemies();
                        var target = enemies[Math.floor(Math.random() * enemies.length)];
                        card.action(mission, target);


                        this.listener.map(l => l.Attacking(this, enemy));
                        break;
                    case Card.DIRECTED:
                        card.action(mission, enemy);

                        this.listener.map(l => l.Attacking(this, enemy));
                        break;
                }
            }

            this.listener.map(l => l.cardPlayed(this, card));
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
        for (let l of this.listener) {
            l.playerHpChanged(this.currentHP, -hitPower);
        }
    }

    public heal(life: number): void {
        this.currentHP += life;
        for (let l of this.listener) {
            l.playerHpChanged(this.currentHP, life);
        }
    }

    public attackWithBaseAttack(mission: Mission): void {
        for (let en of mission.getEnemies()) {
            en.takeHit(this.baseAttack, mission);
        }
        
        this.listener.map(l => l.Attacking(this, undefined));
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
    playerHpChanged(changedTo: number, changedBy: number): void;
    stateValuesChanged(player: Player): void;
    Activated(player: Player, active: boolean);
    Attacking(player: Player, target: Enemy);
    cardPlayed(player: Player, card: Card);
}