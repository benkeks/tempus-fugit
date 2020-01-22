import {HelpScene} from "../../scenes/help-scene";
import {makeLogger} from "ts-loader/dist/logger";

export class HelpButton {
    private scene: Phaser.Scene;
    private sprite: Phaser.GameObjects.Sprite;
    static currHelpParent: string;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.sprite = this.scene.add.sprite(1800, 400, 'stand');
        this.sprite.setInteractive();
        this.sprite.on('pointerdown', this.displayHelp, this);
    }

    public displayHelp(): void {
        let s = this.scene.scene;


        // let isActive = s.isActive('HelpScene');
        // if (!isActive)
            s.run('HelpScene', {key: s.key});
        HelpButton.currHelpParent = s.key;
    }


}