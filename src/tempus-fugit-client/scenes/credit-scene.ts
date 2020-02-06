export class CreditScene extends Phaser.Scene {
    public prevScene: string;
    public c: Phaser.GameObjects.Text[] = [];
    public timer: number = 90;
    public creditIndex: number = 0;
    public speed: number;
    public slowSpeed: number = 1;
    public fastSpeed: number = 10;
    public creditDelay: number = 100;
    public fontSize: number = 36;
    public skip: Phaser.GameObjects.Text;

    constructor() {
        super({
            key: 'Credits'
        });
    }

    create(data) {
        this.prevScene = data.key ? data.key : 'StartingScene';
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
            this.speed = this.slowSpeed;
        });
        this.input.keyboard.on('keyup', e => {
            this.speed = this.fastSpeed;
        });
    }

    moveCredits(speed) {
        this.c.map((credit, index) => {
            credit.setPosition(credit.x, credit.y - speed);
            if (credit.y < -100) {  // off screen
                credit.destroy();
                this.c.splice(index, 1);    // remove reference from array
            }
        })
    }

    endCredits() {
        console.log(this.prevScene);
        this.scene.run(this.prevScene);
        this.scene.stop(this.scene.key);
    }

    update(time: number, delta: number): void {
        this.timer += this.speed;

        if (this.timer > this.creditDelay && this.creditIndex < credits.length) {
            let text = credits[this.creditIndex];
            this.c.push(this.add.text(1920 / 2, 1080, credits[this.creditIndex], {
                fontSize: `${this.fontSize}px`,
                fontFamily: 'pressStart'
            }).setOrigin(0.5));
            this.creditIndex += 1;
            this.timer = 0;
        }

        this.moveCredits(this.speed);

        if (this.creditIndex >= credits.length && this.c.length === 0) this.endCredits();
    }
}

const credits = [
    `Placeholder Credits`,
    `For helping kejni pass`,
    `Everyone, you guys are the best <3`,
    `For being a vampire`,
    `Mustafa`,
    `For being MVP and finishing game`,
    `Tobi`,
    `For not letting me do assets (not thanking)`,
    `Alessio`,
    'For sick spriting and design',
    `Alessio and Max`,
    `For cleanest code`,
    `Florian`,
    `For getting food`,
    `Max`,
    `AND LAST BUT NOT LEAST`,
    `FOR KEEPING THE DREAM TEAM GOING`,
    `THE VERY MOTIVATIONAL TUNES OF`,
    `...............`,
    `...............`,
    `...............`,
    `...............`,
    `...............`,
    `...............`,
    `...............`,
    `PIANO MAN BY ANDY SALAD`,
    `(thanks Mustafa)`
];

