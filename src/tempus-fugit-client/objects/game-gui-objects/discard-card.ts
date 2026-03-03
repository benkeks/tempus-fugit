import { Card } from "../game-objects/card";
import { buildCardVisual } from "./card-visual-builder";

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
        let width = 160;
        let height = 260;
        const visual = buildCardVisual(this, card, width, height);
        this.cardImage = visual.image;
    }

}