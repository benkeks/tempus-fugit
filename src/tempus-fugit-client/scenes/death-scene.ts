import {MissionScene} from "./mission-scene";

export class DeathScene extends Phaser.Scene {
    static deathQuit: boolean = false;

    public sceneData: Object;
    public tryAgain;
    public backToNav;
    public quitText;

    constructor() {
        super({
            key: "DeathScene"
        })
    }

    preload() {
        this.load.image("skull", "assets/sprites/skull.png");
    }

    create(data) {
        this.sceneData = data;
        this.add.rectangle(1920 / 2, 1080 / 2, 1920, 1080, 0x000000);
        this.add.sprite(1920 / 2, 430, 'skull').setScale(5);

        let createText = (text) => this.add.text(0, 0, text, {fontSize: '36px', fontFamily: "appleKid"});

        this.tryAgain = createText('Try Again?');
        this.backToNav = createText('Back to Navigation');
        this.quitText = createText('Quit');
        let gameOver = this.add.text(0,0,'GAME OVER', {fontSize: '72px', fontFamily: "appleKid"});

        //@ts-ignore
        let sizer = this.rexUI.add.sizer({
            orientation: 'y',
            x: 1920 / 2,
            y: 800
        });

        let texts = [this.tryAgain, this.backToNav, this.quitText];
        let indexToFn = [this.retry, this.navigation, this.quit];

        [gameOver, ...texts].reduce((sizer, text) => {
            return sizer.add(text, 1, 'center', 5, false);
        }, sizer);

        sizer.layout();

        texts.map(txt => txt.setInteractive());

        // initiate pointer over out and click events
        texts.map((txt, index) => txt.on('pointerdown', indexToFn[index], this));
        texts.map(txt => txt.on('pointerover', () => txt.setColor('red')));
        texts.map(txt => txt.on('pointerout', () => txt.setColor('white')));
    }

    public retry() {
        this.scene.stop();
        this.scene.start('MissionScene', MissionScene.latestData);
    }

    public navigation() {
        this.scene.stop();
        this.scene.start('NavigationScene', this.sceneData);
    }

    public quit() {
        DeathScene.deathQuit = true;
        this.scene.stop();
        this.scene.start('StartingScene');
    }
}