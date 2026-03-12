import {PauseWindow} from "../objects/pause-gui-objects/pause-window";
import {PauseButton} from "../objects/pause-gui-objects/pause-button";

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
        this.pauseWindow = new PauseWindow(this);
        this.pauseWindow.createPauseWindow(PauseButton.currPauseParent === 'MissionScene');
        this.scene.pause(PauseButton.currPauseParent);

        // this.events.on('wake', function () {
            
        //     this.scene.pause(PauseButton.currPauseParent);
        //     this.pauseWindow.createPauseWindow(PauseButton.currPauseParent === 'MissionScene');
        // }, this);
    }
}