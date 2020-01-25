import { Scene } from "phaser";


export class AttackGui extends Phaser.GameObjects.Sprite {

    public duration:number = 500;

    constructor(scene:Scene, texture:string) {
        super(scene, 0, 0, texture);

        this.setVisible(false);
    }

    public attack(x1:number, y1:number, x2:number, y2:number):void {
        
    }
}