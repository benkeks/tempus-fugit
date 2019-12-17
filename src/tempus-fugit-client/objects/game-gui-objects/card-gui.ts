import { Card } from "../game-objects/card";
import Tween = Phaser.Tweens.Tween;

/**
 * @author Mustafa
 */
export class CardGUI extends Phaser.GameObjects.Sprite {
    private _cardOriginX: number = 0; //initial x-position of cardGUI object, for dragging
    private _cardOriginY: number = 0; //initial y-position of cardGUI object, for dragging
    private _cardOriginAngle: number = 0; // initiall angle of cardGUI object, for hovering effect
    // private _cardOriginDepth: number; // initiall depth of cardGUI object, for hovering effect
    private _hovering: boolean = false;
    private readonly _card: Card; // card object associated with cardGUI object
    public hoverTween: Phaser.Tweens.Tween;
    public unhoverTween: Phaser.Tweens.Tween;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        card: Card
    ) {
        super(scene, x, y, card.getImage());
        this.setInteractive();
        this._cardOriginX = x;
        this._cardOriginY = y;
        this._card = card;
    }

    /**
       * makes card bigger
       * don't call hover method of cardGUI objects; user this moethod implemented in handGUI
       */
    hover(): void {
        //this.setDepth(20);
        //this.scene.children.bringToTop(this);
        // this.setDepth(1000)
        //this.depth = -20
        // console.log(this.depth)
        // this.setDepth(20);
        // console.log(this.depth)
        this.hoverTween = this.scene.tweens.add({
            targets: this,
            y: this.cardOriginY - 300,
            angle: 0,
            ease: 'power2',
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 800,
        });
        this.hovering = true;
    }

    /**
     * resets card to original size 
     * don't call unhover method of cardGUI objects; user this moethod implemented in handGUI
     */
    unhover(): void {
        //this.setDepth(0); 
        // this.setDepth(1)

        this.unhoverTween = this.scene.tweens.add({
            targets: this,
            y: this.cardOriginY,
            angle: this.cardOriginAngle,
            ease: 'power2',
            scaleX: 1,
            scaleY: 1,
            duration: 400,
        });
        this.hovering = false;
        // this.setDepth(this.cardOriginDepth);
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
        this.setTint(0x575757);
    }

    /**
     * clears cardGUI tint
     */
    fadeIn(): void {
        this.clearTint();
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

    // get cardOriginDepth(): number {
    //     return this._cardOriginDepth;
    // }

    get hovering(): boolean {
        return this._hovering;
    }

    set hovering(value: boolean) {
        this._hovering = value;
    }

    // set cardOriginDepth(value: number) {
    //     this._cardOriginDepth = value;
    // }
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
