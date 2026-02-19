import { Card } from "../game-objects/card";
import { FormulaGUI } from "./formula-gui";

export class DiscardCard extends Phaser.GameObjects.Container {

    private cardImage: Phaser.GameObjects.Image;
    public card: Card;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        card: Card
    ) {
        super(scene, x, y);
        scene.add.existing(this);
        this.scene = scene;
        this.createCard(card);
        this.card = card;
        this
            .setInteractive()
            .on('pointerover', function () {
                this.cardImage.setTint(0xff0000);
            }, this)
            .on('pointerout', function () {
                this.cardImage.clearTint();
            }, this);
    }

    /**
    * make container for a card
    * similar to card-gui.ts
    */
    private createCard(card: Card): void {
        // outline and background
        let width = 160;
        let height = 260;
        let rectBackgroundColor = 0x999999;
        let rectOutlineColor = 0xe5e5e5;
        let font1: Object = { fontSize: '24px', fontFamily: 'pressStart', color: '#000000' }
        let font2: Object = { fontSize: '24px', fontFamily: 'pressStart', color: '#000000' }
        this.setSize(width, height);

        // outline
        let graphics = this.scene.add.graphics();
        graphics.lineStyle(8, rectOutlineColor, 1);
        let outline = graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
        this.add(outline);
        this.sendToBack(outline);

        // background
        graphics.fillStyle(rectBackgroundColor, 1);
        let roundRect = graphics.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
        this.add(roundRect);
        this.sendToBack(roundRect);

        // first line
        let lineColor = rectOutlineColor;
        let formulaLine1 = this.scene.add.line(0, 0, 0, 50 - height / 2, width, 50 - height / 2, lineColor, 1);
        formulaLine1.setLineWidth(2);
        this.add(formulaLine1);
        formulaLine1.setOrigin(0, 0);
        formulaLine1.setPosition(-(width / 2), 0);

        // second horizontal line
        let formulaLine2 = this.scene.add.line(0, 0, 0, 80 - height / 2, width, 80 - height / 2, lineColor, 1);
        formulaLine2.setLineWidth(2);
        this.add(formulaLine2);
        formulaLine2.setOrigin(0, 0);
        formulaLine2.setPosition(-(width / 2), 0);

        // third horizontal line
        let formulaLine3 = this.scene.add.line(0, 0, 0, 200 - height / 2, width, 200 - height / 2, lineColor, 1);
        formulaLine3.setLineWidth(2);
        this.add(formulaLine3);
        formulaLine3.setOrigin(0, 0);
        formulaLine3.setPosition(-(width / 2), 0);


        // texts
        let padding = 5;
        let maxTextWidth = width;

        // card title
        let title = this.scene.add.text(0, 0, card.getName(), font1);
        title.setLineSpacing(5);
        title.setScale(0.6);
        this.add(title);
        title.style.setWordWrapWidth(maxTextWidth + 100, true);
        title.setOrigin(0.5, 0);
        title.setPosition(0, padding - height / 2);

        // formula text
        let string = card.getFormula().generateRepresentation(true, true);
        let margin = 2;
        let formulaGUI;
        if (string.length > 8) {
            formulaGUI = new FormulaGUI(this.scene, string, 0, 0, 0, false).setScale(0.8);
            this.add(formulaGUI);
            formulaGUI.setPosition(-6 * string.length, padding + 48 - height / 2);
        } else {
            formulaGUI = new FormulaGUI(this.scene, string, 0, 0, margin, false);
            this.add(formulaGUI);
            formulaGUI.setPosition(-8 * string.length, padding + 48 - height / 2);
        }

        // effect text
        let effectText = this.scene.add.text(0, 0, card.getDescription(), font2);
        this.add(effectText);
        effectText.setScale(0.6);
        effectText.setLineSpacing(5);
        effectText.style.setWordWrapWidth(maxTextWidth + 100, true);
        effectText.setOrigin(0.5, 0);
        effectText.setPosition(0, padding + 200 - height / 2);
        // image
        let image = this.scene.add.image(0, 0, card.getImage());
        image.setDisplaySize(140, 120)
        this.add(image);
        image.setOrigin(0.5, 0);
        image.setPosition(0, 80 - height / 2);
        this.cardImage = image;

        // resize texts if too big
        while (effectText.height > 90)
            effectText.setFontSize(Number(String(effectText.style.fontSize).substring(0, 2)) - 1)

        while (title.height > 75)
            title.setFontSize(Number(String(title.style.fontSize).substring(0, 2)) - 1)
    }

}