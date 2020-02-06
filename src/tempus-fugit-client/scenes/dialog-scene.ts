import { Scene } from "phaser";
import { DescritptionDialog } from "../objects/navigation-scene-objects/description-dialog";

export class DialogScene extends Scene {
    public window;
    public parentScene: string;

    constructor() {
        super({
            key: 'DialogScene'
        });
    }

    preload() {
    }

    create(data) {
        this.sys.canvas.style.cursor = "default";
        this.parentScene = data.parent;
        this.window = new DescritptionDialog(this, data.description, data.buttons, data.title);

        this.scene.pause(this.parentScene);
        if (data.scene) data.scene.activeDialog = this.window;
        this.scene.bringToTop(this.scene.key);

        this.window.dialog.on("destroy", function() {
            if (this.window.returnToScene) this.scene.resume(this.parentScene);
            this.scene.stop(this.scene.key);
        },this)
    }
}