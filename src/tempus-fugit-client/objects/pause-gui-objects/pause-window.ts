//@ts-nocheck //ts is very annoying with rexUI

// Colors
import { HelpButton } from "../help-gui-objects/help-button";
import { PauseButton } from "./pause-button";
import { MissionScene } from "../../scenes/mission-scene";
import { RIGHT } from "phaser";

const GUI_BORDER = 0x37474F;
const GUI_BORDER_HIGHLIGHT = 0xECEFF1;
const GUI_TITLE = 0xeceff1;
const GUI_FILL = 0x90A4AE;
const GUI_FILL_DARK = 0x607d8b;
const GUI_LABEL_BG = 0xcfd8dc;
// const GUI_TEXT = 0x010101;
const GUI_TEXT = 0xffffff;
const GUI_CLOSE = 0xdd6666;

// Format constants
const PAUSE_HEIGHT = 100;
const PAUSE_WIDTH = 500;
const BORDER_WIDTH = 3;
const TITLE_SPACER = '    ';


export class PauseWindow {
    static pauseQuit: boolean = false;

    private window;
    private scene: Phaser.Scene;
    private isMissionScene: boolean;
    private instanceCounter: number = 0;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public createPauseWindow(isMissionScene: boolean) {
        if (this.instanceCounter > 0) return;
        this.instanceCounter += 1;
        let scene = this.scene;
        this.isMissionScene = isMissionScene;

        let title = this.createLabel(scene, TITLE_SPACER + 'Paused', GUI_TITLE).setDraggable();
        let toolbar = [this.createLabel(scene, 'X', GUI_CLOSE, 0)];

        let pause = scene.rexUI.add.dialog({
            x: 1920 / 2,
            y: 1080 / 2,
            width: PAUSE_WIDTH,
            height: PAUSE_HEIGHT,
            background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, GUI_FILL).setStrokeStyle(BORDER_WIDTH, 0),
            title: scene.add.existing(title),
            toolbar: scene.add.existing(toolbar),
            choices: [
                this.createLabel(scene, 'Retry', isMissionScene ? GUI_LABEL_BG : GUI_FILL_DARK),
                this.createLabel(scene, 'Return to Map', isMissionScene ? GUI_LABEL_BG : GUI_FILL_DARK),
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
                bottom: 20,
                right: 20,
                left: 20,
                title: 20,
                choice: 10
            }
        })
            .layout()
            .popUp(200);

        pause.on('button.click', function (button, groupName, index) {
            function quit() {
                PauseWindow.pauseQuit = true;
                scene.scene.stop(PauseButton.currPauseParent);
                scene.scene.start('StartingScene');
            }

            function retry() {
                scene.scene.stop(PauseButton.currPauseParent);
                scene.scene.start('MissionScene', MissionScene.latestData);
            }

            function navigation() {
                scene.scene.stop(PauseButton.currPauseParent);
                scene.scene.start('NavigationScene');
            }

            let indexToFn = [retry, navigation, quit];

            switch (groupName) {
                case 'toolbar':
                    this.instanceCounter -= 1;
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
            button.getElement('background').setStrokeStyle(BORDER_WIDTH, groupname === 'toolbar' ? 0x000000 : GUI_BORDER);
        }, this);

        this.window = pause;
    }

    public createLabel(scene, text, color, borderColor = GUI_BORDER, txtColor = GUI_TEXT) {
        return scene.rexUI.add.label({
            background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, text === 'X' ? 23 : 10, color).setStrokeStyle(BORDER_WIDTH, borderColor).setDepth(50),
            text: scene.add.text(0, 0, text, {
                fontSize: '16px',
                fontFamily: 'pressStart',
                color: txtColor,
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