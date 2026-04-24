export class HelpButton {
    static newInfo: boolean = false;

    private scene: Phaser.Scene;
    private sprite: Phaser.GameObjects.Sprite;
    private notification: Phaser.GameObjects.Sprite;

    private isMissionScene: boolean;
    static currHelpParent: string;

    constructor(scene: Phaser.Scene, isMissionScene: boolean, action?: () => void) {
        this.isMissionScene = isMissionScene;
        this.scene = scene;
        this.sprite = scene.add.sprite(isMissionScene ? 335 : 1850, isMissionScene ? 1015 : 1020, 'fairy', 1).setScale(1.5);
        if (HelpButton.newInfo) this.createNotification();

        scene.anims.create({
            key: 'fairy-fly',
            frames: scene.anims.generateFrameNumbers('fairy', {frames: [0, 1, 3, 4, 2, 5]}),
            defaultTextureKey: 'fairy',
            frameRate: 20,
            repeat: -1,
        });
        this.sprite.setInteractive({useHandCursor:true});
        if (action) {
            this.sprite.on('pointerdown', action);
        } else {
            this.sprite.on('pointerdown', this.displayHelp, this);
        }
        this.sprite.on('pointerover', () => {
            this.sprite.anims.play('fairy-fly');
        });
        this.sprite.on('pointerout', () => {
            this.sprite.anims.stop();
            this.sprite.anims.setProgress(1 / 6);
        });
    }

    public displayHelp(): void {
        let s = this.scene.scene;
        this.destroyNotification();
        s.run('HelpScene', this.scene);
        HelpButton.currHelpParent = s.key;
    }

    public createNotification() {
        this.notification = this.scene.add.sprite(this.isMissionScene ? 320 : 1835, this.isMissionScene ? 980 : 985, 'notification').setScale(2);
        this.scene.add.tween({
            targets: this.notification,
            y: "+=15",
            ease: "Linear",
            duration: 200,
            repeat: 10,
            yoyo: true
        });
    }

    public destroyNotification() {
        if(this.notification) this.notification.destroy();
        HelpButton.newInfo = false;
    }


}