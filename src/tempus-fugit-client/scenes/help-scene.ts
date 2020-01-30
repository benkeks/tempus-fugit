import {HelpWindow} from "../objects/help-gui-objects/help-window";
import {HelpButton} from "../objects/help-gui-objects/help-button";

export class HelpScene extends Phaser.Scene {
    public helpWindow: HelpWindow;
    public parentScene: Phaser.Scene;

    constructor() {
        super({
            key: 'HelpScene'
        });
    }

    preload() {
        // this.load.pack("preload", "assets/pack.json", "preload");
        this.load.spritesheet("runes", "assets/font/fontletter/runes/runes-Sheet.png", {frameWidth: 16, frameHeight: 32});
        this.load.spritesheet("operators", "assets/font/fontletter/operators/operator-Sheet.png", {frameWidth: 16, frameHeight: 32});
    }

    create(data) {
        this.helpWindow = new HelpWindow(this);
        this.helpWindow.createWindow();
        this.scene.pause(HelpButton.currHelpParent);

        this.events.on('wake', function () {
            this.scene.pause(HelpButton.currHelpParent);
            this.helpWindow.createWindow();
        }, this);
    }
}