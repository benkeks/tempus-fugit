import { Scene, Game } from "phaser";
import { GameInfo } from "../../game";
import { Mission, MissionListener } from "../../mechanics/mission";
import { Enemy } from "../game-objects/enemy";
import { StoryDialog } from "../../mechanics/story-dialog";

export class WheelGUI extends Phaser.GameObjects.Container implements MissionListener {

    public scene: Phaser.Scene;
    public wheel: Phaser.GameObjects.Sprite;
    public box: Phaser.GameObjects.Rectangle;
    public text: Phaser.GameObjects.Text;

    public size: number;

    public game: Mission;

    constructor(scene: Scene,
        game: Mission,
        x: number = undefined,
        y: number = undefined,
        size: number = undefined) {

        if (!size) {
            size = Math.min(GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 20),
                GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 20))
        }

        if (!x || !y) {
            x = GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 100);
            y = GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 100);
        }

        super(scene, x, y);
        scene.add.existing(this);

        this.game = game;
        game.listener.push(this);

        let buttonWidth = size;
        let buttonHeight = 50;
        this.scene = scene;
        this.size = size;

        this.wheel = this.scene.add.sprite(0, -buttonHeight, "wheel", 0);
        this.wheel.setOrigin(1, 1)
        this.wheel.setScale(size / this.wheel.displayWidth);

        scene.anims.create({
            key: "wheel_play_to_stand",
            frames: scene.anims.generateFrameNumbers("wheel", { start: 0, end: 2 }),
            frameRate: 20,
            repeat: 0
        });

        scene.anims.create({
            key: "wheel_stand_to_enemy",
            frames: scene.anims.generateFrameNumbers("wheel", { start: 2, end: 4 }),
            frameRate: 20,
            repeat: 0
        });

        scene.anims.create({
            key: "wheel_enemy_to_play",
            frames: scene.anims.generateFrameNumbers("wheel", { start: 4, end: 0 }),
            frameRate: 20,
            repeat: 0
        });

        this.add(this.wheel);

        this.createButton(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight);
    }

    /**
     *  creates for button for ending selection of boolean values
     */
    private createButton(x: number, y: number, width: number = undefined, height: number = undefined) {
        /*// @ts-ignore
        let padding = GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 1)
        let buttons = this.scene.uirexUI.add
            .buttons({
                x: x,
                y: y - padding,
                orientation: "y",
                buttons: [
                    // @ts-ignore
                    this.scene.rexUI.add.label({
                        width: 70,
                        height: 30,
                        // @ts-ignore
                        background: this.scene.rexUI.add.roundRectangle(
                            0,
                            0,
                            120,
                            60,
                            10,
                            COLOR_BUTTON
                        ),
                        text: this.scene.add.text(80, 0, "  Done", {
                            fontSize: 20,
                            fontStyle: 'bold',
                            fontFamily: 'appleKid',
                            color: '#FFFFFF'
                        }),
                        space: {
                            left: 10,
                            right: 10
                        }
                    })
                ]
            })
            .layout();

        buttons.on(
            "button.click",
            function (button, index, pointer, event) {
                this.game.nextPhase();
            },
            this
        );

        this.add(buttons);*/

        this.box = this.scene.add.rectangle(x, y, width, height, 0x666666);
        this.box.setOrigin(0.5, 0.5);

        this.text = this.scene.add.text(x, y, "Done", {
            fontSize: 20,
            fontStyle: 'bold',
            fontFamily: 'appleKid',
            color: '#FFFFFF'
        });
        this.text.setOrigin(0.5, 0.5);

        this.sendToBack(this.box);

        this.box
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', function (pointer, localX, localY, event) {
                this.game.nextPhase(Mission.STAND_PHASE);
            }, this);

        this.add(this.box);
        this.add(this.text);
    }

    async drawPhase(game: Mission) {
    }
    async energyPhase(game: Mission) {
        this.wheel.play("wheel_enemy_to_play");
    }
    async playPhase(game: Mission) {
    }
    async standPhase(game: Mission) {
        this.wheel.play("wheel_play_to_stand");
    }
    async enemyPhase(game: Mission) {
        this.wheel.play("wheel_stand_to_enemy");
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
    async Activated(game: Mission, active: boolean) {
        if (!active) this.box.disableInteractive();
        else this.box.setInteractive();
    }

}