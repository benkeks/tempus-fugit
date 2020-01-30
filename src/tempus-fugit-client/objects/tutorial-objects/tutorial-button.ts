// GUI Colors
const GUI_BORDER = 0x37474F;
const GUI_BORDER_HIGHLIGHT = 0xECEFF1;
const GUI_FILL = 0x90A4AE;

export class TutorialButton {
    private scene: Phaser.Scene;
    private button;
    public static pauseParent:string;

    constructor(scene: Phaser.Scene, x:number, y:number) {
        this.scene = scene;
        //@ts-ignore
        this.button = scene.rexUI.add.label({
            x: x,
            y: y,
            width: 50,
            height: 50,
            //@ts-ignore
            background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, GUI_FILL).setStrokeStyle(3, GUI_BORDER),
            icon: scene.add.sprite(0, 0, 'questionMark').setScale(3),
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
            }
        }).layout();

        this.button.setInteractive();
        this.button.on('pointerdown', this.displayTutorial, this);
        this.button.on('pointerover', () => {
            this.button.getElement('background').setStrokeStyle(3, GUI_BORDER_HIGHLIGHT);
        });
        this.button.on('pointerout', () => {
            this.button.getElement('background').setStrokeStyle(3, GUI_BORDER);
        })
    }

    public displayTutorial(): void {
        let s = this.scene.scene;
        TutorialButton.pauseParent = s.key;
        s.run('TutorialScene', {backScene:s.key, guided:true});
    }
}