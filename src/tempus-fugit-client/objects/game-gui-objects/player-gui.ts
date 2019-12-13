import {Player, PlayerListener} from "../game-objects/player";
import {Card} from "../game-objects/card";
import {Enemy} from "../game-objects/enemy";
import {GameState} from "../game-objects/game-state";
import {SpeechBubble} from "./speech-bubble";
import {Mission} from "../../mechanics/mission";

/**
 * @author Mustafa
 */
export class PlayerGUI extends Phaser.GameObjects.Sprite implements PlayerListener{

    private player: Player; // player object associated with this gui
    private hpText: Phaser.GameObjects.Text; // shows hp of player
    private baseAttackText: Phaser.GameObjects.Text; // shows base attack of player
    public listener: EnemyAttackListener[] = []; // List of objects listening to enemy attack events

    public speechBubble:SpeechBubble;

    constructor(
        scene: Phaser.Scene,
        texture: string,
        player: Player,
        hp: number = 100,
        x: number = 500,
        y: number = 500
    ) {
        super(scene, x, y, texture);
        this.scene.add.existing(this);
        this.player = player;
        const textStyle = {
            fontSize: '18px',
            fontStyle: 'bold',
            fontFamily: 'Arial',
            color: '#cc0000'
        };

        this.speechBubble = new SpeechBubble(scene, x-50,y-175, 200,150);

        this.hpText = this.scene.add.text(x - 110  , y - 50, 'hp: ' + player.getHP()).setStyle(textStyle);
        this.baseAttackText = this.scene.add.text(x - 50  , y - 50, 'Attack: ' + player.baseAttack).setStyle(textStyle);
        this.player.listener.push(this);
    }

    /**
     * change HP display of player
     * @param changedTo
     */
    playerHpChanged(changedTo: number): void {
        this.hpText.setText('hp: ' + changedTo);
    }
}

/**
 * Interface for objects that listen when user attacks enemy with a card
 */
export interface EnemyAttackListener {
    applyCard(card: Card, enemy: Enemy, mission: Mission): void;
}