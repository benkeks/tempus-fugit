import { Scene, Game } from "phaser";
import { GameInfo } from "../../game";
import { Mission, MissionListener } from "../../mechanics/mission";
import { Enemy } from "../game-objects/enemy";
import { StoryDialog } from "../../mechanics/story-dialog";

export class WheelGUI extends Phaser.GameObjects.Container implements MissionListener {

    public scene: Phaser.Scene;
    public wheel: Phaser.GameObjects.Sprite;
    public box: Phaser.GameObjects.Rectangle;


    // this is the done text that changes if baseAttack is possible
    // It pulsates if base attack is true
    public endRoundTextContainer: Phaser.GameObjects.Container;
    public text: Phaser.GameObjects.Text;
    public plusText: Phaser.GameObjects.Text;
    public baseAttackIcon: Phaser.GameObjects.Sprite;
    public animationTween: Phaser.Tweens.Tween;

    public size: number;

    public game: Mission;

    private baseAttackAllowed: boolean = true;

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
            x = GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 99.25);
            y = GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 97);
        }

        super(scene, x, y);
        scene.add.existing(this);

        this.game = game;
        game.listener.push(this);

        this.scene = scene;
        this.size = size;

        this.wheel = this.scene.add.sprite(0, 0, "wheel", 0);
        this.wheel.setRotation(-Math.PI/2);
        this.wheel.setOrigin(0,1)

        let scale = size / this.wheel.displayWidth;
        this.wheel.setScale(scale);

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

        let buttonHeight = 35;
        let buttonWidth = 178;

        this.createButton(-19, -9, buttonWidth, buttonHeight);
        this.setScale(1.2);
    }

    /**
     *  creates for button for ending selection of boolean values
     */
    private createButton(x: number, y: number, width: number = undefined, height: number = undefined) {
        this.box = this.scene.add.rectangle(x, y, width, height, 0x666666);
        this.box.setOrigin(1);

        this.text = this.scene.add.text(0, 0, "Done", {
            fontSize: 20,
            fontStyle: 'bold',
            fontFamily: 'pressStart',
            color: '#FFFFFF'
        });
        this.text.setOrigin(0.5);

        this.plusText = this.scene.add.text(25, 0, "+", {
            fontSize: 20,
            fontStyle: 'bold',
            fontFamily: 'pressStart',
            color: '#FFFFFF'
        });
        this.plusText.setOrigin(0.5);

        this.baseAttackIcon = this.scene.add.sprite(55, 0, "baseAttack").setScale(1);

        this.endRoundTextContainer = this.scene.add.container(x-width/2, y-height/2, [this.text, this.plusText, this.baseAttackIcon])

        this.sendToBack(this.box);

        this.box
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', function (pointer, localX, localY, event) {
                if (this.baseAttackAllowed) {
                    this.game.player.attackWithBaseAttack(this.game);
                    this.scene.time.delayedCall(500, () => {
                        this.game.player.takeCard(this.game.deck);
                        this.game.nextPhase(Mission.STAND_PHASE);
                    }, [], this)
                } else {
                    this.game.nextPhase(Mission.STAND_PHASE);
                }
            }, this);

        this.add(this.box);
        this.add(this.endRoundTextContainer);
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
    async music(game:Mission, song:string) {}
    async Activated(game: Mission, active: boolean) {
        if (!active) this.box.disableInteractive();
        else this.box.setInteractive();
        this.setBaseAttackAllowed(active);
    }
    async baseAttackPossible(game: Mission, active: boolean) {
        this.setBaseAttackAllowed(active);
    }

    toggleEasingAnimationOfEndRoundButton(active: boolean) {
        if (active) {
            if (this.animationTween) this.animationTween.stop();
            this.animationTween = this.scene.tweens.add({
                targets: this.endRoundTextContainer,
                scale: 1.1,
                duration: 600,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        } else if (this.animationTween) {
            this.animationTween.stop();
        }
    }

    public setBaseAttackAllowed(allowed: boolean) {
        this.baseAttackAllowed = allowed;

        if (this.baseAttackAllowed) {
            this.text.setPosition(-30,0);
            this.plusText.setVisible(true);
            this.baseAttackIcon.setVisible(true);
            this.toggleEasingAnimationOfEndRoundButton(false);
        } else {
            this.text.setPosition(0,0);
            this.plusText.setVisible(false);
            this.baseAttackIcon.setVisible(false);
            this.toggleEasingAnimationOfEndRoundButton(true);
        }
    }

}