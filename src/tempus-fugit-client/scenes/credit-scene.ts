export class CreditScene extends Phaser.Scene {
    public prevScene: string;
    public onScreen: Phaser.GameObjects.Text[] = [];
    public nextDelay: number = 90;  // when this equals credit delay the next line will be displayed
    public creditIndex: number = 0;             // it gets reset to 0 every credit
    public speed: number;                       // set it close to credit delay so they start quick
    public slowSpeed: number = 1;
    public fastSpeed: number = 10;
    public creditDelay: number = 100;   // delay between credits
    public fontSize: number = 24;

    constructor() {
        super({
            key: 'Credits'
        });
    }

    create(data) {
        this.creditIndex = 0;
        this.nextDelay = 90;
        this.onScreen = [];
        this.prevScene = data.key;
        this.scene.pause(this.prevScene);
        this.speed = this.slowSpeed;
        //@ts-ignore
        this.rexUI.add.roundRectangle(1920 / 2, 1080 / 2, 1920, 1080, 0, 0x000000);
        this.add.text(1700, 1000, 'Skip', {
            fontSize: '36px',
            fontFamily: 'pressStart',
            color: '#ff3333'
        }).setInteractive().on('pointerdown', this.endCredits, this);
        this.input.keyboard.on('keydown', e => {
            this.speed = this.fastSpeed;
        });
        this.input.keyboard.on('keyup', e => {
            this.speed = this.slowSpeed;
        });
    }

    moveCredits(speed) {
        this.onScreen.map((credit, index) => {
            credit.setPosition(credit.x, credit.y - speed);
            if (credit.y < -100) {  // off screen
                credit.destroy();
                this.onScreen.splice(index, 1);    // remove reference from array
            }
        })
    }

    endCredits() {
        this.scene.run(this.prevScene);
        this.scene.stop(this.scene.key);
    }

    update(time: number, delta: number): void {
        this.nextDelay += this.speed;

        if (this.nextDelay > this.creditDelay && this.creditIndex < credits.length) {
            let text = credits[this.creditIndex];
            this.onScreen.push(this.add.text(1920 / 2, 1080, credits[this.creditIndex], {
                fontSize: `${this.fontSize}px`,
                fontFamily: 'pressStart'
            }).setOrigin(0.5));
            this.creditIndex += 1;
            this.nextDelay = 0;
        }

        this.moveCredits(this.speed);

        if (this.creditIndex >= credits.length && this.onScreen.length === 0) this.endCredits();
    }
}

const credits = [
    `Tempus Fugit`,
    `Made by ...`,
    `Lead Software Developer................................Tobias Loch`,
    `Software Developer.....................................Mustafa Mohsen`,
    `Software Developer & Mergerequest Manager..............Florian Eyert`,
    `Software Developer, Mergerequest Manager & Artist......Kejni Dema`,
    `Product Owner, Card Designer & Artist..................Maximilian Lukas Stamm`,
    `Scrum Master, DevOP & Artist...........................Alessio Nicolo Perna`,
    `...............`,
    `Music by ...`,
    `Malek El-Tannir`,
    `...............`,
    `Special Thanks to ...`,
    `Willy Cai`
];

