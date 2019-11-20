import {Player} from "./player"
import {Card} from "./card"

export class Enemy {
    name: String;
    maxHP: number;
    currentHP: number;
    baseAttack: number;
    specialEffects: String[];
    listener:EnemyListener[];

   public getHP(): number {
        return this.currentHP;
    }

    public getName(): String {
        return this.name;
    }

    constructor(name: String, hp: number, baseAttack: number, specialEffects: String[]) {
        this.name = name;
        this.maxHP = hp;
        this.currentHP = this.maxHP;
        this.baseAttack = baseAttack;
        this.specialEffects = specialEffects;
        this.listener = [];

    }

    private evaluateSpecialEffect(specialEffect: String) {
        return 19;
    }

    public attack(player: Player, baseAttack: boolean, n: number) {
        var attackPoints = 0;
        if (baseAttack) {
            attackPoints = this.baseAttack;
        } else {
            attackPoints = this.evaluateSpecialEffect(this.specialEffects[n]);
        }
        player.takeHit(attackPoints);
    }

    public takeHit(hitPower: number) {
        this.currentHP -= hitPower;

        for (let i in this.listener) {
            this.listener[i].enemyHpChanged(this.currentHP);
        }
    }

    public isAlive() {
        return this.currentHP > 0;
    }

}


export interface EnemyListener {
    enemyHpChanged(changedTo: number): void;
}