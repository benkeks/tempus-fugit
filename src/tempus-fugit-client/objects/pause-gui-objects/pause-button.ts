// GUI Colors
const GUI_BORDER = 0x37474F;
const GUI_BORDER_HIGHLIGHT = 0xECEFF1;
const GUI_FILL_LIGHT = 0xfafafa;
const GUI_FILL = 0x90A4AE;
const GUI_FILL_DARK = 0x607d8b;
const GUI_LABEL_BG = 0xeceff1;
const GUI_TEXT = 0x010101;


export class PauseButton {
    private scene: Phaser.Scene;
    private button;
    static currPauseParent: string;

    constructor(scene: Phaser.Scene, isMissionScene: boolean) {
        this.scene = scene;
        // TODO change position
        //@ts-ignore
        this.button = scene.rexUI.add.label({
            x: isMissionScene ? 1800 : 1800,
            y: isMissionScene ? 50 : 250,
            width: 50,
            height: 50,
            //@ts-ignore
            background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, GUI_FILL).setStrokeStyle(3, GUI_BORDER),
            icon: scene.add.sprite(0, 0, 'pause').setScale(3),
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
            }
        }).layout();

        this.button.setInteractive();
        this.button.on('pointerdown', this.displayPause, this);
        this.button.on('pointerover', () => {
            this.button.getElement('background').setStrokeStyle(3, GUI_BORDER_HIGHLIGHT);
        });
        this.button.on('pointerout', () => {
            this.button.getElement('background').setStrokeStyle(3, GUI_BORDER);
        })

    }

    public displayPause(): void {
        let s = this.scene.scene;
        s.run('PauseScene');
        PauseButton.currPauseParent = s.key;
    }
}