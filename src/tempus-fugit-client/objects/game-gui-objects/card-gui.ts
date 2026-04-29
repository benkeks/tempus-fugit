import { Card } from "../game-objects/card";
import Text = Phaser.GameObjects.Text;
import Rectangle = Phaser.GameObjects.Rectangle;
import Line = Phaser.GameObjects.Line;
import Tween = Phaser.Tweens.Tween;
import { buildCardVisual } from "./card-visual-builder";

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

    public static readonly DEFAULT_WIDTH = 160;
    public static readonly DEFAULT_HEIGHT = 260;

    public fadeTween;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        card: Card,
        width: number = CardGUI.DEFAULT_WIDTH,
        height: number = CardGUI.DEFAULT_HEIGHT
    ) {
        super(scene, x, y);
        scene.add.existing(this);
        this._cardOriginX = x;
        this._cardOriginY = y;
        this._card = card;
        this.scene = scene;

        this.createCard(card, width, height);
        this.setInteractive();
    }

    /**
     * make container for a card
     * similar to list-gui.ts
     */
    private createCard(card: Card, width: number, height: number): void {
        const visual = buildCardVisual(this, card, width, height);
        this.cardImage = visual.image;

        //cross
        this.cross = this.scene.add.sprite(this.originX, this.originY, "cross").setScale(3, 3).setAlpha(0.4).setDepth(this.cardOriginZ + 1);
        this.add(this.cross);
        this.setPlayable();
    }


    /**
       * makes card bigger
       * don't call hover method of cardGUI objects; user this moethod implemented in handGUI
       */
    public hover(): void {
        if (!this.active || !this.scene || !this.scene.tweens) return;
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
        if (!this.active || !this.scene || !this.scene.tweens) return;
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
        //console.log(this.card.getDescription());
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

    public fadeInAnimation(duration = 200) {
        if (this.fadeTween) this.fadeTween.stop();

        this.setAlpha(0);
        this.fadeTween = this.scene.add.tween({ // fade out
            targets: this,
            alpha: 1,
            ease: "Linear",
            duration: duration,
            repeat: 0,
            yoyo: false
        });
        this.setVisible(true);
    }
    public fadeOutAnimation(duration = 200) {
        if (this.fadeTween) this.fadeTween.stop();

        this.setAlpha(1);
        this.fadeTween = this.scene.add.tween({ // fade out
            targets: this,
            alpha: 0,
            ease: "Linear",
            duration: duration,
            repeat: 0,
            yoyo: false,
            onComplete: function () {
                this.setVisible(false)
            },
            callbackScope: this
        });
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
