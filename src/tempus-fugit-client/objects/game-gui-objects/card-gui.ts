import { Card } from "../game-objects/card";
import Text = Phaser.GameObjects.Text;
import Rectangle = Phaser.GameObjects.Rectangle;
import Line = Phaser.GameObjects.Line;
import Tween = Phaser.Tweens.Tween;
import { FormulaGUI } from "./formula-gui";

/**
 * @author Mustafa
 */
export class CardGUI extends Phaser.GameObjects.Container {
    private _cardOriginX: number = 0; //initial x-position of cardGUI object, for dragging
    private _cardOriginY: number = 0; //initial y-position of cardGUI object, for dragging
    private _cardOriginAngle: number = 0; // initiall angle of cardGUI object, for hovering effect
    private _cardOriginZ: number; // initiall depth of cardGUI object, for hovering effect
    private _hovering: boolean = false;
    private readonly _card: Card; // card object associated with cardGUI object
    public hoverTween: Phaser.Tweens.Tween;
    public hoverTweenCr: Phaser.Tweens.Tween;
    public unhoverTween: Phaser.Tweens.Tween;
    public cardImage: Phaser.GameObjects.Image;
    public cross: Phaser.GameObjects.Sprite;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        card: Card
    ) {
        super(scene, x, y);
        scene.add.existing(this);
        this._cardOriginX = x;
        this._cardOriginY = y;
        this._card = card;
        this.scene = scene;

        this.createCard(card);
        this.setInteractive();
    }

    /**
     * make container for a card
     * similar to list-gui.ts
     */
    private createCard(card: Card): void {
        // outline and background
        let width = 160;
        let height = 260;
        let rectBackgroundColor = 0x999999;
        let rectOutlineColor = 0xe5e5e5;
        let font1: Object = { fontSize: '18px', fontFamily: 'appleKid', color: '#000000' }
        let font2: Object = { fontSize: '12px', fontFamily: 'appleKid', color: '#000000' }
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
        let string = this.card.getFormula().generateRepresentation(true, true);
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

        //cross
        this.cross = this.scene.add.sprite(this.originX, this.originY, "cross").setScale(3, 3).setAlpha(0.4).setDepth(this.cardOriginZ + 1);
        this.add(this.cross);
        this.setPlayable();

        //disable dragging
    }


    /**
       * makes card bigger
       * don't call hover method of cardGUI objects; user this moethod implemented in handGUI
       */
    hover(): void {
        this.setDepth(999);

        this.hoverTween = this.scene.tweens.add({
            targets: this,
            y: this.cardOriginY - 100,
            angle: 0,
            ease: 'power2',
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 100,
        });
        this.hovering = true;
    }

    /**
     * resets card to original size 
     * don't call unhover method of cardGUI objects; user this moethod implemented in handGUI
     */
    unhover(): void {
        this.setDepth(this.cardOriginZ);
        this.unhoverTween = this.scene.tweens.add({
            targets: this,
            y: this.cardOriginY,
            angle: this.cardOriginAngle,
            ease: 'power2',
            scaleX: 1,
            scaleY: 1,
            duration: 100,
        });
        this.hovering = false;
    }

    /**
     * displays card information
     */
    showInfo(): void {
        console.log(this.card.getDescription());
    }

    /**
     * tints cardGUI black
     */
    fadeOut(): void {
        this.cardImage.setTint(0x333333);
    }

    /**
     * clears cardGUI tint
     */
    fadeIn(): void {
        this.cardImage.clearTint();
    }

    setPlayable(): void {
        this.scene.tweens.add({
                   targets: this.cross,
                   alpha: 0,
                   duration: 100
               });
    }

    setNonPlayable(): void {
        this.scene.tweens.add({
            targets: this.cross,
            alpha: 0.4,
            duration: 100
        });
    }

    /**
     * makes cardGUI dragabble
     */
    enableDragging(): void {
        this.scene.input.setDraggable(this);
    }

    /**
     * makes cardGUI not dragabble
     */
    disableDragging(): void {
        this.scene.input.setDraggable(this, false);
    }

    /**
     * return card object associated with cardGUI object
     */
    get card(): Card {
        return this._card;
    }

    get cardOriginX(): number {
        return this._cardOriginX;
    }

    get cardOriginY(): number {
        return this._cardOriginY;
    }

    get cardOriginAngle(): number {
        return this._cardOriginAngle;
    }

    get hovering(): boolean {
        return this._hovering;
    }

    get cardOriginZ() {
        return this._cardOriginZ;
    }

    set hovering(value: boolean) {
        this._hovering = value;
    }

    set cardOriginZ(value: number) {
        this._cardOriginZ = value;
    }

    set cardOriginAngle(value: number) {
        this._cardOriginAngle = value;
    }

    set cardOriginX(value: number) {
        this._cardOriginX = value;
    }

    set cardOriginY(value: number) {
        this._cardOriginY = value;
    }
}
