//@ts-nocheck //ts is very annoying with rexUI

// Colors
import {HelpButton} from "../help-gui-objects/help-button";

const GUI_BORDER = 0x37474F;
const GUI_BORDER_HIGHLIGHT = 0xECEFF1;
const GUI_TAB = 0xfafafa;
const GUI_TAB_SELECTED = 0x455a64;
const GUI_FILL_LIGHT = 0xfafafa;
const GUI_FILL = 0x90A4AE;
const GUI_FILL_DARK = 0x607d8b;
const GUI_SLIDER = 0x455a64;
const GUI_LABEL_BG = 0xeceff1;
const GUI_TEXT_AREA = 0xb0bec5;
const GUI_TEXT_AREA_BORDER = 0xcfd8dc;
const GUI_TEXT_AREA_TEXT = 0xffffff;
const GUI_TEXT = 0x010101;
const GUI_CLOSE = 0xdd6666;

// Format constants
const PAUSE_HEIGHT = 500;
const PAUSE_WIDTH = 500;
const BORDER_WIDTH = 3;


export class PauseWindow {
    private window;
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public createPauseWindow() {
        let scene = this.scene;

        let title = this.createLabel(scene, 'Pause', GUI_LABEL_BG);
        let toolbar = [this.createLabel(scene, 23, 'X', GUI_CLOSE)];

        this.window = scene.rexUI.add.dialog({
            x: 1920 / 2,
            y: 1080 / 2,
            width: PAUSE_WIDTH,
            height: PAUSE_HEIGHT,
            background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, GUI_FILL).setStrokeStyle(BORDER_WIDTH, GUI_BORDER),
            title: scene.add.existing(title),
            toolbar: scene.add.existing(toolbar),
            choices: [
                this.createLabel(scene, 'Retry', GUI_LABEL_BG),
                this.createLabel(scene, 'Return to Navigation', GUI_LABEL_BG),
                this.createLabel(scene, 'Quit', GUI_LABEL_BG),
            ],
            align: {
                title: 'center',
                toolbar: 'right'
            },
            expand: {
                title: false
            }
        })
            .layout()
            .popUp(300);
        
        this.window.on('button.click', function (button, groupName, index) {
            function quit() {
                scene.scene.start('StartingScene');
            }
            function retry() {
                scene.scene.start('MissionScene');
            }
            function navigation() {
                scene.scene.start('NavigationScene');
            }

            let indexToFn = [quit, retry, navigation];

            switch (groupName) {
                case 'toolbar':
                    this.window.scaleDownDestroy(300);
                    setTimeout(() => {
                        // scene.scene.run(HelpButton.currHelpParent); //TODO EQUIVALENT
                        // scene.scene.sleep('HelpScene');
                    }, 300);
                    break;
                case 'choices':
                    indexToFn[index]();
                    break;
            }
        }, this).on('button.over', function highlightBorder() {
            button.getElement('background').setStrokeStyle(BORDER_WIDTH, GUI_BORDER_HIGHLIGHT);
        }).on('button.out', function restoreBorder() {
            button.getElement('background').setStrokeStyle(BORDER_WIDTH, GUI_BORDER);
        })
    }

    public createLabel(scene, text, color) {
        return scene.rexUI.add.label({
            background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, color).setStrokeStyle(BORDER_WIDTH).setDepth(50),
            text: scene.add.text(0, 0, text, {
                fontSize: '24px',
                color: GUI_TEXT
            }),
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        })
    }
}