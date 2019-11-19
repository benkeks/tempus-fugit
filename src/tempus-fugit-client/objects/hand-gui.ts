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
      this.scene.add.image(i++ * 250 + 750, 1100, "card-outline").setDepth(-1);
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
        i++ * 250 + 750,
        1100,
        "card" + i, // TODO: change default texture "card" to ( texture saved in card object ? )
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
