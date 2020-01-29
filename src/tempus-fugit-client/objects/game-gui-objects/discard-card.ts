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
        let font1: Object = { fontSize: '18px', fontFamily: 'pressStart', color: '#000000' }
        let font2: Object = { fontSize: '12px', fontFamily: 'pressStart', color: '#000000' }
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

        // first horizontal line
        let lineColor = rectOutlineColor;
        let formulaLine1 = this.scene.add.line(0, 0, 0, 80 - height / 2, width, 80 - height / 2, lineColor, 1);
        formulaLine1.setLineWidth(2);
        this.add(formulaLine1);
        formulaLine1.setOrigin(0, 0);
        formulaLine1.setPosition(-(width / 2), 0);

        // second horizontal line
        let formulaLine2 = this.scene.add.line(0, 0, 0, 200 - height / 2, width, 200 - height / 2, lineColor, 1);
        formulaLine2.setLineWidth(2);
        this.add(formulaLine2);
        formulaLine2.setOrigin(0, 0);
        formulaLine2.setPosition(-(width / 2), 0);


        // texts
        let padding = 10;
        let maxTextWidth = width - 4 * padding;

        // card title
        let title = this.scene.add.text(0, 0, card.getName(), font1);
        this.add(title);
        title.style.setWordWrapWidth(maxTextWidth, true);
        title.setOrigin(0.5, 0);
        title.setPosition(0, padding - height / 2);


        // formula text
        let string = card.getFormula().generateRepresentation(true, true);
        let margin = 2;
        let formulaGUI = new FormulaGUI(this.scene, string, 0, 0, margin, false);
        this.add(formulaGUI);
        formulaGUI.setPosition(-8 * string.length, padding + 40 - height / 2);

        // effect text
        let effektText = this.scene.add.text(0, 0, card.getDescription(), font2);
        this.add(effektText);
        effektText.style.setWordWrapWidth(maxTextWidth, true);
        effektText.setOrigin(0.5, 0);
        effektText.setPosition(0, padding + 200 - height / 2);

        // image
        let image = this.scene.add.image(0, 0, card.getImage());
        image.setDisplaySize(140, 120)
        this.add(image);
        image.setOrigin(0.5, 0);
        image.setPosition(0, 80 - height / 2);
        this.cardImage = image;
    }

}