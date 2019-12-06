import {Enemy, EnemyListener} from "../game-objects/enemy";
import {SpeechBubble} from "./speech-bubble";

/**
 * @author Mustafa
 */
export class EnemyGUI extends Phaser.GameObjects.Sprite implements EnemyListener{

    public enemy: Enemy; // enemy object associated with this gui
    private hpText: Phaser.GameObjects.Text; // shows hp of enemy
    private baseAttackText: Phaser.GameObjects.Text; // shows base attack of enemy

    public speechBubble:SpeechBubble;

    constructor(
        scene: Phaser.Scene,
        texture: string,
        enemy: Enemy,
        hp: number = 100,
        x: number = 1500,
        y: number = 500
    ) {
        super(scene, x, y, texture);
        this.scene.add.existing(this);
        this.enemy = enemy;

        const textStyle = {
            fontSize: '18px',
            fontStyle: 'bold',
            fontFamily: 'Arial',
            color: '#cc0000'
        };

        this.speechBubble = new SpeechBubble(scene, x-50,y-175, 200,150);

        this.hpText = this.scene.add.text(x - 110  , y - 50, 'hp: ' + enemy.getHP()).setStyle(textStyle);
        this.baseAttackText = this.scene.add.text(x - 50  , y - 50, 'Attack: ' + enemy.baseAttack).setStyle(textStyle);
        this.enemy.listener.push(this);
    }

    /**
     * change HP display of enemy
     * @param changedTo
     */
    enemyHpChanged(changedTo: number): void {
        this.hpText.setText('hp: ' + changedTo);
    }
}
