import { Scene } from "phaser";
import { NewCardsViewer } from "../objects/navigation-scene-objects/new-cards-viewer";

export class NewCardsScene extends Scene {

    public newCardsGui:NewCardsViewer;

    constructor () {
        super({
            key:"NewCardScene"
        });
    }

    create(data?) {
        this.scene.pause("NavigationScene")
        this.newCardsGui = new NewCardsViewer(this, data.final);
        this.newCardsGui.flush(data.loot);

        this.newCardsGui.on("destroy", function() {
            this.scene.resume("NavigationScene");
            this.scene.stop("NewCardScene");
        }, this);
    }

}