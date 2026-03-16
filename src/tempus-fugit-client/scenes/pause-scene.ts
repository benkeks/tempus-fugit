import {PauseWindow} from "../objects/pause-gui-objects/pause-window";
import {PauseButton} from "../objects/pause-gui-objects/pause-button";
import {SoundButton} from "../objects/sound-button";
import {HelpButton} from "../objects/help-gui-objects/help-button";
import {TutorialButton} from "../objects/tutorial-objects/tutorial-button";
import {DeckBuilderButton} from "../objects/navigation-scene-objects/deck-builder-button";
import {NavigationScene} from "./navigation-scene";

export class PauseScene extends Phaser.Scene {
    private pauseWindow: PauseWindow;

    constructor() {
        super({
            key: 'PauseScene'
        });
    }

    preload() {
    }

    create() {
        this.sys.canvas.style.cursor = "default";
        this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.5);
        this.pauseWindow = new PauseWindow(this);
        const isMissionContext = PauseButton.currPauseParent === 'MissionScene' || PauseButton.currPauseParent === 'BTextBoxScene';
        this.pauseWindow.createPauseWindow(isMissionContext);
        this.scene.pause(PauseButton.currPauseParent);
        this.scene.bringToTop('PauseScene');
        new SoundButton(this, isMissionContext ? 1780 : 1690, isMissionContext ? 310 : 50);
        new PauseButton(this, isMissionContext, () => this.pauseWindow.close());

        if (PauseButton.currPauseParent === 'NavigationScene') {
            new HelpButton(this, false, () => {
                HelpButton.currHelpParent = 'NavigationScene';
                this.scene.run('HelpScene');
                this.scene.stop('PauseScene');
            });
            new TutorialButton(this, 1600, 50, () => {
                this.scene.run('TutorialScene', {backScene: 'NavigationScene', guided: false});
                this.scene.stop('PauseScene');
            });
            new DeckBuilderButton(this, 1780, 50, NavigationScene.instance.player, () => {
                this.scene.run('DeckBuilderScene', {parent: 'NavigationScene', player: NavigationScene.instance.player, newCards: DeckBuilderButton.newCards});
                this.scene.stop('PauseScene');
            });
        }
    }
}