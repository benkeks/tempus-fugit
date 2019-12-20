import { StoryDialog } from "../../mechanics/story-dialog";

/**
 * @author Mustafa
 */


/** 
 * for now only displays "name: text", without icon
 */
export class Textbox {
    private COLOR_PRIMARY = 0x002800;
    private COLOR_LIGHT = 0x7b5e57;
    private GetValue = Phaser.Utils.Objects.GetValue;
    private storyDialogQueue: StoryDialog[] = [];
    private readonly boxWidth: number;
    private typeSpeed: number;
    private scene: Phaser.Scene;

    /**
     * Create a new textbox that appears on the right side of the screen.
     * 
     * The text box has a fixed width, but extends vertically depending on the length of the strings to be displayed,
     * with maximum of three lines being shown at once.Pressing the space space key or clicking the textbox with the
     * mouse displayes the rest of an unfinished string or a new string from the content array.
     * @param scene: scene in which textbox appears
     * @param nextPageIcon: left arrow icon, should be ~ 32x32 pixels
     * @param typeSpeed: typing speed in ms
     * @param boxWidth: fixed width of textbox.
     */
    constructor(scene: Phaser.Scene, nextPageIcon: string = 'nextPage', typeSpeed: number = 50, boxWidth: number = 500) {
        this.typeSpeed = typeSpeed;
        this.boxWidth = boxWidth;
        this.scene = scene;
    }


    /**
     * adds a story dialog to textbox queue
     * @param dialog 
     */
    public addStoryDialog(dialog: StoryDialog) {
        this.storyDialogQueue.push(dialog);
        this.playNextStoryDialog();
    }

    /**
     * plays next dialog in queue
     */
    private playNextStoryDialog() {
        if (this.storyDialogQueue.length == 0)
            return;

        // position is bottom right of screen
        const width = this.scene.scene.systems.game.canvas.width - 100;
        const height = this.scene.scene.systems.game.canvas.height - 415;

        // create a text box with fixed width, height depends on content
        const nextDialog = this.storyDialogQueue.shift().text;


        let content = [];
        // let icons = [];
        for (let i in nextDialog) {
            content.push(nextDialog[i][0] + ": " + nextDialog[i][1]);
            // icons.push(nextDialog[i][1]);
        }

        const firstLine = content.shift();
        // const currentIcon = icons.shift();
        const textBox = this.createTextBox(this.scene, width, height, {
            wrapWidth: this.boxWidth,
            fixedWidth: this.boxWidth,
            //fixedHeight: 65,
        }, content);
        //}, currentIcon, content, icons);

        // print first line, rest prints automatically
        textBox.start(firstLine, this.typeSpeed);

        // Display next part of dialog if SPACE BAR is pressed
        //  Emits only when the SPACE BAR is pressed down, and dispatches from the local Key object.
        //  Stops event reaching the global handler.
        const spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        spaceKey.on('down', function (key, event) {
            event.stopImmediatePropagation();
            textBox.emit('pointerdown');
        });
    }



    /**
     * writes next line to textBox
     * @param icon : icon of speaker
     * @param text : spoken text
     */
    private displayNextLine(icon: String, text: String) {

    }


    /**
     * creates a new textbox object
     */
    private createTextBox(scene: Phaser.Scene, x: number, y: number, config, content: string[]) {
        // box dimensions
        const wrapWidth = this.GetValue(config, 'wrapWidth', 0);
        const fixedWidth = this.GetValue(config, 'fixedWidth', 0);
        const fixedHeight = this.GetValue(config, 'fixedHeight', 0);

        // create textbox
        // @ts-ignore
        const textBox = scene.rexUI.add.textBox({
            x: x,
            y: y,
            // @ts-ignore
            background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 20, this.COLOR_PRIMARY)
                .setStrokeStyle(2, this.COLOR_LIGHT),
            //icon: scene.add.image(0, 0, firstIcon),
            text: this.getBBcodeText(scene, wrapWidth, fixedWidth, fixedHeight),
            action: scene.add.image(0, 0, 'nextPage').setTint(this.COLOR_LIGHT).setVisible(false),
            space: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20,
                icon: 20,
                text: 10,
            }
        })
            .setOrigin(0)
            .layout();

        // sliding animation for generating textbox
        scene.tweens.add({
            targets: textBox,
            x: '-=500',
            ease: 'Back',
            duration: 1200,
        });

        // handle events for clicking; displaying new lines from content array
        //this.setInteractionEvents(scene, textBox, content, icons);
        this.setInteractionEvents(scene, textBox, content);

        return textBox;
    }

    /**
     * handles events for displaying string in content array when use clicks with mouse / hits space key
     */
    private setInteractionEvents(scene: Phaser.Scene, textBox, content: string[]) {
        let removeTextBox = false;
        let showNewLine = false;

        // handle events
        textBox
            .setInteractive()
            .on('pointerdown', function () {

                // make textbox disappear to right side and delete it when last text is displayed
                if (removeTextBox) {
                    // sliding animation for deleting textbox
                    scene.tweens.add({
                        targets: textBox,
                        x: '+=1000',
                        ease: 'Power2',
                        duration: 1200,
                        onComplete: () => { textBox.destroy(); }
                    });
                    this.playNextStoryDialog();
                    return;
                }

                // display new line / full line
                // let icon = textBox.getElement('action').setVisible(false);
                // textBox.resetChildVisibleState(icon);

                //let nextIcon = icons.shift();
                // change speaker icon
                // const img = scene.add.image(0, 0, nextIcon);
                // img.setScale(32, 32);
                // textBox.getElement('icon').set(img);

                if (showNewLine) {
                    const newLine = content.shift();
                    textBox.start(newLine);
                    showNewLine = false;
                } else {
                    if (textBox.isTyping) {
                        textBox.stop(true);
                    } else {
                        textBox.typeNextPage();
                    }
                }

            }, this)
            .on('pageend', function () {
                //event gets triggered when one element of content array is done printing on screen

                if (this.isLastPage && content.length == 0)
                    removeTextBox = true;

                if (this.isLastPage)
                    showNewLine = true;

                let icon = this.getElement('action').setVisible(true);
                this.resetChildVisibleState(icon);
                //icon.y -= 30;
                // animation for arrow icon
                // scene.tweens.add({
                //     targets: icon,
                //     y: '+=30',
                //     ease: 'Bounce',
                //     duration: 500,
                // });

            }, textBox);
    }

    /**
     * returns a text object that gets displayed in the textbox
     */
    private getBBcodeText(scene: Phaser.Scene, wrapWidth: number, fixedWidth: number, fixedHeight: number) {
        // @ts-ignore
        let text = scene.rexUI.add.BBCodeText(0, 0, '', {
            fixedWidth: fixedWidth,
            fixedHeight: fixedHeight,
            fontFamily: 'appleKid',

            fontSize: '20px',
            wrap: {
                mode: 'word',
                width: wrapWidth
            },
            maxLines: 3
        });
        text.lineSpacing = 10;
        return text;
    }
}

