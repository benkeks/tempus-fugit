import {Enemy, EnemyListener} from "../game-objects/enemy";
import {GameInfo} from "../../game";
import {SpeechBubble} from "./speech-bubble";

/**
 * @author Mustafa
 */
export class EnemyGUI extends Phaser.GameObjects.Container implements EnemyListener{

    public static readonly TEXT_PADDING = 20;

    public enemy: Enemy; // enemy object associated with this gui
    private hpText: Phaser.GameObjects.Text; // shows hp of enemy
    private baseAttackText: Phaser.GameObjects.Text; // shows base attack of enemy
    private sprite:Phaser.GameObjects.Sprite;

    constructor(
        scene: Phaser.Scene,
        enemy: Enemy,
        x: number = 1500,
        y: number = 500,
        texture:string=undefined
    ) {
        if (!texture) {
            texture = enemy.image;
        }
        super(scene, x, y);
        this.scene.add.existing(this);
        this.enemy = enemy;
        this.enemy.listener.push(this);

        const textStyle = {
            fontSize: '18px',
            fontStyle: 'bold',
            fontFamily: 'Arial',
            color: '#cc0000'
        };

        this.sprite = this.scene.add.sprite(0,0,texture, 0);

        this.scene.anims.create({
            key: "standing",
            frames: this.scene.anims.generateFrameNumbers(texture, {start:0}),
            frameRate: 10,
            repeat: -1
        });

        this.hpText = this.scene.add.text(0, 0, "").setStyle(textStyle);
        this.baseAttackText = this.scene.add.text(0, 0, "").setStyle(textStyle);

        this.setHP(enemy.currentHP);
        this.setBaseAttack(enemy.baseAttack);

        //this.sprite.anims.play("standing");

        this.add(this.sprite);
        this.add(this.hpText);
        this.add(this.baseAttackText);
        this.setPosition(x,y);
    }

    public centerSprite():void {
        let x1:number = this.hpText.x;
        let y1:number = this.hpText.y;
        let x2:number = this.baseAttackText.x + this.baseAttackText.width;
        let y2:number = this.baseAttackText.y + this.baseAttackText.height;

        this.sprite.setPosition(((x1+x2)/2), y2);
    }
    
    public setBaseAttack(attack:number):void {
        this.baseAttackText.setText('Attack: ' + attack);
        this.centerSprite();
    }

    public setHP(hp:number):void {
        this.hpText.setText('hp: ' + hp);
        this.baseAttackText.setPosition(this.hpText.width + EnemyGUI.TEXT_PADDING, this.baseAttackText.y);
        this.centerSprite();
    }
    /**
     * change HP display of enemy
     * @param changedTo
     */
    enemyHpChanged(enemy:Enemy, changedFrom:number, changedTo:number): void {
        this.setHP(changedTo);
    }
}
