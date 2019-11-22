import {Player} from "./player";
import {Enemy} from "./enemy";

export class PlayerGUI extends Phaser.GameObjects.Sprite {

    private _hp: number; // health points
    private player: Enemy; // player object associated with this gui

    constructor(
        scene: Phaser.Scene,
        texture: string,
        player: Player,
        hp: number = 100,
        x: number = 1500,
        y: number = 500
    ) {
        super(scene, x, y, texture);
        this.scene.add.existing(this);
        this.player = player;
    }

    get hp(): number {
        return this._hp;
    }

    set hp(value: number) {
        this._hp = value;
    }
}
