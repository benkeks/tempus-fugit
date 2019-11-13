export class Card {
    name: String;
    description: String;
    image: String;
    formula: String;
    attackPower: number;

    constructor(name: String, description: String, image: String, formula: String, attackPower: number) {
        this.name = name;
        this.description = description;
        this.image = image;
        this.formula = formula;
        this.attackPower = attackPower;
    }

    getPower(): number {
        return this.attackPower;
    }


}