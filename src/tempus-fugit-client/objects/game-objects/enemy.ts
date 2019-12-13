import {Player} from "./player"
import {Card} from "./card"
import {GameState} from "./game-state"
import {Formula} from "../../temporal-logic/formula";
import {Attack} from "./attack"



export class Enemy {
    public static enemies:{[name:string]:Enemy} = {};
    
    public name: string; // The enemy's name
    public maxHP: number; // The enemy's maximum hit points
    public currentHP: number; // The enemy's current hit points
    public baseAttack: number; // The enemy's base attack strength
    public specialAttack: Attack; // The enemy's base attack strength
    public reactAttacks: Attack[]; // List of react effects
    public listener:EnemyListener[]; // A list of objects listening to events happening in the enemy
    public sprite:string;
    public size:number[];

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
    constructor(name: string, hp: number, baseAttack: number, specialAttack: Attack, reactAttacks: Attack[], sprite:string, size:number[]) {
        this.name = name;
        this.maxHP = hp;
        this.currentHP = this.maxHP;
        this.baseAttack = baseAttack;
        this.specialAttack = specialAttack;
        this.reactAttacks = reactAttacks;
        this.sprite = sprite;
        this.size = size;
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
        if (gameState.evaluate(this.specialAttack.getFormula())) {
            attackPoints = this.specialAttack.getAttackStrength();
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
    public takeHit(hitPower: number, gameState: GameState, player: Player): void {
        let before:number = this.currentHP;
        this.currentHP -= hitPower;

        for (let i in this.listener) {
            this.listener[i].enemyHpChanged(this, before, this.currentHP);
        }

        // Flip-Effect: Attacks player when attacked and if formula is fulfilled
        for (var reactAttack of this.reactAttacks) {
            if (gameState.evaluate(reactAttack.getFormula())) {
                console.log(player);
                player.takeHit(reactAttack.getAttackStrength());
                console.log("React attacked!");
            }
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

    /**
     * 
     */
    public static createFromJSON(jString): void {
        let json = JSON.parse(jString);
        for (let e of json.enemies) {
            let arr = [];
            for (let i of e.reactAttack) arr.push(new Attack(i.formula, i.attackStrength));

            let enemy = new Enemy(
                e.name,
                e.maxHP,
                e.baseAttack,
                e.specialAttack = new Attack(e.specialAttack.formula, e.specialAttack.attackStrength),
                arr,
                e.sprite,
                e.size
            );
            this.enemies[e.name] = enemy;
        }
    }

}


/**
 * Interface for objects that listen to changes in enemy objects
 * @author Florian
 */
export interface EnemyListener {
    enemyHpChanged(enemy:Enemy, changedFrom:number, changedTo: number): void;
}