import { StoryDialog } from "../mechanics/story-dialog";
import { HandGUI } from "../objects/game-gui-objects/hand-gui";
import { Mission } from "../mechanics/mission";
import { BTextBox } from "../objects/game-gui-objects/blocking-textbox";

/**
 * @author Mustafa
 */


/** 
 * for now only displays "name: text", without icon
 */
export class BTextBoxScene extends Phaser.Scene {

    private blockingTextBox: BTextBox;

    constructor() {
        super({
            key: 'BTextBoxScene'
        });
    }

    preload() {
    }

    create(data: { dialog: StoryDialog, handGUI: HandGUI, mission: Mission }) {
        this.blockingTextBox = new BTextBox(this, data.handGUI, data.mission);
        this.blockingTextBox.addStoryDialog(data.dialog);
        this.scene.pause('MissionScene');

        // this.events.on('wake', function () {
        //     this.scene.pause('MissionScene');
        //     this.blockingTextBox = new BTextBox(this, data.handGUI, data.mission);
        //     this.blockingTextBox.addStoryDialog(data.dialog);
        // }, this);

        if (this.scene.isActive("MonologScene")) {
            this.scene.bringToTop("MonologScene");
            this.scene.pause("BTextBoxScene");
        }
    }
}

