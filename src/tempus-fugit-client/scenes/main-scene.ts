import { CardGUI } from "../objects/game-gui-objects/card-gui";
import { BoardGUI } from "../objects/game-gui-objects/board-gui";
import { StackGUI } from "../objects/game-gui-objects/stack-gui";
import { Card } from "../objects/game-objects/card";
import { HandGUI } from "../objects/game-gui-objects/hand-gui";
import { Hand } from "../objects/game-objects/hand";
import { DeckGUI } from "../objects/game-gui-objects/deck-gui";
import { Deck } from "../objects/game-objects/deck";
import { TableGUI } from "../objects/game-gui-objects/table-gui";
import {EnemyGUI} from "../objects/game-gui-objects/enemy-gui";
import {PlayerGUI} from "../objects/game-gui-objects/player-gui";
import {Enemy} from "../objects/game-objects/enemy";
import {Player} from "../objects/game-objects/player";


export class MainScene extends Phaser.Scene {
  private board: BoardGUI;

  constructor() {
    super({
      key: "MainScene"
    });
  }

  preload(): void {
    this.load.pack("preload", "assets/pack.json", "preload");
  }

  create(): void {

    /*

    // tests; to be replaced by game phases issue
    let table = new TableGUI(this, 3);
    //table.setEnergie(4);

    // stack test
    let stack = new StackGUI(this, "stack");
    //stack.addCardGUI(c);

    // hand test
    let hand = new Hand(5);
    let cards = [];
    hand.addCard(new Card(), 1);
    for (let i = 0; i < 5; i++) cards.push(new Card());
    hand.setCards(cards);
    this.board = new BoardGUI(this, stack);
    let handGui = new HandGUI(this, hand, stack, this.board);


    handGui.moveToStack(cards[0]);
    handGui.moveToBoard(cards[2]);
    handGui.addCard(new Card());
    handGui.moveToBoard(cards[3]);
    handGui.fadeOut();
    handGui.fadeIn();

    // board test
    board.clear();
    let c1 = new CardGUI(this, 500, 500, 'card1', new Card());
    this.board.addCardGUI(c1);
    this.board.moveToStack(c1);
     */


    // deck test
    let deck = new DeckGUI(this, "deck", new Deck());



    this.configureCardEvents();
  }

  private configureCardEvents(): void {
    // enable dragging of objects
    this.input.on("drag", function(
      pointer: Phaser.Input.Pointer,
      gameObject: Phaser.GameObjects.Sprite,
      dragX: number,
      dragY: number
    ) {
      gameObject.setDepth(10);
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    // return to original position when drag is done
    this.input.on(
      "dragend",
      function(
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.Sprite
      ) {
        if (gameObject instanceof CardGUI) {
          gameObject.setDepth(1);
          gameObject.x = gameObject.cardOriginX;
          gameObject.y = gameObject.cardOriginY;

          // play card if dragged to upper half of screen
          if (pointer.upY < window.innerHeight / 2) {
            this.board.addCardGUI(gameObject);
          }
        }
      },
      this
    );
  }
  update(): void {}
}
