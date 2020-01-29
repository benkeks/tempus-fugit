import { Scene } from "phaser";
import { ListGUI } from "../game-gui-objects/list-gui";

export class MissionNameGui extends ListGUI {

    public scene: Scene;

    constructor(scene: Scene, x?, y?) {
        super(scene, x, y);
        this.scene = scene;
        this.setVisible(false);

        this.addText("", ListGUI.ALIGN_CENTRE, { fontSize: '30px', fontFamily: 'pressStart', color: '#FFFFFF' });
    }

    public fadeInText(text: string): void {
        this.fadeIn();
        this.setText(0, text);
    }
}