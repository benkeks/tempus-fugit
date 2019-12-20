

import GameObject = Phaser.GameObjects.GameObject;


/**
 * @author Florian
 */
export class FormulaGUI extends Phaser.GameObjects.Container {

    private elementList: Phaser.GameObjects.Sprite[];
    public scene: Phaser.Scene;
    private reps: {[char: string]: {type: string, frame:  number}} = {};

    constructor(
        scene: Phaser.Scene,
        formulaString: string,
        x: number,
        y: number,
        margin: number,
        withRectangle: boolean
    ) {
        super(scene, x, y);
        this.scene = scene;

        this.reps["n"] = {type: "runes", frame: 0};
        this.reps["s"] = {type: "runes", frame: 1};
        this.reps["l"] = {type: "runes", frame: 2};
        this.reps["t"] = {type: "runes", frame: 3};
        this.reps["&"] = {type: "operators", frame: 0};
        this.reps["|"] = {type: "operators", frame: 1};
        this.reps["-"] = {type: "operators", frame: 2};
        this.reps["="] = {type: "operators", frame: 3};
        this.reps["!"] = {type: "operators", frame: 4};
        this.reps["F"] = {type: "operators", frame: 5};
        this.reps["E"] = {type: "operators", frame: 6};
        this.reps["H"] = {type: "operators", frame: 7};
        this.reps["G"] = {type: "operators", frame: 8};
        this.reps["Y"] = {type: "operators", frame: 9};
        this.reps["X"] = {type: "operators", frame: 10};
        this.reps["R"] = {type: "operators", frame: 11};
        this.reps["U"] = {type: "operators", frame: 12};
        this.reps["("] = {type: "operators", frame: 13};
        this.reps[")"] = {type: "operators", frame: 14};
        let pos = 0;
        this.elementList = [];
        for (let char of formulaString) {
            console.log(char);
            this.elementList.push(this.scene.add.sprite(pos, 0, this.reps[char].type, this.reps[char].frame));
            pos += (16 + margin);
        }
        if (withRectangle) {
            let graphics = this.scene.add.graphics();
            graphics.lineStyle(4, 0xFFFFFF, 0.6);
            let outline = graphics.strokeRoundedRect(-20, -22, (16+margin)*(formulaString.length+1), 44,10);
            graphics.fillStyle(0xFFFFFF, 1);
            let roundRect = graphics.fillRoundedRect(-20, -22, (16+margin)*(formulaString.length+1), 44,10);
            this.add(outline);
        }

        for (let el of this.elementList) {
            this.add(el);
        }
        scene.add.existing(this);
    }

}