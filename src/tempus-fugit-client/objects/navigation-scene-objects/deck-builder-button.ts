import { Player } from "../game-objects/player";

// GUI Colors
const GUI_BORDER = 0x37474F;
const GUI_BORDER_HIGHLIGHT = 0xECEFF1;
const GUI_FILL = 0x90A4AE;

export class DeckBuilderButton {
    private scene: Phaser.Scene;
    private button;
    public static pauseParent:string;
    public player:Player;

    constructor(scene: Phaser.Scene, x:number, y:number, player:Player) {
        this.scene = scene;
        this.player = player;
        //@ts-ignore
        this.button = scene.rexUI.add.label({
            x: x,
            y: y,
            width: 50,
            height: 50,
            //@ts-ignore
            background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, GUI_FILL).setStrokeStyle(3, GUI_BORDER),
            icon: scene.add.sprite(0, 0, 'deck_builder').setScale(3),
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
            }
        }).layout();

        this.button.setInteractive({useHandCursor:true});
        this.button.on('pointerdown', this.click, this);
        this.button.on('pointerover', () => {
            this.button.getElement('background').setStrokeStyle(3, GUI_BORDER_HIGHLIGHT);
        });
        this.button.on('pointerout', () => {
            this.button.getElement('background').setStrokeStyle(3, GUI_BORDER);
        })
    }

    public click(): void {
        this.scene.scene.run('DeckBuilderScene', {parent:this.scene.scene.key, player:this.player});
    }
}