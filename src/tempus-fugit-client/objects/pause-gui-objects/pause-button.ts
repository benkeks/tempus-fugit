// GUI Colors
const GUI_BORDER = 0x37474F;
const GUI_BORDER_HIGHLIGHT = 0xECEFF1;
const GUI_FILL = 0x90A4AE;

export class PauseButton {
    private scene: Phaser.Scene;
    private button;
    static currPauseParent: string;

    constructor(scene: Phaser.Scene, isMissionScene: boolean, action?: () => void) {
        this.scene = scene;
        //@ts-ignore
        this.button = scene.rexUI.add.label({
            x: isMissionScene ? 1870 : 1870,
            y: isMissionScene ? 310 : 50,
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

        this.button.setInteractive({useHandCursor:true});
        if (action) {
            this.button.on('pointerdown', action);
        } else {
            this.button.on('pointerdown', this.displayPause, this);
        }
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