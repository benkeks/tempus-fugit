import { CardGUI } from "../objects/game-gui-objects/card-gui";
import { BoardGUI } from "../objects/game-gui-objects/board-gui";
import { StackGUI } from "../objects/game-gui-objects/stack-gui";
import { Card } from "../objects/game-objects/card";
import { HandGUI } from "../objects/game-gui-objects/hand-gui";
import { Hand } from "../objects/game-objects/hand";
import { DeckGUI } from "../objects/game-gui-objects/deck-gui";
import { Deck } from "../objects/game-objects/deck";
import { TableGUI } from "../objects/game-gui-objects/table-gui";
import { EnemyGUI } from "../objects/game-gui-objects/enemy-gui";
import { PlayerGUI } from "../objects/game-gui-objects/player-gui";
import { Enemy } from "../objects/game-objects/enemy";
import { Player } from "../objects/game-objects/player";
import { GameState } from "../objects/game-objects/game-state";
import { Formula } from "../temporal-logic/formula";

export class MainScene extends Phaser.Scene {
  private playerGUI: PlayerGUI;
  private gameState: GameState;
  private enemy: Enemy;

  constructor() {
    super({
      key: "MainScene"
    });
  }

  preload(): void {
    this.load.pack("preload", "assets/pack.json", "preload");
  }

  create(): void {
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

          const card: Card = gameObject.card;
          const enemy: Enemy = this.enemy;

          // TODO: set up collision between cards and enemies attack
          // position of enemy hardcoded here
          if (pointer.upY >= 1400 && pointer.upX >= 400) {
            console.log('player attacked enemy with card');
            for (let listener of this.playerGUI.listener) {
              listener.attackEnemy(card, enemy, this.gameState);
            }
          }
        }
      },
      this
    );
  }
  update(): void {}
}
