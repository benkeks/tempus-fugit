import { MonologWindow } from "../objects/game-objects/monolog-gui-objects/monolog-window";

export class MonologScene extends Phaser.Scene {
    private monologWindow: MonologWindow;

    constructor() {
        super({
            key: 'MonologScene'
        });
    }

    preload() {
    }

    create(data: { monolog: string, gameOver: boolean }) {

        // if bocking textbox scene is active, pause this scene and go back 

        this.monologWindow = new MonologWindow(this);
        this.monologWindow.createMonologWindow(data.monolog, data.gameOver);
        this.scene.pause('MissionScene');

        this.events.on('wake', function () {
            this.scene.pause('MissionScene');
            this.monologWindow = new MonologWindow(this);
            this.monologWindow.createMonologWindow(data.monolog);
        }, this);

        if (this.scene.isActive("BTextBoxScene")) {
            this.scene.bringToTop("MonologScene");
            this.scene.pause("BTextBoxScene");
        }
    }
}