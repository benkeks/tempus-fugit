import { CardGUI } from "./card-gui";
import { StackGUI } from "./stack-gui";
import { BoardGUI } from "./board-gui";
import { Card } from "./card";
import { Hand } from "./hand";

export class HandGUI extends Phaser.GameObjects.Group {
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
    this.replaceHand(hand);
    this.setOutlines();
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
  addCard(card: Card): void {
    if (this.cardGUIs.length < this.maxCards) {
      //reposition other cards on deck to remove any gaps on the board
      for (let i in this.cardGUIs) {
        let cardGUI = this.cardGUIs[i];
        cardGUI.setPosition(parseInt(i) * 200 + 550, 850);
        cardGUI.cardOriginX = parseInt(i) * 200 + 550;
        cardGUI.cardOriginY = 850;
      }

      // add card to hand, enable dragging
      let cardGUI = new CardGUI(
        this.scene,
        this.cardGUIs.length * 200 + 550,
        850,
        "card",
        card
      );
      this.add(cardGUI, true);
      cardGUI.setInteractive();
      cardGUI.enableDragging();
      this.cardGUIs.push(cardGUI);
    }
  }

  /**
   * replaces current hand
   * @param hand
   */
  replaceHand(hand: Hand) {
    // delete previous hand
    for (let c of this.cardGUIs) {
      this.stack.addCardGUI(c);
      this.remove(c);
    }
    this.cardGUIs = [];

    // create new hand
    this.hand = hand;
    let i = 0;
    for (let c of hand.getCards()) {
      if (i >= this.maxCards) break;
      let cardGUI = new CardGUI(
        this.scene,
        i++ * 200 + 550,
        850,
        "card", // TODO: change default texture "card" to ( texture saved in card object ? )
        c
      );
      this.add(cardGUI, true);
      cardGUI.setInteractive();
      cardGUI.enableDragging();
      this.cardGUIs.push(cardGUI);
    }
  }

  /**
   * moves a card to stack
   * @param card
   */
  moveToStack(card: Card) {
    for (let i in this.cardGUIs) {
      if (this.cardGUIs[i].card == card) {
        let c = this.cardGUIs[i];
        this.stack.addCardGUI(c);
        this.cardGUIs.splice(parseInt(i), 1);
        this.remove(c);
      }
    }
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
}
