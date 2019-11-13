export class Card {
    attackPower: number;

    constructor(attackPower: number) {
        this.attackPower = attackPower;
    }

    getPower(): number {
        return this.attackPower;
    }


}