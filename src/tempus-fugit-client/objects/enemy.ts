import {Player} from "./player"
import {Card} from "./card"

export class Enemy {
    name: String;
    maxHP: number;
    currentHP: number;
    baseAttack: number;
    specialEffects: String[];

    constructor(name: String, hp: number, baseAttack: number) {
        this.name = name;
        this.maxHP = hp;
        this.currentHP = this.maxHP;
        this.baseAttack = baseAttack;
        this.specialEffects = [];

    }

    getHP(): string {
        return this.currentHP.toString();
    }

    attack(player: Player, specialEffects: String) {
        var attackPoints = 0;
        if (specialEffects = "base") {
            attackPoints = this.baseAttack;
        } else {
            attackPoints = 20;
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