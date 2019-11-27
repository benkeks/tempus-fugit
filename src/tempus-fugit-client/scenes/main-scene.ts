import { Card } from "../objects/game-objects/card";
import {Enemy} from "../objects/game-objects/enemy";
import {CardGUI} from "../objects/game-gui-objects/card-gui";
import {PlayerGUI} from "../objects/game-gui-objects/player-gui";
import {TechDemoGame} from "../mechanics/tech-demo-game";
import {BoardGUI} from "../objects/game-gui-objects/board-gui";
import {TableGUI} from "../objects/game-gui-objects/table-gui";
import {HandGUI} from "../objects/game-gui-objects/hand-gui";
import {DeckGUI} from "../objects/game-gui-objects/deck-gui";
import {EnemyGUI} from "../objects/game-gui-objects/enemy-gui";
import {StackGUI} from "../objects/game-gui-objects/stack-gui";
import {Game, GameStateListener} from "../mechanics/game";


export class MainScene extends Phaser.Scene implements GameStateListener {
  private playerGUI: PlayerGUI;
  private gameStateGUI: TableGUI;
  private handGUI:HandGUI;
  private deckGUI:DeckGUI;
  private enemyGUIs:EnemyGUI[];
  private stackGUI:StackGUI;
  private boardGUI:BoardGUI;

  private enemys: Enemy[];

  private tfgame:Game;

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

    this.tfgame = new TechDemoGame();
    this.tfgame.listener.push(this);

    this.stackGUI = new StackGUI(this, "stack");
    this.boardGUI = new BoardGUI(this, this.stackGUI);

    this.deckGUI = new DeckGUI(this, "deck", this.tfgame.deck);
    this.handGUI = new HandGUI(this, this.tfgame.hand, this.stackGUI, this.boardGUI);
    this.gameStateGUI = new TableGUI(this, this.tfgame);

    this.handGUI.fadeOut();

    this.enemyGUIs = [];
    for (let e of this.tfgame.enemys) {
      this.enemyGUIs.push(new EnemyGUI(this, "enemy", e));
    }

    this.tfgame.startCombat();
    this.tfgame.nextPhase();
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

  drawPhase(game: Game): void {
    console.log("drawPhase");
  }

  effectPhase(game: Game): void {
    console.log("effect Phase");
  }

  enemyPhase(game: Game): void {
    console.log("enemyPhase");
  }

  energyPhase(game: Game): void {
    console.log("energy Phase");
  }

  playPhase(game: Game): void {
    console.log("play Phase");
  }
}
