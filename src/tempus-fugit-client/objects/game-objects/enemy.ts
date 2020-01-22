
import {Player} from "./player"
import {GameState} from "./game-state"
import {Formula} from "../../temporal-logic/formula";
import {Attack} from "./attack"
import {Card} from "./card";
import {Mission} from "../../mechanics/mission";

export class Enemy {
    public static enemies:{[name:string]:Enemy} = {};
    
    public name: string; // The enemy's name
    public maxHP: number; // The enemy's maximum hit points
    public currentHP: number; // The enemy's current hit points
    public baseAttack: number; // The enemy's base attack strength
    public description:string;
    public image:string;

    public specialAttack: Card; // The enemy's base attack strength
    public reactAttacks: Card[]; // List of react effects

    public listener:EnemyListener[]; // A list of objects listening to events happening in the enemy
    public sprite:string;
    public size:number[];

   public getHP(): number {
        return this.currentHP;
    }

    public getName(): string {
        return this.name;
    }

    public removeListener(listener:EnemyListener):void {
        this.listener = this.listener.filter(obj => obj !== listener);
    }

    public copy():Enemy {
       let new_enemy:Enemy = new Enemy(this.name, this.maxHP, this.baseAttack, this.specialAttack, this.reactAttacks, this.sprite, this.size);
       new_enemy.description = this.description;
       new_enemy.image = this.image;

       return new_enemy;
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
    constructor(name: string, hp: number, baseAttack: number, specialAttack: Card, reactAttacks: Card[], sprite:string, size:number[]) {
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
    public applyCard(card: Card, mission: Mission): boolean {
        let val:boolean = mission.gameState.evaluate(card.getFormula());
        if (val) {
            switch (card.getKind()) {
                case Card.OTHER:
                    card.action(mission, null);
                    break;
                case Card.DIRECTED:
                    card.action(mission, mission.player);
                    break;
            }
        }

        return val;
    }

    public performTurn(mission:Mission):void {
        if (!this.applyCard(this.specialAttack, mission)){
            mission.player.takeHit(this.baseAttack);
        }

        this.listener.map(l => l.Attacking(this));
    }

    /**
     * Causes enemy to lose 'number' HP and informs enemy listeners
     * @param hitPower The strength of the hit (i.e. how many HP are lost)
     * @example dummyPlayer.takeHit(15);
     * @return Does not have a return value
     * @author Florian
     */
    public takeHit(hitPower: number, mission: Mission): void {
        let before:number = this.currentHP;
        this.currentHP -= hitPower;

        this.listener.map(l => l.enemyHpChanged(this, before, this.currentHP));

        // Flip-Effect: Attacks player when attacked and if formula is fulfilled
        for (var reactAttack of this.reactAttacks) {
            if (mission.gameState.evaluate(reactAttack.getFormula())) {
                reactAttack.action(mission, mission.player);
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
    public static createFromJSON(jString:string, scene:Phaser.Scene): void {
        let json = JSON.parse(jString);

        for (let e of json.enemies) {
            if (e.sprite != "" && e.size != undefined && e.size.length == 2) {
                scene.load.spritesheet(e.image,
                    e.sprite,
                    {frameWidth: e.size[0], frameHeight: e.size[1]});
            } else {
                console.warn( e.name+ " does not have a texture given or its size is not in the right pattern. Nothing will be loaded.");
            }

            let arr = [];
            for (let i in e.reactAttack) {
                let att = e.reactAttack[i];
                arr.push(new Card(e.name + "_react_attack_" + i, "", "", att.formula,
                    Card.DIRECTED, false, 0,  att.action));
            }

            let enemy = new Enemy(
                e.name,
                e.maxHP,
                e.baseAttack,
                new Card(e.name + "_special_attack", "", "", e.specialAttack.formula,
                    Card.DIRECTED, false, 0,  e.specialAttack.action),
                arr,
                e.sprite,
                e.size
            );
            enemy.image = e.image;
            this.enemies[e.name] = enemy;
            if (e.description) enemy.description = e.description;
        }
    }

}


/**
 * Interface for objects that listen to changes in enemy objects
 * @author Florian
 */
export interface EnemyListener {
    enemyHpChanged(enemy:Enemy, changedFrom:number, changedTo: number): void;
    Attacking(enemy:Enemy);
}