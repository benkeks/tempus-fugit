import {HelpScene} from "../../scenes/help-scene";
import {makeLogger} from "ts-loader/dist/logger";

export class HelpButton {
    private scene: Phaser.Scene;
    private sprite: Phaser.GameObjects.Sprite;
    static currHelpParent: string;

    constructor(scene: Phaser.Scene, isMissionScene: boolean) {
        this.scene = scene;
        // TODO change the values after question mark to change position in mission scene
        this.sprite = scene.add.sprite(isMissionScene ? 1700 : 1780, isMissionScene ? 120 : 400, 'fairy', 1).setScale(1.5);
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
    }

    public displayHelp(): void {
        let s = this.scene.scene;
        // Uncomment if we decide not to pause the scene that calls help to avoid spawning help multiple times // run will wake a scene if it is paused but start a new one if it is active
        // let isActive = s.isActive('HelpScene');
        // if (!isActive)
        s.run('HelpScene', {key: s.key});
        HelpButton.currHelpParent = s.key;
    }


}