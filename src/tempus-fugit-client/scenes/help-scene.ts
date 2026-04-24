import {HelpWindow} from "../objects/help-gui-objects/help-window";
import {HelpButton} from "../objects/help-gui-objects/help-button";
import {SoundButton} from "../objects/sound-button";
import {PauseButton} from "../objects/pause-gui-objects/pause-button";
import {TutorialButton} from "../objects/tutorial-objects/tutorial-button";
import {DeckBuilderButton} from "../objects/navigation-scene-objects/deck-builder-button";
import {NavigationScene} from "./navigation-scene";

export class HelpScene extends Phaser.Scene {
    public helpWindow: HelpWindow;
    public parentScene: Phaser.Scene;
    private closing: boolean = false;

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
        this.closing = false;
        this.sys.canvas.style.cursor = "default";
        this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.5);
        this.helpWindow = new HelpWindow(this);
        this.helpWindow.createWindow();
        this.scene.pause(HelpButton.currHelpParent);

        if (HelpButton.currHelpParent === 'NavigationScene') {
            new SoundButton(this, 1690, 50);
            new PauseButton(this, false, () => {
                this.closing = true;
                this.scene.resume(HelpButton.currHelpParent);
                PauseButton.currPauseParent = HelpButton.currHelpParent;
                this.scene.run('PauseScene');
                this.scene.stop('HelpScene');
            });
            new TutorialButton(this, 1600, 50, () => {
                this.closing = true;
                this.scene.run('TutorialScene', {backScene: HelpButton.currHelpParent, guided: false});
                this.scene.stop('HelpScene');
            });
            new HelpButton(this, false, () => {
                this.closing = true;
                this.scene.resume(HelpButton.currHelpParent);
                this.scene.stop('HelpScene');
            });
            new DeckBuilderButton(this, 1780, 50, NavigationScene.instance.player, () => {
                this.closing = true;
                this.scene.run('DeckBuilderScene', {parent: HelpButton.currHelpParent, player: NavigationScene.instance.player, newCards: DeckBuilderButton.newCards});
                this.scene.stop('HelpScene');
            });
        }
    }
}
