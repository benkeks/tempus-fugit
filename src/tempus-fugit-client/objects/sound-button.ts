import { Sound } from "phaser";
import { MusicScene } from "../scenes/music-scene";

// GUI Colors
const GUI_BORDER = 0x37474F;
const GUI_BORDER_HIGHLIGHT = 0xECEFF1;
const GUI_FILL = 0x90A4AE;

export class SoundButton {
    private scene: Phaser.Scene;
    private button;
    public static pauseParent:string;
    public cross;

    constructor(scene: Phaser.Scene, x:number, y:number) {
        this.scene = scene;

        let width:number = 50;
        let height:number = width;
        //@ts-ignore
        this.button = scene.rexUI.add.label({
            x: x,
            y: y,
            width: width,
            height: height,
            //@ts-ignore
            background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, GUI_FILL).setStrokeStyle(3, GUI_BORDER),
            icon: this.scene.add.sprite(0, 0, 'volume').setScale(3),
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
            }
        }).layout();

        this.cross = this.scene.add.sprite(x,y, "cross").setScale(1.5);
        this.cross.setOrigin(0.5);
        this.cross.setVisible(MusicScene.instance.muted);

        this.button.setInteractive({useHandCursor:true});
        this.button.on('pointerdown', this.click, this);
        this.button.on('pointerover', () => {
            this.button.getElement('background').setStrokeStyle(3, GUI_BORDER_HIGHLIGHT);
        });
        this.button.on('pointerout', () => {
            this.button.getElement('background').setStrokeStyle(3, GUI_BORDER);
        })
    }

    public createIcon() {
        let icon = this.scene.add.sprite(0, 0, 'questionMark').setScale(3)
        return this.scene.add.container(0,0, [icon, this.cross]);
    }

    public click(): void {
        MusicScene.instance.muted = !MusicScene.instance.muted;

        this.cross.setVisible(MusicScene.instance.muted);
    }
}