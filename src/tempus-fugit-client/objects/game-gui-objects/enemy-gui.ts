import {Enemy} from "../game-objects/enemy";


export class EnemyGUI extends Phaser.GameObjects.Sprite {

    private _hp: number; // health points
    private enemy: Enemy; // enemy object associated with this gui

    constructor(
        scene: Phaser.Scene,
        texture: string,
        enemy: Enemy,
        hp: number = 100,
        x: number = 500,
        y: number = 500
    ) {
        super(scene, x, y, texture);
        this.scene.add.existing(this);
        this.enemy = enemy;
    }


    get hp(): number {
        return this._hp;
    }

    set hp(value: number) {
        this._hp = value;
    }
}
