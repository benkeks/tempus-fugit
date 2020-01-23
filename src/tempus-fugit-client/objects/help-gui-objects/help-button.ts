export class HelpButton {
    private scene: Phaser.Scene;
    private sprite: Phaser.GameObjects.Sprite;
    static currHelpParent: string;

    constructor(scene: Phaser.Scene, isMissionScene: boolean) {
        this.scene = scene;
        // TODO change the values
        this.sprite = scene.add.sprite(isMissionScene ? 160 : 1850, isMissionScene ? 500 : 1020, 'fairy', 1).setScale(1.5);
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
        s.run('HelpScene');
        HelpButton.currHelpParent = s.key;
    }


}