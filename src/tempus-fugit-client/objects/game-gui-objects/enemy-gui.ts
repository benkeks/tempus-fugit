import {Enemy, EnemyListener} from "../game-objects/enemy";
import {GameInfo} from "../../game";
import {SpeechBubble} from "./speech-bubble";
import {CharacterGui} from "./character-gui";
import Text = Phaser.GameObjects.Text;

/**
 * @author Mustafa
 */
export class EnemyGUI extends CharacterGui implements EnemyListener{

    public enemy: Enemy; // enemy object associated with this gui
    public attributeText:Text;

    constructor(
        scene: Phaser.Scene,
        enemy: Enemy,
        x: number = 1500,
        y: number = 500,
        texture:string=undefined
    ) {
        super(scene, x, y);
        this.enemy = enemy;
        this.enemy.listener.push(this);

        if (!texture) texture = enemy.image;
        this.defaultColor = 0x404040;
        this.defaultStrokeColor = 0xFFFFFF;

        this.addSpriteByTexture(texture);

        this.attributeText = this.addText("", {fontSize: '18px',
            fontStyle: 'bold',
            fontFamily: 'Arial',
            color: '#FF0000'});

        this.updateEnemyAttributes();

        this.setInteractive();
    }

    public updateEnemyAttributes():void {
        super.setText(0, "\u2694 " + this.enemy.baseAttack + "   \u2764 " + this.enemy.currentHP);
    }

    /**
     * change HP display of enemy
     * @param changedTo
     */
    enemyHpChanged(enemy:Enemy, changedFrom:number, changedTo:number): void {

    }
}
