import { CardGUI } from "./card-gui";
import { StackGUI } from "./stack-gui";
import { BoardGUI } from "./board-gui";
import { Card } from "../game-objects/card";
import { Hand, HandListener } from "../game-objects/hand";

/**
 * @author Mustafa
 */
export class HandGUI extends Phaser.GameObjects.Group implements HandListener {
  private hand: Hand; // hand object associated with handGUI object
  private cardGUIs: CardGUI[] = []; // a list of cardGUI objects on the hand
  private readonly stack: StackGUI;
  private readonly board: BoardGUI;
  private readonly maxCards: number = 5;

  constructor(
    scene: Phaser.Scene,
    hand: Hand,
    stack: StackGUI,
    board: BoardGUI
  ) {
    super(scene);
    this.board = board;
    this.stack = stack;
    this.setOutlines();
    this.hand = hand;

    this.hand.listener.push(this);
  }

  /**
   * sets card outline, (white border to show where cards are positioned in hand)
   */
  private setOutlines(): void {
    let i = 0;
    while (i < this.maxCards) {
      this.scene.add.image(i++ * 200 + 550, 850, "card-outline").setDepth(-1);
    }
  }

  /**
   * adds one card to hand if there is enough space for it
   * @param card to be added
   */
  addCard(card: Card, pos: number): void {
      // add card to hand, enable dragging
      let cardGUI = new CardGUI(
        this.scene,
        pos * 200 + 550,
        850,
        card
      );
      this.add(cardGUI, true);
      cardGUI.setInteractive();
      cardGUI.enableDragging();
      this.cardGUIs.push(cardGUI);
  }

  /**
   * moves a card to stack
   * @param pos: position of cardGUI to remove
   */
  moveToStack(pos: number): void {
    let c = this.cardGUIs[pos];
    this.stack.addCardGUI(c);
    this.cardGUIs.splice(pos, 1);
    this.remove(c);
  }

  /**
   * tints all cardGUI objects in hand black and disables dragging
   */
  fadeOut() {
    for (let c of this.cardGUIs) {
      c.fadeOut();
      c.disableDragging();
    }
  }

  /**
   * removes the tint from all cardGUI objects and enables dragging
   */
  fadeIn() {
    for (let c of this.cardGUIs) {
      c.fadeIn();
      c.enableDragging();
    }
  }

  /**
   * moves a card to board
   * @param card
   */
  moveToBoard(card: Card) {
    for (let i in this.cardGUIs) {
      if (this.cardGUIs[i].card == card) {
        let c = this.cardGUIs[i];
        this.board.addCardGUI(c);
        this.cardGUIs.splice(parseInt(i), 1);
      }
    }
  }

  /**
   * deletes card at pos if @card = null, else adds card to position
   * @param pos: position of card
   * @param card: card to delete / add
   */
  handChanged(pos: number, card: Card): void {
    if (card) {
      this.addCard(card, pos);
    } else {
      this.moveToStack(pos);
    }
  }
}
