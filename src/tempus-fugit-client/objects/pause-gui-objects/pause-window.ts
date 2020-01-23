//@ts-nocheck //ts is very annoying with rexUI

// Colors
import {HelpButton} from "../help-gui-objects/help-button";
import {PauseButton} from "./pause-button";

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
const PAUSE_HEIGHT = 100;
const PAUSE_WIDTH = 500;
const BORDER_WIDTH = 3;
const TITLE_SPACER = '     ';


export class PauseWindow {
    private window;
    private scene: Phaser.Scene;
    private isMissionScene: boolean;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public createPauseWindow(isMissionScene: boolean) {
        let scene = this.scene;
        this.isMissionScene = isMissionScene;

        let title = this.createLabel(scene, TITLE_SPACER + 'Paused', GUI_LABEL_BG).setDraggable();
        let toolbar = [this.createLabel(scene, 'X', GUI_CLOSE)];

        let pause = scene.rexUI.add.dialog({
            x: 1920 / 2,
            y: 1080 / 2,
            width: PAUSE_WIDTH,
            height: PAUSE_HEIGHT,
            background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, GUI_FILL).setStrokeStyle(BORDER_WIDTH, GUI_BORDER),
            title: scene.add.existing(title),
            toolbar: scene.add.existing(toolbar),
            choices: [
                this.createLabel(scene, 'Retry', isMissionScene ? GUI_LABEL_BG : GUI_FILL_DARK),
                this.createLabel(scene, 'Return to Navigation', isMissionScene ? GUI_LABEL_BG : GUI_FILL_DARK),
                this.createLabel(scene, 'Quit', GUI_LABEL_BG),
            ],
            align: {
                title: 'center',
                toolbar: 'right'
            },
            space: {
                titleLeft: 105,
                titleRight: 70,
                top: 10,
                bottom: 10,
                right: 20,
                left: 20,
                title: 20,
                choice: 10
            }
        })
            .layout()
            .popUp(300);

        pause.on('button.click', function (button, groupName, index) {
            function quit() {
                scene.scene.stop(PauseButton.currPauseParent);
                scene.scene.start('StartingScene');
            }

            function retry() {
                console.log('retry');
                // TODO figure out how mission scene works
                // scene.scene.start('MissionScene', {
                //     key: scene.missionKeys[0],
                //     // index: i,
                //     player: scene.player.copy(),
                //     deck: scene.deck.copy()
                // });
            }

            function navigation() {
                console.log('back to navigation');
                scene.scene.sleep(PauseButton.currPauseParent);
                scene.scene.run('NavigationScene');
            }

            let indexToFn = [retry, navigation, quit];

            switch (groupName) {
                case 'toolbar':
                    this.window.scaleDownDestroy(300);
                    setTimeout(() => {
                        scene.scene.run(PauseButton.currPauseParent);
                        scene.scene.sleep('PauseScene');
                    }, 300);
                    break;
                case 'choices':
                    if (!this.isMissionScene && (index === 0 || index === 1)) return; // disable first two buttons on navigation scene
                    scene.scene.run(PauseButton.currPauseParent);
                    indexToFn[index]();
                    break;
            }
        }, this).on('button.over', function highlightBorder(button, groupname, index) {
            if (!this.isMissionScene && groupname === 'choices' && (index === 0 || index === 1)) return; // disable first two buttons on navigation scene
            button.getElement('background').setStrokeStyle(BORDER_WIDTH, GUI_BORDER_HIGHLIGHT);
        }, this).on('button.out', function restoreBorder(button, groupname, index) {
            if (!this.isMissionScene && groupname === 'choices' && (index === 0 || index === 1)) return; // disable first two buttons on navigation scene
            button.getElement('background').setStrokeStyle(BORDER_WIDTH, GUI_BORDER);
        }, this);

        this.window = pause;
    }

    public createLabel(scene, text, color) {
        return scene.rexUI.add.label({
            background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, text === 'X' ? 23 : 10, color).setStrokeStyle(BORDER_WIDTH).setDepth(50),
            text: scene.add.text(0, 0, text, {
                fontSize: '24px',
                color: GUI_TEXT
            }).setDepth(51),
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        })
    }
}