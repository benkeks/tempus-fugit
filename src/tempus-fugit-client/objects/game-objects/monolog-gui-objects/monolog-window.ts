import { GameInfo } from "../../../game";

const BACKGROUND_COLOR = 0X000000;

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
        fontFamily: "pressStart"
    };
    private displayAll = false;
    private typing = true;
    private done = false;
    private skipcont!: Phaser.GameObjects.Text;
    private gameOver!: boolean;
    private holdStartTimer: ReturnType<typeof setTimeout> | undefined;
    private holdRepeatTimer: ReturnType<typeof setInterval> | undefined;

    public clicks:number = 0;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
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

        this.skipcont = this.scene.add.text(GameInfo.width - 150, GameInfo.height - 100, text, this.fontStyle);
        this.skipcont.setOrigin(1,1)
            .setInteractive({useHandCursor:true})
            .on('pointerdown', () => {
                this.stopPointerHold();
                this.switchToMissionScene();
            }).on('pointerover', () => {
            // color red
            this.skipcont.setTint(0xff0000);
        }).on('pointerout', () => {
            // color white
            this.skipcont.clearTint();
        })

        //.setOrigin(1, 0);

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
                if (!this.gameOver) this.skipcont.text = "Continue";
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
        if (this.scene.scene.isPaused("BTextBoxScene")) {
            this.scene.scene.resume("BTextBoxScene");
        } else {
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
                if (!self.gameOver) self.skipcont.text = "Continue";
                self.typing = false;
                setTimeout(() => pipeAnim(), self.interval)
            }
        }


        showText('', displayString.split(''), 0);
    }

}
