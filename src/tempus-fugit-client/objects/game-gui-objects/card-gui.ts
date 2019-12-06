import { Card } from "../game-objects/card";

/**
 * @author Mustafa
 */
export class CardGUI extends Phaser.GameObjects.Sprite {
  private _cardOriginX: number; //initial x-position of cardGUI object, for dragging
  private _cardOriginY: number; //initial y-position of cardGUI object, for dragging
  private readonly _card: Card; // card object associated with cardGUI object

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


  set cardOriginX(value: number) {
    this._cardOriginX = value;
  }

  set cardOriginY(value: number) {
    this._cardOriginY = value;
  }
}
