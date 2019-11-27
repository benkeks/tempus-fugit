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
  private phaseText: Phaser.GameObjects.Text;

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


    this.playerGUI = new PlayerGUI(this, "player", this.tfgame.player);
    this.playerGUI.listener.push(this.tfgame.player);

    this.enemyGUIs = [];
    for (let e of this.tfgame.enemys) {
      this.enemyGUIs.push(new EnemyGUI(this, "enemy", e));
    }

    this.phaseText = this.add.text(100,100,"Draw Phase");

    this.tfgame.startCombat();
      this.tfgame.player.takeCard(this.tfgame.deck);

      this.handGUI.fadeOut();
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
          const card: Card = gameObject.card;
          const enemy: Enemy = this.enemyGUIs[0].enemy;
          // TODO: set up collision between cards and enemies attack
          // position of enemy hardcoded here
          if (pointer.upY >= 300 && pointer.upX >= 1200) {
            for (let listener of this.playerGUI.listener)
              listener.attackEnemy(card, enemy, this.tfgame.gameState);
              this.handGUI.moveToStack(this.handGUI.getCardGUIIndex(gameObject));
              console.log('player attacked enemy with card');
          } else {
            console.log('nothing happend. dropped at' + pointer.upX + " -- " + pointer.upY);
            gameObject.x = gameObject.cardOriginX;
            gameObject.y = gameObject.cardOriginY;
          }
        }
      },
      this
    );
  }
  update(): void {}

  drawPhase(game: Game): void {

    this.phaseText.setText("Draw Phase");
      this.handGUI.fadeOut();
    console.log("drawPhase");
    game.nextPhase();
  }

  effectPhase(game: Game): void {
    console.log("effect Phase");
      this.handGUI.fadeOut();
    this.phaseText.setText("Effect Phase");
  }

  enemyPhase(game: Game): void {
    console.log("enemyPhase");
      this.handGUI.fadeOut();
    this.phaseText.setText("Enemy Phase");
  }

  energyPhase(game: Game): void {
    console.log("energy Phase");
      this.handGUI.fadeOut();
    this.phaseText.setText("Energy Phase");
  }

  playPhase(game: Game): void {
    console.log("play Phase");
    this.handGUI.fadeIn();
    this.phaseText.setText("Play Phase");
  }
}
