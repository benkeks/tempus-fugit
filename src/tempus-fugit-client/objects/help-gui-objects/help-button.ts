import {HelpScene} from "../../scenes/help-scene";
import {makeLogger} from "ts-loader/dist/logger";

export class HelpButton {
    private scene: Phaser.Scene;
    private sprite: Phaser.GameObjects.Sprite;
    static currHelpParent: string;

    constructor(scene: Phaser.Scene, top: boolean) {
        this.scene = scene;
        this.sprite = scene.add.sprite(1780, top ? 120 : 400, 'fairy', 1).setScale(1.5);
        scene.anims.create({
            key: 'fairy-fly',
            frames: scene.anims.generateFrameNumbers('fairy', {frames: [0, 1, 3, 4, 2, 5]}),
            defaultTextureKey: 'fairy',
            frameRate: 20,
            repeat: -1,
        });
        this.sprite.anims.load('fairy-fly');
        this.sprite.setInteractive();
        this.sprite.on('pointerdown', this.displayHelp, this);
        this.sprite.on('pointerover', () => {
            this.sprite.anims.play('fairy-fly');
        });
        this.sprite.on('pointerout', () => {
            this.sprite.anims.stop();
            this.sprite.anims.setProgress(1/6);
        });
        // scene.tweens.add({
        //     target: this.sprite,
        //     x: 1920 / 2,
        //     y: 1080 / 2,
        //     duration: 300
        // })

    }

    public displayHelp(): void {
        let s = this.scene.scene;


        // let isActive = s.isActive('HelpScene');
        // if (!isActive)
        // setTimeout(() => {
            s.run('HelpScene', {key: s.key});
            HelpButton.currHelpParent = s.key;
        // }, 300);

    }


}