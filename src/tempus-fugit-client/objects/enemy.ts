import {Player} from "./player"
import {Card} from "./card"

export class Enemy {
    maxHealth: number;
    currentHealth: number;

    constructor() {
        this.maxHealth = 50;
        this.currentHealth = this.maxHealth;
    }

    getHealth(): string {
        return this.currentHealth.toString();
    }

    attack(player: Player, points: number) {
        player.takeHit(points);
    }

    takeHit(hitPower: number) {
        this.currentHealth -= hitPower;
    }
}