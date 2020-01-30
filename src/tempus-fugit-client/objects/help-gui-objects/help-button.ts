export class HelpButton {
    static newInfo: boolean = false;

    private scene: Phaser.Scene;
    private sprite: Phaser.GameObjects.Sprite;
    private notification: Phaser.GameObjects.Sprite;

    private test1: Phaser.GameObjects.Sprite;
    private test2: Phaser.GameObjects.Sprite;

    private isMissionScene: boolean;
    static currHelpParent: string;

    constructor(scene: Phaser.Scene, isMissionScene: boolean) {
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
        this.sprite.anims.load('fairy-fly');
        this.sprite.setInteractive();
        this.sprite.on('pointerdown', this.displayHelp, this);
        this.sprite.on('pointerover', () => {
            this.sprite.anims.play('fairy-fly');
        });
        this.sprite.on('pointerout', () => {
            this.sprite.anims.stop();
            this.sprite.anims.setProgress(1 / 6);
        });

        this.test1 = scene.add.sprite(100, 100, 'fairy', 1);
        this.test2 = scene.add.sprite(100, 300, 'fairy', 1);
        this.test1.setInteractive();
        this.test2.setInteractive();

        this.test1.on('pointerdown', this.createNotification, this);
        this.test2.on('pointerdown', this.destroyNotification, this);
    }

    public displayHelp(): void {
        let s = this.scene.scene;
        this.destroyNotification();
        s.run('HelpScene', this.scene);
        HelpButton.currHelpParent = s.key;
    }

    public createNotification() {
        this.notification = this.scene.add.sprite(this.isMissionScene ? 335 : 1830, this.isMissionScene ? 1015 : 980, 'notification').setScale(2);
    }

    public destroyNotification() {
        if(this.notification) this.notification.destroy();
    }


}