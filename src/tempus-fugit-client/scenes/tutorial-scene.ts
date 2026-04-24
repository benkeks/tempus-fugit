import { TutorialWindow } from "../objects/tutorial-objects/tutorial-window";
import { SoundButton } from "../objects/sound-button";
import { PauseButton } from "../objects/pause-gui-objects/pause-button";
import { HelpButton } from "../objects/help-gui-objects/help-button";
import { DeckBuilderButton } from "../objects/navigation-scene-objects/deck-builder-button";
import { TutorialButton } from "../objects/tutorial-objects/tutorial-button";
import { NavigationScene } from "./navigation-scene";

export class TutorialScene extends Phaser.Scene {

    private preloaded:boolean = false;

    public tutWindow:TutorialWindow;
    public backScene:string;
    private closing: boolean = false;

    constructor() {
        super({
            key:"TutorialScene"
        });
    }

    public preload() {
        if (this.preloaded) return;

        this.load.image("tutorialSlide1", "assets/tutorial/slide1.png");
        this.load.image("tutorialSlide2", "assets/tutorial/slide2.png");
        this.load.image("tutorialSlide3", "assets/tutorial/slide3.png");

    }

    public create(data?) {
        this.closing = false;
        this.sys.canvas.style.cursor = "default";
        this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.5);
        this.tutWindow = new TutorialWindow(this, data.guided);
        this.backScene = data.backScene;
        this.scene.pause(this.backScene);

        this.tutWindow.on("destroy", () => {
            if (!this.closing) this.scene.run(this.backScene);
            this.scene.stop("TutorialScene");
        }, this);

        if (this.backScene === 'NavigationScene') {
            new SoundButton(this, 1690, 50);
            new PauseButton(this, false, () => {
                this.closing = true;
                this.scene.resume(this.backScene);
                PauseButton.currPauseParent = this.backScene;
                this.scene.run('PauseScene');
                this.scene.stop('TutorialScene');
            });
            new TutorialButton(this, 1600, 50, () => {
                this.closing = true;
                this.scene.resume(this.backScene);
                this.scene.stop('TutorialScene');
            });
            new HelpButton(this, false, () => {
                this.closing = true;
                HelpButton.currHelpParent = this.backScene;
                this.scene.run('HelpScene');
                this.scene.stop('TutorialScene');
            });
            new DeckBuilderButton(this, 1780, 50, NavigationScene.instance.player, () => {
                this.closing = true;
                this.scene.run('DeckBuilderScene', {parent: this.backScene, player: NavigationScene.instance.player, newCards: DeckBuilderButton.newCards});
                this.scene.stop('TutorialScene');
            });
        }
    }
}
