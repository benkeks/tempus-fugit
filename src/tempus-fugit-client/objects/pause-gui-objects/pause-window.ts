//@ts-nocheck //ts is very annoying with rexUI

// Colors
import { HelpButton } from "../help-gui-objects/help-button";
import { PauseButton } from "./pause-button";
import { MissionScene } from "../../scenes/mission-scene";
import { NavigationScene } from "../../scenes/navigation-scene";
import { ProgressStore } from "../../progress/progress-store";
import { DeckBuilderButton } from "../navigation-scene-objects/deck-builder-button";


const GUI_TITLE = 0xeceff1;
const GUI_BORDER = 0x5d4037;
const GUI_BORDER_HIGHLIGHT = 0xd7ccc8;
const GUI_FILL = 0xa96851;
const GUI_FILL_DARK = 0x5c4d4d;
const GUI_LABEL_BG = 0xeceff1;
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
    public activeDialog;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public createPauseWindow(isMissionScene: boolean) {
        if (this.instanceCounter > 0) return;
        this.instanceCounter += 1;
        let scene = this.scene;
        this.isMissionScene = isMissionScene;

        let title = this.createLabel(scene, TITLE_SPACER + 'Paused', GUI_TITLE).setDraggable();
        let toolbar = [this.createLabel(scene, 'X', GUI_CLOSE, 0, 'black')];

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
                this.createLabel(scene, 'Fullscreen', GUI_LABEL_BG),
                this.createLabel(scene, 'Quit', GUI_LABEL_BG),
                this.createLabel(scene, 'Start over', isMissionScene ? GUI_FILL_DARK : GUI_LABEL_BG),
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
            const grandparentScene =
                PauseButton.currPauseParent === 'BTextBoxScene' ? 'MissionScene' :
                PauseButton.currPauseParent === 'DeckBuilderScene' ? 'NavigationScene' :
                null;

            function quit() {
                NavigationScene.instance.initGame();

                PauseWindow.pauseQuit = true;
                if (grandparentScene) scene.scene.stop(grandparentScene);
                scene.scene.stop(PauseButton.currPauseParent);
                scene.scene.start('StartingScene');
            }

            function startOver() {
                scene.scene.run("DialogScene", {
                    scene: this,
                    parent: "PauseScene",
                    title: "Start Over",
                    description: "This will remove your saved progress from this browser and restart the game. Continue?",
                    buttons: [
                        ["Cancel", function() {
                            this.activeDialog.hide();
                        }, this],
                        ["Delete progress", function() {
                            this.activeDialog.returnToScene = false;
                            this.activeDialog.hide();

                            ProgressStore.clear();
                            NavigationScene.instance.initGame();
                            PauseWindow.pauseQuit = true;

                            if (grandparentScene) scene.scene.stop(grandparentScene);
                            scene.scene.stop(PauseButton.currPauseParent);
                            scene.scene.stop("PauseScene");
                            scene.scene.start("StartingScene");
                        }, this]
                    ]
                });
            }

            function retry() {
                scene.scene.stop(PauseButton.currPauseParent);
                scene.scene.start('MissionScene', MissionScene.latestData);
            }

            function navigation() {
                if (grandparentScene) scene.scene.stop(grandparentScene);
                scene.scene.stop(PauseButton.currPauseParent);
                scene.scene.start('NavigationScene', {tutorial:false});
            }

            async function lockLandscapeOnMobile() {
                const isMobile = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(navigator.userAgent);
                const orientation = screen.orientation as any;

                if (!isMobile || !orientation || typeof orientation.lock !== 'function') return;

                try {
                    await orientation.lock('landscape');
                } catch (_e) {
                    // Some mobile browsers block orientation lock even in fullscreen.
                }
            }

            function unlockOrientation() {
                const orientation = screen.orientation as any;
                if (!orientation || typeof orientation.unlock !== 'function') return;

                try {
                    orientation.unlock();
                } catch (_e) {
                    // Ignore unlock failures on browsers without full orientation control.
                }
            }

            function toggleFullscreen() {
                if (scene.scale.isFullscreen) {
                    scene.scale.stopFullscreen();
                    unlockOrientation();
                    return;
                }

                scene.scale.startFullscreen();
                void lockLandscapeOnMobile();
            }

            let indexToFn = [retry, navigation, toggleFullscreen, quit, startOver];

            switch (groupName) {
                case 'toolbar':
                    this.instanceCounter -= 1;
                    this.window.scaleDownDestroy(300);
                    setTimeout(() => {
                        scene.scene.run(PauseButton.currPauseParent);
                        scene.scene.stop('PauseScene');
                    }, 300);
                    break;
                case 'choices':
                    if (!this.isMissionScene && (index === 0 || index === 1)) return; // disable first two buttons on navigation scene
                    if (this.isMissionScene && index === 4) return; // disable start over button on mission scene

                    if (index === 2) {
                        indexToFn[index]();
                        return;
                    }

                    if (index === 4) {
                        indexToFn[index]();
                        return;
                    }

                    scene.scene.run(PauseButton.currPauseParent);
                    indexToFn[index]();
                    break;
            }
        }, this).on('button.over', function highlightBorder(button, groupname, index) {
            if (!this.isMissionScene && groupname === 'choices' && (index === 0 || index === 1)) return; // disable first two buttons on navigation scene
            if (this.isMissionScene && groupname === 'choices' && index === 3) return; // disable start over button on mission scene
            button.getElement('background').setStrokeStyle(BORDER_WIDTH, GUI_BORDER_HIGHLIGHT);
        }, this).on('button.out', function restoreBorder(button, groupname, index) {
            if (!this.isMissionScene && groupname === 'choices' && (index === 0 || index === 1)) return; // disable first two buttons on navigation scene
            if (this.isMissionScene && groupname === 'choices' && index === 4) return; // disable start over button on mission scene
            button.getElement('background').setStrokeStyle(BORDER_WIDTH, groupname === 'toolbar' ? 0x000000 : GUI_BORDER);
        }, this);

        this.window = pause;
    }

    public close(): void {
        this.instanceCounter -= 1;
        this.window.scaleDownDestroy(300);
        const scene = this.scene;
        setTimeout(() => {
            scene.scene.run(PauseButton.currPauseParent);
            scene.scene.stop('PauseScene');
        }, 300);
    }

    public createLabel(scene, text, color, borderColor = GUI_BORDER, txtColor = 'brown') {
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