export class CreditScene extends Phaser.Scene {
    public prevScene: string;
    public c: Phaser.GameObjects.Text[];

    constructor() {
        super({
            key: 'Credits'
        });
    }

    create(data) {
        this.prevScene = data;
        credits.map()
    }

    addCredits(text) {
        this.c.push(this.add.text(1920/2, 1080, text));

    }
}

const credits = [
    `Placeholder Credits`,
    `For helping kejni pass`,
    `Everyone on my team, you guys are one of the best groups I've had `,
    `For being a vampire `,
    `Mustafa`,
    `For being MVP and finishing game`,
    `Tobi`,
    `For not letting me do assets (not thanking)`,
    `Alessio`
];

