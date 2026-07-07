import { GameInfo } from "../../../game";

const BACKGROUND_COLOR = 0x002040;
const BUTTON_BG = 0x666666;
const BUTTON_BORDER = 0x000000;
const BUTTON_BORDER_HOVER = 0xffffff;
const BUTTON_BORDER_WIDTH = 3;

export class MonologWindow {
    private scene: Phaser.Scene;
    private instanceCounter: number = 0;
    private text!: Phaser.GameObjects.Text;
    private wrapWidth = 1000;
    private height = GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 50) - this.wrapWidth / 2;
    private width = GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 30);
    private interval = 100;
    private blinkIntervall = 400;
    private blinkCount = 20;
    private fontStyle = {
        fontSize: GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 1.5),
        fontFamily: "pressStart",
        color: "#FFFFFF"
    };
    private displayAll = false;
    private typing = true;
    private done = false;
    private skipcont;
    private gameOver!: boolean;
    private holdStartTimer: ReturnType<typeof setTimeout> | undefined;
    private holdRepeatTimer: ReturnType<typeof setInterval> | undefined;
    private skipButtonX = GameInfo.width - 150;
    private skipButtonY = GameInfo.height - 100;

    public clicks:number = 0;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    private setSkipButtonState(label: string = ""): void {
        if (!this.skipcont) return;

        const textObject = this.skipcont.getElement('text');
        const background = this.skipcont.getElement('background');
        const hasText = label.trim().length > 0;
        textObject.setText(hasText ? label : "");
        textObject.setColor("#FFFFFF");
        this.skipcont.layout();
        this.skipcont.setPosition(
            this.skipButtonX - this.skipcont.width / 2,
            this.skipButtonY - this.skipcont.height / 2
        );
        this.skipcont.setVisible(hasText);

        if (hasText) {
            this.skipcont.setInteractive({ useHandCursor: true });
            background.setStrokeStyle(BUTTON_BORDER_WIDTH, BUTTON_BORDER);
        } else {
            this.skipcont.disableInteractive();
        }
    }

    public createMonologWindow(monolog: string, gameOver: boolean) {

        if (this.instanceCounter > 0) return;
        this.instanceCounter += 1;
        this.gameOver = gameOver;

        // create black background
        this.scene.cameras.add(0, 0, GameInfo.width, GameInfo.height).setBackgroundColor(BACKGROUND_COLOR);

        // monolog text
        this.text = this.scene.add.text(this.height, this.width, '', this.fontStyle);
        this.text.setWordWrapWidth(this.wrapWidth);
        this.text.setAlign('center');
        this.text.setLineSpacing(20);
        this.displayMonologue(monolog);

        // full-screen interactive area used to emulate keyboard hold on touch/mouse devices
        const holdArea = this.scene.add.zone(0, 0, GameInfo.width, GameInfo.height).setOrigin(0).setInteractive();
        holdArea.on('pointerdown', () => {
            this.startPointerHold();
        });
        holdArea.on('pointerup', () => {
            this.stopPointerHold();
        });
        holdArea.on('pointerout', () => {
            this.stopPointerHold();
        });
        this.scene.input.on('pointerup', this.stopPointerHold, this);
        this.scene.events.once('shutdown', () => {
            this.stopPointerHold();
            this.scene.input.off('pointerup', this.stopPointerHold, this);
        });

        // skip button
        let text = "Skip";
        if (gameOver) text = "Return to Map"

        //@ts-ignore
        const skipButtonBackground = this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, BUTTON_BG, 0.75)
            .setStrokeStyle(BUTTON_BORDER_WIDTH, BUTTON_BORDER);
        const skipText = this.scene.add.text(0, 0, text, this.fontStyle);
        skipText.setDepth(skipButtonBackground.depth + 1);
        //@ts-ignore
        this.skipcont = this.scene.rexUI.add.label({
            x: this.skipButtonX,
            y: this.skipButtonY,
            background: skipButtonBackground,
            text: skipText,
            space: {
                left: 16,
                right: 16,
                top: 10,
                bottom: 10
            }
        }).layout();

        this.skipcont
            .on('pointerdown', () => {
                this.stopPointerHold();
                this.switchToMissionScene();
            }).on('pointerover', () => {
            this.skipcont.getElement('background').setStrokeStyle(BUTTON_BORDER_WIDTH, BUTTON_BORDER_HOVER);
        }).on('pointerout', () => {
            this.skipcont.getElement('background').setStrokeStyle(BUTTON_BORDER_WIDTH, BUTTON_BORDER);
        })

        this.setSkipButtonState();
        
        // space key events
        this.scene.input.keyboard?.on("keydown", e => {
            if (e.key != " ") return;
            this.advanceMonologInput();
        }, this);

    }

    private advanceMonologInput(): void {
        if (!this.typing) this.clicks = 2;

        switch (this.clicks) {
            // faster pace if dialog is being typed
            case 0:
                this.interval = 25;
                this.clicks++;
                break;

            // display all remaining text on next step
            case 1:
                this.displayAll = true;
                this.clicks++;
                break;

            default:
                break;
        }
    }

    private startPointerHold(): void {
        this.stopPointerHold();
        this.advanceMonologInput();

        this.holdStartTimer = setTimeout(() => {
            this.holdRepeatTimer = setInterval(() => {
                this.advanceMonologInput();
            }, 120);
        }, 220);
    }

    private stopPointerHold(): void {
        if (this.holdStartTimer) {
            clearTimeout(this.holdStartTimer);
            this.holdStartTimer = undefined;
        }

        if (this.holdRepeatTimer) {
            clearInterval(this.holdRepeatTimer);
            this.holdRepeatTimer = undefined;
        }
    }

    private switchToMissionScene(): void {
        this.done = true;
        this.stopPointerHold();
        this.setSkipButtonState();
        if (this.scene.scene.isPaused("BTextBoxScene")) {
            this.scene.scene.resume("BTextBoxScene");
        } else {
            const missionScene: any = this.scene.scene.get('MissionScene');
            if (missionScene && missionScene.tfgame) {
                missionScene.tfgame.setPaused(false);
            }
            this.scene.scene.resume('MissionScene');
        }
        this.scene.scene.stop('MonologScene');
    }

    /**
     * shows the monolog letter by letter
     * adds animation for cursor so it seems like someone is typing
     * @param displayString
     */
    displayMonologue(displayString: string): void {

        let self = this;
        let tmp = this.blinkCount;

        // pipe animation
        let pipeAnim = function () {
            if (self.done) return;

            if (self.blinkCount == 0) {
                self.blinkCount = tmp;
                self.text.destroy();
                self.switchToMissionScene();
                return;
            }

            self.blinkCount--;
            if (self.text.text[self.text.text.length - 1] == '.') {
                self.text.setText(displayString + '|')
                setTimeout(() => pipeAnim(), self.blinkIntervall)
            } else {
                self.text.setText(displayString + '.')
                setTimeout(() => pipeAnim(), self.blinkIntervall)
            }
        }

        // print letter
        let showText = function (displayedText: string, message: string[], index: number) {
            if (self.done) return;

            if (index < message.length && !self.displayAll) {
                self.text.setText(displayedText + message[index++] + '|');
                setTimeout(() => showText(displayedText + message[index - 1], message, index), self.interval);
            } else {
                self.setSkipButtonState(self.gameOver ? "Return to Map" : "Continue");
                self.typing = false;
                setTimeout(() => pipeAnim(), self.interval)
            }
        }


        showText('', displayString.split(''), 0);
    }

}
