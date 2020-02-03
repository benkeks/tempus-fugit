import { Scene, Game } from "phaser";
import { GameInfo } from "../../game";
import { Mission, MissionListener } from "../../mechanics/mission";
import { Enemy } from "../game-objects/enemy";
import { StoryDialog } from "../../mechanics/story-dialog";

export class BaseAttackGUI extends Phaser.GameObjects.Container implements MissionListener {

    public scene: Phaser.Scene;
    public icon: Phaser.GameObjects.Sprite;
    public box: Phaser.GameObjects.Rectangle;
    public shadow: Phaser.GameObjects.Rectangle;
    public text: Phaser.GameObjects.Text;
    public game: Mission;

    constructor(scene: Scene,
        game: Mission,
        x: number = undefined,
        y: number = undefined, ) {

        super(scene, x, y);
        scene.add.existing(this);

        this.game = game;
        game.listener.push(this);

        this.scene = scene;

        let buttonHeight = 100;
        let buttonWidth = 120;

        this.createButton(-19, -9, buttonWidth, buttonHeight);
        this.setScale(1.2);
    }


    /**
     *  creates for button for ending selection of boolean values
     */
    private createButton(x: number, y: number, width: number = undefined, height: number = undefined) {
        /*this.box = this.scene.add.graphics();
        this.box.lineStyle(20, 0x666666, 1);
        this.box.strokeRoundedRect(GameInfo.width * 0.8, GameInfo.height * 0.72, GameInfo.width * 0.08, GameInfo.height * 0.1, 30);
        this.box.fillStyle(0x666666, 1);
        this.box.fillRoundedRect(GameInfo.width * 0.8, GameInfo.height * 0.72, GameInfo.width * 0.08, GameInfo.height * 0.1, 30);*/
        this.box = this.scene.add.rectangle(x + 88, y + 40, width, height, 0x666666);
        this.box.setOrigin(1);
        this.sendToBack(this.box);
        this.shadow = this.scene.add.rectangle(x + 88, y + 40, width, height, 0x666666);
        this.shadow.setOrigin(1);
        this.shadow.setAlpha(0.0);



        this.icon = this.scene.add.sprite(x + 25, y - 30, "baseAttack").setScale(1.5);

        this.text = this.scene.add.text(x + 25, y + 20, " Base\nAttack", {
            fontSize: 12,
            fontStyle: 'bold',
            fontFamily: 'pressStart',
            color: '#FFFFFF'
        });
        this.text.setOrigin(0.5);


        this.box
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', function (pointer, localX, localY, event) {
                this.game.player.attackWithBaseAttack(this.game);
                this.game.player.takeCard(this.game.deck);
                this.game.nextPhase(Mission.STAND_PHASE);
            }, this);

        this.add(this.box);
        this.add(this.icon);
        this.add(this.text);
        this.add(this.shadow);
    }

    async drawPhase(game: Mission) {
    }
    async energyPhase(game: Mission) {

    }
    async playPhase(game: Mission) {
    }
    async standPhase(game: Mission) {

    }
    async enemyPhase(game: Mission) {

    }
    async effectPhase(game: Mission) {
    }
    async storyDialog(game: Mission, dialog: StoryDialog) {
    }
    async storyMonolog(game: Mission, monolog: string) {
    }
    async waveChanged(game: Mission, activeWave: number, enemies: Enemy[]) {
    }
    async gameover(game: Mission, gameWon: boolean) {
    }
    async music(game:Mission, song:string) {}
    async Activated(game: Mission, active: boolean) {
        if (!active) {
            this.box.disableInteractive();
            this.shadow.setAlpha(0.7);
        } else {
            this.box.setInteractive();
            this.shadow.setAlpha(0.0);
        }
    }
    async baseAttackPossible(game: Mission, active: boolean) {
        if (!active) {
            this.box.disableInteractive();
            this.shadow.setAlpha(0.7);
        } else {
            this.box.setInteractive();
            this.shadow.setAlpha(0.0);
        }
    }

}