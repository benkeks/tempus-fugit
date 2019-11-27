import {Player, PlayerListener} from "../game-objects/player";

/**
 * @author Mustafa
 */
export class PlayerGUI extends Phaser.GameObjects.Sprite implements PlayerListener{

    private player: Player; // player object associated with this gui
    private hpText: Phaser.GameObjects.Text; // shows hp of player
    private baseAttackText: Phaser.GameObjects.Text; // shows base attack of player

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
        const textStyle = {
            fontSize: '18px',
            fontStyle: 'bold',
            fontFamily: 'Arial',
            color: '#cc0000'
        };
        this.hpText = this.scene.add.text(x - 110  , y - 50, 'hp: ' + player.getHP()).setStyle(textStyle);
        // TODO: need player.getBaseAttack() function
        this.baseAttackText = this.scene.add.text(x - 50  , y - 50, 'Attack: ' + 10).setStyle(textStyle);

        // TODO: need player function to register as listener
    }

    /**
     * change HP display of player
     * @param changedTo
     */
    playerHpChanged(changedTo: number): void {
        this.hpText.setText('hp: ' + changedTo);
    }
}
