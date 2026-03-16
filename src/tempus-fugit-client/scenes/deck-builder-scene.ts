import { Scene } from "phaser";
import { DescritptionDialog } from "../objects/navigation-scene-objects/description-dialog";
import { DeckBuilder } from "../objects/navigation-scene-objects/deck-builder";
import { SoundButton } from "../objects/sound-button";
import { PauseButton } from "../objects/pause-gui-objects/pause-button";
import { TutorialButton } from "../objects/tutorial-objects/tutorial-button";
import { HelpButton } from "../objects/help-gui-objects/help-button";
import { DeckBuilderButton } from "../objects/navigation-scene-objects/deck-builder-button";

export class DeckBuilderScene extends Scene {
    public window;
    public parentScene: string;
    private closing: boolean = false;

    constructor() {
        super({
            key: 'DeckBuilderScene'
        });
    }

    preload() {
    }

    create(data) {
        this.sys.canvas.style.cursor = "default";
        this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.5);
        this.parentScene = data.parent;
        this.window = new DeckBuilder(this, data.player, data.newCards);
        this.scene.pause(this.parentScene);

        this.window.mainPanel.on("destroy", function() {
            if (!this.closing) this.scene.resume(this.parentScene);
            this.scene.stop("DeckBuilderScene");
        },this)

        new SoundButton(this, 1690, 50);
        new PauseButton(this, false, () => {
            this.closing = true;
            this.scene.resume(this.parentScene);
            PauseButton.currPauseParent = this.parentScene;
            this.scene.run('PauseScene');
            this.scene.stop('DeckBuilderScene');
        });
        new TutorialButton(this, 1600, 50, () => {
            this.closing = true;
            this.scene.run('TutorialScene', {backScene: this.parentScene, guided: false});
            this.scene.stop('DeckBuilderScene');
        });
        new HelpButton(this, false, () => {
            this.closing = true;
            HelpButton.currHelpParent = this.parentScene;
            this.scene.run('HelpScene');
            this.scene.stop('DeckBuilderScene');
        });
        new DeckBuilderButton(this, 1780, 50, data.player, () => {
            this.closing = true;
            this.scene.resume(this.parentScene);
            this.scene.stop('DeckBuilderScene');
        });
    }
}