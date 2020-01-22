import {Player, PlayerListener} from "../game-objects/player";
import {Card} from "../game-objects/card";
import {Enemy} from "../game-objects/enemy";
import {Mission} from "../../mechanics/mission";
import { MissionScene } from "../../scenes/mission-scene";

/**
 * @author Mustafa
 */
export class PlayerGUI extends Phaser.GameObjects.Sprite implements PlayerListener{
    
    private player: Player; // player object associated with this gui
    private hpText: Phaser.GameObjects.Text; // shows hp of player
    private baseAttackText: Phaser.GameObjects.Text; // shows base attack of player
    public listener: EnemyAttackListener[] = []; // List of objects listening to enemy attack events
    private sword: Phaser.GameObjects.Sprite;
    private heart: Phaser.GameObjects.Sprite;


    constructor(
        scene: Phaser.Scene,
        texture: string,
        player: Player,
        hp: number = 100,
        x: number = 300,
        y: number = 550
    ) {
        super(scene, x, y, texture);
        this.scene.add.existing(this);
        this.player = player;
        const textStyle = {
            fontSize: '40px',
            fontStyle: 'bold',
            fontFamily: 'appleKid',
            color: '#FFFFFF'
        };
        this.setScale(5,5);

        this.baseAttackText = this.scene.add.text(this.x + 150  , this.y + 290,  player.baseAttack.toString()).setStyle(textStyle);
        this.sword = this.scene.add.sprite(this.x+80, this.y+320, "swordFont");
        this.sword.setScale(2,2);
        this.hpText = this.scene.add.text(this.x + 150  , this.y + 430, player.getHP().toString()).setStyle(textStyle);
        this.heart = this.scene.add.sprite(this.x+80, this.y+450, "heartFont");
        this.heart.setScale(2,2);
        this.player.listener.push(this);
    }

    /**
     * change HP display of player
     * @param changedTo
     */
    async playerHpChanged(changedTo: number, changedBy: number) {
        this.hpText.setText('' + changedTo);
        let font1: Object = { fontSize: '50px', fontFamily: 'appleKid', color: '#FF0000' };
        console.log(changedBy);
        if (changedBy > 0) {
            font1 = { fontSize: '50px', fontFamily: 'appleKid', color: '#00DD00' }
            let damageText = this.scene.add.text(this.x-20, this.y-100, Math.abs(changedBy).toString(), font1);
            this.scene.tweens.add({targets: damageText ,duration: 600, y: damageText.y-40, ease: "Linear",
                onComplete: function () {
                    damageText.destroy()
                }});
        } else if (changedBy < 0) {
            let damageText = this.scene.add.text(this.x-20, this.y-100, Math.abs(changedBy).toString(), font1);
            this.scene.tweens.add({targets: damageText ,duration: 600, y: damageText.y-40, ease: "Linear", delay: 500,
                onComplete: function () {
                    damageText.destroy()
                }});
            let blood = this.scene.add.sprite(this.x, this.y+30, "blood");
            blood.setScale(0.3,0.4);
            blood.alpha = 0;
            this.scene.tweens.add({targets: blood ,duration: 200, alpha: 1, ease: "power2", yoyo: true,
                onComplete: function () {
                    blood.destroy()
                }});
        }
    }

    async stateValuesChanged(player: Player) {
        this.baseAttackText.setText(player.baseAttack.toString());
    }

    async Activated(player: Player, active: boolean) {}

    async Attacking(player:Player, target:Enemy) {
        MissionScene.createAttackAnimation(this.scene, this);
    } // TODO: implement animation when attacking
}

/**
 * Interface for objects that listen when user attacks enemy with a card
 */
export interface EnemyAttackListener {
    applyCard(card: Card, enemy: Enemy, mission: Mission): void;
}