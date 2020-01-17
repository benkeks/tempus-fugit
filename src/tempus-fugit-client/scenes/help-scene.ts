import {HelpWindow} from "../objects/help-gui-objects/help-window";

const COLOR_PRIMARY = 0x2a4f16;

export class HelpScene extends Phaser.Scene {
    private helpWindow: HelpWindow;
    // TODO : keep track of help page

    constructor() {
        super({
            key: 'HelpScene'
        });
    }

    init(data) { // TODO pass data in the when fairy click?

    }

    preload() {
        this.load.pack("preload", "assets/pack.json", "preload");
        this.load.spritesheet("runes", "assets/font/fontletter/runes/runes-Sheet.png", {frameWidth: 16, frameHeight: 32});
        this.load.spritesheet("operators", "assets/font/fontletter/operators/operator-Sheet.png", {frameWidth: 16, frameHeight: 32});
    }

    create() {
        // console.log(this);
        this.helpWindow = new HelpWindow(this);
        this.helpWindow.createWindow();
    }
}