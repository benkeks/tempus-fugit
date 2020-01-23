import {PauseWindow} from "../objects/pause-gui-objects/pause-window";

export class PauseScene extends Phaser.Scene {
    private pauseWindow: PauseWindow;

    constructor() {
        super({
            key: 'PauseScene'
        })
    }

    create() {
        this.pauseWindow = new PauseWindow(this);
        this.pauseWindow.createPauseWindow();
        // TODO PAUSE BUTTON CURRENT SCENE
        this.scene.pause();
        this.events.on('wake', function () {
            this.scene.pause();
            this.pauseWindow.createPauseWindow();
        }, this)
    }
}