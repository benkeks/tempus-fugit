import { Deck } from "./deck";

export class DeckGUI extends Phaser.GameObjects.Sprite {
  private deck: Deck;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    deck: Deck
  ) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    this.deck = deck;
    this.scene = scene;
  }
}
