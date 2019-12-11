import {Player} from "./player"
import {Card} from "./card"
import {GameState} from "./game-state"
import {Formula} from "../../temporal-logic/formula";


export class Enemy {
    public name: string; // The enemy's name
    public maxHP: number; // The enemy's maximum hit points
    public currentHP: number; // The enemy's current hit points
    public baseAttack: number; // The enemy's base attack strength
    public specialAttack: number; // The enemy's base attack strength
    public formula: Formula; // A formula attached to the card
    public image:string;
    public listener:EnemyListener[]; // A list of objects listening to events happening in the enemy

   public getHP(): number {
        return this.currentHP;
    }

    public getName(): string {
        return this.name;
    }

    /**
     * Constructor for the Enemy class
     * @param name Name of the enemy
     * @param hp Maximum hit points of the enemy
     * @param baseAttack Base attacke strength of the enemy
     * @param specialEffects Special effects the enemy has (not final implementation)
     * @example someEnemy = new Enemy("Mr. Enemy", 40, 10, ["Fire attack", "Magic attack"]);
     * @author Florian
     */
    constructor(name: string, hp: number, baseAttack: number, specialAttack: number, forumula: Formula) {
        this.name = name;
        this.maxHP = hp;
        this.currentHP = this.maxHP;
        this.baseAttack = baseAttack;
        this.specialAttack = specialAttack;
        this.formula = forumula;
        this.listener = [];

    }

    /**
     * Evaluate the strength of a special effect
     * @param specialEffect A string describing the special effect
     * @return A number indnicating the strength of the special effect
     * @example var hitPointReduction = evaluateSpecialEffect("Fire attack");
     * @author Florian
     */
    private evaluateSpecialEffect(specialEffect: string): number {
        return 19;
    }

    /**
     * Deals damage to a given player, either according to the base attack or according to a specified special effect
     * @param enemy The player that is attacked
     * @param baseAttack Whether base attack is used or not
     * @param n The position of the special effect in the special effects list
     * @example attack(dummyEnemy, false, 3);
     * @return Does not have a return value
     * @author Florian
     */
    public attack(player: Player, gameState: GameState): void {
        var attackPoints = 0;
        if (gameState.evaluate(this.formula)) {
            attackPoints = this.specialAttack;
        } else {
            attackPoints = this.baseAttack;
        }
        player.takeHit(attackPoints);
    }

    /**
     * Causes enemy to lose 'number' HP and informs enemy listeners
     * @param hitPower The strength of the hit (i.e. how many HP are lost)
     * @example dummyPlayer.takeHit(15);
     * @return Does not have a return value
     * @author Florian
     */
    public takeHit(hitPower: number): void {
        let before:number = this.currentHP;
        this.currentHP -= hitPower;

        for (let i in this.listener) {
            this.listener[i].enemyHpChanged(this, before, this.currentHP);
        }
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
 * Interface for objects that listen to changes in enemy objects
 * @author Florian
 */
export interface EnemyListener {
    enemyHpChanged(enemy:Enemy, changedFrom:number, changedTo: number): void;
}