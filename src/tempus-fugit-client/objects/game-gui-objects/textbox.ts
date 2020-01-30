import { StoryDialog } from "../../mechanics/story-dialog";
import { Hand } from "../game-objects/hand";
import { HandGUI } from "./hand-gui";
import { throwStatement } from "@babel/types";
import { Mission } from "../../mechanics/mission";
import { GameInfo } from "../../game";
import { NBTextbox } from "./nonblocking-textbox";

/**
 * @author Mustafa
 */


/** 
 * for now only displays "name: text", without icon
 */
export class Textbox {

    private typeSpeed = 50;
    private boxWidth = 660;
    private scene: Phaser.Scene;
    private nextPageIcon = 'nextPage';
    private handGUI: HandGUI;
    private mission: Mission;
    private nonBlockingTextBox: NBTextbox;

    /**
     * Manager for textboxed.
     * .
     * @param scene: scene in which textbox appears
     * @param nextPageIcon: left arrow icon, should be ~ 32x32 pixels
     * @param typeSpeed: typing speed in ms
     * @param boxWidth: fixed width of textbox.
     */
    constructor(scene: Phaser.Scene, handGUI: HandGUI, mission: Mission) {
        this.scene = scene;
        this.handGUI = handGUI;
        this.mission = mission;
    }


    /**
     * adds a story dialog to textbox queue
     * @param dialog 
     */
    public addStoryDialog(dialog: StoryDialog, blocking: boolean = false) {

        if (blocking) {


        } else {
            if (!this.nonBlockingTextBox) this.nonBlockingTextBox = new NBTextbox(this.scene, this.handGUI, this.mission, this.nextPageIcon, this.typeSpeed, this.boxWidth);

            this.nonBlockingTextBox.addStoryDialog(dialog);
        }
    }
}

