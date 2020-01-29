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
        this.newCardsGui = new NewCardsViewer(this);
        this.newCardsGui.flush(data.loot);

        this.newCardsGui.on("destroy", function() {
            this.scene.run("NavigationScene");
            this.scene.stop("NewCardScene");
        }, this);
    }

}