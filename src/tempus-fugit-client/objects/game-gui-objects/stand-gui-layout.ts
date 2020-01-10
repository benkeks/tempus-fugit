

import GameObject = Phaser.GameObjects.GameObject;
import {Card} from "../game-objects/card";
import {StandListener} from "../../mechanics/mission";


/**
 * @author Florian
 */
export class StandGUILayout extends Phaser.GameObjects.Container implements StandListener{

    private elementList: Phaser.GameObjects.Sprite[];
    private roundList: Phaser.GameObjects.Text[];
    public scene: Phaser.Scene;
    private stands:[Card, Card];

    constructor(
        scene: Phaser.Scene,
        x = 500,
        y = 600

    ) {
        super(scene, x, y);
        this.scene = scene;
        this.stands = [null, null];
        this.elementList = [];
        this.roundList = [];
    }

    updateStandGUI(stands:[Card, Card]) {
        let font1: Object = { fontSize: '40px', fontFamily: 'appleKid', color: '#FFFFFF' }
        for (let el of this.elementList) {
            el.destroy();
        }

        for (let el of this.roundList) {
            el.destroy();
        }
        this.stands = stands;
        this.elementList = [];
        this.roundList = [];
        for (let i of [0,1]) {
            let stand = this.stands[i];
            if (stand != null) {
                this.elementList.push(this.scene.add.sprite(200*i, 0, stand.getImage(), 0).setScale(4, 4));
                this.roundList.push(this.scene.add.text(200*i, 70, stand.getRoundsRemaining().toString(), font1));
            }
        }
        for (let el of this.elementList) {
            this.add(el);
        }
        for (let el of this.roundList) {
            this.add(el);
        }
        this.scene.add.existing(this);
    }



}