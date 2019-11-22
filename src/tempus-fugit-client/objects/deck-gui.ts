import { Deck } from "./deck";

export class DeckGUI extends Phaser.GameObjects.Sprite {
  private deck: Deck;

  constructor(
    scene: Phaser.Scene,
    texture: string,
    deck: Deck,
    x: number = 1700,
    y: number = 835
  ) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    this.deck = deck;
    this.scene = scene;
  }
}
