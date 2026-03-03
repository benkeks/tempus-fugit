
import {Player} from "./player"
import {GameState} from "./game-state"
import {Formula} from "../../temporal-logic/formula";
import {Attack} from "./attack"
import {Card} from "./card";
import {Mission} from "../../mechanics/mission";

export class Enemy {
    public static enemies:{[name:string]:Enemy} = {};
    
    public name: string; // The enemy's name
    public key:string; // key in enemies dictionary, if no given is equal to name
    public maxHP: number; // The enemy's maximum hit points
    public currentHP: number; // The enemy's current hit points
    public _baseAttack: number; // The enemy's base attack strength
    public description:string;
    public specialAttackDescription:string = "";
    public specialAttackShortDescription:string = "";
    public image:string;

    public specialAttack: Card; // The enemy's base attack strength

    public listener:EnemyListener[] = []; // A list of objects listening to events happening in the enemy
    public sprite:string;
    public size:number[];

    get baseAttack():number {
        return this._baseAttack;
    }
    set baseAttack(val:number) {
        this._baseAttack = val;
        
        this.listener.map(l => l.baseAttackChanged(this));
    }

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
       let new_enemy:Enemy = new Enemy(this.name, this.maxHP, this.baseAttack, this.specialAttack, this.sprite, this.size);
       new_enemy.key = this.key;
       new_enemy.description = this.description;
       new_enemy.image = this.image;
       new_enemy.specialAttackDescription = this.specialAttackDescription;
       new_enemy.specialAttackShortDescription = this.specialAttackShortDescription;

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
    constructor(name: string, hp: number, baseAttack: number, specialAttack: Card, sprite:string, size:number[]) {
        this.listener = [];this.name = name;
        this.key = this.name;
        this.maxHP = hp;
        this.currentHP = this.maxHP;
        this.baseAttack = baseAttack;
        if (specialAttack) this.specialAttack = specialAttack;
        else this.specialAttack = undefined;
        this.sprite = sprite;
        this.size = size;

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
        let val = !this.applyCard(this.specialAttack, mission)
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

    public reduceBaseAttack() {
        this.baseAttack -= 3;
        if (this.baseAttack < 0) this.baseAttack = 0;
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

            let special = undefined;
            if (e.specialAttack) {
                special = new Card(e.name + "_special_attack", "", "", e.specialAttack.formula,
                Card.DIRECTED, false, 0,  e.specialAttack.action);
                if (e.specialAttack.formulaRepresentation) special.formulaRepresentation = e.specialAttack.formulaRepresentation;
            }

            let enemy = new Enemy(
                e.name,
                e.maxHP,
                e.baseAttack,
                special,
                e.sprite,
                e.size
            );
            enemy.image = e.image;

            if (e.specialAttack && e.specialAttack.description)
                enemy.specialAttackDescription = e.specialAttack.description;
            else if (e.specialAttackDescription)
                enemy.specialAttackDescription = e.specialAttackDescription;

            if (e.specialAttack && e.specialAttack.shortDescription)
                enemy.specialAttackShortDescription = e.specialAttack.shortDescription;

            if (e.key) enemy.key = e.key;

            this.enemies[enemy.key] = enemy;
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
    baseAttackChanged(enemy:Enemy);
}