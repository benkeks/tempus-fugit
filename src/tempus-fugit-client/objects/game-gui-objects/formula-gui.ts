

import GameObject = Phaser.GameObjects.GameObject;


/**
 * @author Florian
 */
export class FormulaGUI extends Phaser.GameObjects.Container {

    private elementList: Phaser.GameObjects.Sprite[];
    public scene: Phaser.Scene;
    private reps: { [char: string]: { type: string, frame: number } } = {};
    public graphics:Phaser.GameObjects.Graphics;
    public tintGraphics:Phaser.GameObjects.Graphics;
    public bounds:Phaser.Geom.Rectangle;

    public tintRect;

    constructor(
        scene: Phaser.Scene,
        formulaString: string,
        x: number,
        y: number,
        margin: number,
        withRectangle: boolean,
        downscale:boolean=true
    ) {
        super(scene, x, y);
        this.scene = scene;

        this.reps["n"] = { type: "runes", frame: 0 };
        this.reps["s"] = { type: "runes", frame: 1 };
        this.reps["l"] = { type: "runes", frame: 2 };
        this.reps["t"] = { type: "runes", frame: 3 };
        this.reps["&"] = { type: "operators", frame: 0 };
        this.reps["|"] = { type: "operators", frame: 1 };
        this.reps["-"] = { type: "operators", frame: 2 };
        this.reps["="] = { type: "operators", frame: 3 };
        this.reps["!"] = { type: "operators", frame: 4 };
        this.reps["F"] = { type: "operators", frame: 5 };
        this.reps["E"] = { type: "operators", frame: 6 };
        this.reps["H"] = { type: "operators", frame: 7 };
        this.reps["G"] = { type: "operators", frame: 8 };
        this.reps["Y"] = { type: "operators", frame: 9 };
        this.reps["X"] = { type: "operators", frame: 10 };
        this.reps["R"] = { type: "operators", frame: 11 };
        this.reps["U"] = { type: "operators", frame: 12 };
        this.reps["("] = { type: "operators", frame: 13 };
        this.reps[")"] = { type: "operators", frame: 14 };
        let pos = 0;
        this.elementList = [];
        const formulaWidth = (16 + margin) * (formulaString.length + 1);
        for (let char of formulaString) {
            this.elementList.push(this.scene.add.sprite(pos, 0, this.reps[char].type, this.reps[char].frame));
            pos += (16 + margin);
        }
        if (withRectangle) {
            this.graphics = this.scene.add.graphics();
            this.graphics.lineStyle(4, 0xFFFFFF, 0.6);
            this.bounds = new Phaser.Geom.Rectangle(-20, -22, formulaWidth, 44);
            this.graphics.strokeRoundedRect(-20, -22, formulaWidth, 44, 10);
            this.graphics.fillStyle(0xFFFFFF, 1);
            this.graphics.fillRoundedRect(-20, -22, formulaWidth, 44, 10);
            this.add(this.graphics);

            this.tintRect = this.scene.add.rectangle(-20, -22, formulaWidth, 44, 0x000000, 0).setOrigin(0, 0);
            this.add(this.tintRect);
            this.sendToBack(this.tintRect);
            this.tintRect.setInteractive();
        }

        for (let el of this.elementList) {
            if (downscale) el.setScale(0.75);
            if (withRectangle) el.setOrigin(0.5);
            else el.setOrigin(0);
            this.add(el);
        }

        if (withRectangle) {
            this.tintGraphics = this.scene.add.graphics();
            this.tintGraphics.fillStyle(0x333333, 0.5);
            this.tintGraphics.fillRoundedRect(-20, -22, formulaWidth, 44, 10);
            this.tintGraphics.setVisible(true);
            this.add(this.tintGraphics);
        }

        scene.add.existing(this);
    }

}