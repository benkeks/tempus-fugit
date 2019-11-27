import {Player} from "./player"
import {Card} from "./card"

export class Enemy {
    private name: string; // The enemy's name
    private maxHP: number; // The enemy's maximum hit points
    private currentHP: number; // The enemy's current hit points
    private _baseAttack: number; // The enemy's base attack strength
    private specialEffects: string[]; // A list of names of the enemy's special effects
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
    constructor(name: string, hp: number, baseAttack: number, specialEffects: string[]) {
        this.name = name;
        this.maxHP = hp;
        this.currentHP = this.maxHP;
        this._baseAttack = baseAttack;
        this.specialEffects = specialEffects;
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
    public attack(player: Player, baseAttack: boolean, n: number): void {
        var attackPoints = 0;
        if (baseAttack) {
            attackPoints = this._baseAttack;
        } else {
            attackPoints = this.evaluateSpecialEffect(this.specialEffects[n]);
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
        this.currentHP -= hitPower;

        for (let i in this.listener) {
            this.listener[i].enemyHpChanged(this.currentHP);
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


    get baseAttack(): number {
        return this._baseAttack;
    }
}


/**
 * Interface for objects that listen to changes in enemy objects
 * @author Florian
 */
export interface EnemyListener {
    enemyHpChanged(changedTo: number): void;
}