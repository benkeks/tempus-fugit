import { CardGUI } from "./card-gui";
import { StackGUI } from "./stack-gui";

export class BoardGUI {
  private cardGUIs: CardGUI[] = []; // a list of cardGUI objects on the board
  private readonly stack: StackGUI;
  private readonly scene: Phaser.Scene;
  private cardGUIPosX: number = 950; // position of cardGUI object on the board
  private cardGUIPosY: number = 550;

  constructor(scene: Phaser.Scene, stack: StackGUI) {
    this.scene = scene;
    this.stack = stack;
  }

  /**
   * adds cardGUI object to the board, the object will not be tinted or draggable
   * @param cardGUI
   */
  addCardGUI(cardGUI: CardGUI): void {
    cardGUI.setPosition(this.cardGUIPosX, this.cardGUIPosY);
    this.cardGUIPosX += 20;
    this.cardGUIs.push(cardGUI);
    cardGUI.fadeIn();
    cardGUI.disableDragging();
  }

  /**
   * moves all cardGUI objects on the board to the stack
   */
  clear(): void {
    for (let cardGUI of this.cardGUIs) {
      this.stack.addCardGUI(cardGUI);
    }
    this.cardGUIs = [];
  }
}
