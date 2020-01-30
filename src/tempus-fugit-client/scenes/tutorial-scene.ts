import { TutorialWindow } from "../objects/tutorial-objects/tutorial-window";

export class TutorialScene extends Phaser.Scene {

    private preloaded:boolean = false;

    public tutWindow:TutorialWindow;    
    public backScene:string;

    constructor() {
        super({
            key:"TutorialScene"
        });
    }

    public preload() {
        if (this.preloaded) return;


    }

    public create(data?) {
        this.tutWindow = new TutorialWindow(this, data.guided);
        this.backScene = data.backScene;
        this.scene.pause(this.backScene);

        this.tutWindow.on("destroy", () => {
            this.scene.run(this.backScene);
            this.scene.stop("TutorialScene");
        }, this);
    }
}