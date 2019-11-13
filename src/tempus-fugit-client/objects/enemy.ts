import {Player} from "./player"
import {Card} from "./card"

export class Enemy {
    name: String;
    maxHP: number;
    currentHP: number;
    baseAttack: number;
    specialEffects: String[];

    constructor(name: String, hp: number, baseAttack: number, specialEffects: String[]) {
        this.name = name;
        this.maxHP = hp;
        this.currentHP = this.maxHP;
        this.baseAttack = baseAttack;
        this.specialEffects = specialEffects;

    }

    getHP(): string {
        return this.currentHP.toString();
    }

    evaluateSpecialEffect(specialEffect: String) {
        return 19;
    }

    attack(player: Player, baseAttack: boolean, n: number) {
        var attackPoints = 0;
        if (baseAttack) {
            attackPoints = this.baseAttack;
        } else {
            attackPoints = this.evaluateSpecialEffect(this.specialEffects[n]);
        }
        player.takeHit(attackPoints);
    }

    takeHit(hitPower: number) {
        this.currentHP -= hitPower;
    }

    isAlive() {
        return this.currentHP > 0;
    }
}