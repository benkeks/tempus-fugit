import { Scene } from "phaser";
import { DescritptionDialog } from "../objects/navigation-scene-objects/description-dialog";
import { DeckBuilder } from "../objects/navigation-scene-objects/deck-builder";

export class DeckBuilderScene extends Scene {
    public window;
    public parentScene: string;

    constructor() {
        super({
            key: 'DeckBuilderScene'
        });
    }

    preload() {
    }

    create(data) {
        this.sys.canvas.style.cursor = "default";
        this.parentScene = data.parent;
        this.window = new DeckBuilder(this, data.player);
        this.scene.pause(this.parentScene);

        this.window.mainPanel.on("destroy", function() {
            this.scene.resume(this.parentScene);
            this.scene.stop("DeckBuilderScene");
        },this)
    }
}