

import GameObject = Phaser.GameObjects.GameObject;
import {Card} from "../game-objects/card";
import {StandListener} from "../../mechanics/mission";
import {CardGUI} from "./card-gui";
import {StandDescriptionGUI} from "./stand-description-gui";
import { MissionScene } from "../../scenes/mission-scene";


/**
 * @author Florian
 */
export class StandGUILayout extends Phaser.GameObjects.Container implements StandListener{

    private elementList: Phaser.GameObjects.Sprite[];
    private roundList: Phaser.GameObjects.Text[];
    private cardsList: CardGUI[];
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
        this.cardsList = [];
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
        this.cardsList = [];
        for (let i of [0,1]) {
            let stand = this.stands[i];
            if (stand != null) {
                let standImage = this.scene.add.sprite(200*i, 0, stand.getImage(), 0).setScale(4, 4);
                let desc = null;
                standImage.setInteractive();
                standImage.on("pointerover", function(pointer){
                    desc = new StandDescriptionGUI(this.scene, this.x+200*i, this.y, stand);
                    desc.depth = 1000;
                    desc.setScale(2,2);
                    this.scene.add.existing(desc);
                    }, this);
                standImage.on("pointerout", function(pointer){
                    desc.destroy();
                }, this);
                let tw = this.scene.tweens.add({targets: standImage,duration: 400, y: standImage.y-5, ease: "Linear", yoyo: true, repeat: -1, delay: 0, loopDelay: 0});


                this.elementList.push(standImage);
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

    Attacking(stand: Card) {
        for (let i in this.stands) {
            if (this.stands[i] == stand) {
                MissionScene.createAttackAnimation(this.scene,this.elementList[i]);
            }
        }
    }

}