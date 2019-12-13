import { Card } from "../objects/game-objects/card";
import {Enemy} from "../objects/game-objects/enemy";
import {CardGUI} from "../objects/game-gui-objects/card-gui";
import {PlayerGUI} from "../objects/game-gui-objects/player-gui";
import {TechDemoGame} from "../mechanics/tech-demo-game";
import {BoardGUI} from "../objects/game-gui-objects/board-gui";
import {TableGUI} from "../objects/game-gui-objects/table-gui";
import {HandGUI} from "../objects/game-gui-objects/hand-gui";
import {DeckGUI} from "../objects/game-gui-objects/deck-gui";
import {StackGUI} from "../objects/game-gui-objects/stack-gui";
import {EnemyGuiLayout} from "../objects/game-gui-objects/enemy-gui-layout";
import {Mission, GameStateListener} from "../mechanics/mission";
import {StoryDialog} from "../mechanics/story-dialog";
import {CharacterGui} from "../objects/game-gui-objects/character-gui";
import {FontUtils} from "../objects/game-gui-objects/font-utils";
import {EnemyGUI} from "../objects/game-gui-objects/enemy-gui";
import {DecisionArrow} from "../objects/game-gui-objects/decision-arrow";
import Rectangle = Phaser.GameObjects.Rectangle;
import {GameInfo} from "../game";


export class MainScene extends Phaser.Scene implements GameStateListener {
  private playerGUI: PlayerGUI;
  private gameStateGUI: TableGUI;
  private handGUI:HandGUI;
  private deckGUI:DeckGUI;
  private enemyGUI:EnemyGuiLayout;
  private stackGUI:StackGUI;
  private boardGUI:BoardGUI;
  private phaseText: Phaser.GameObjects.Text;

  private tfgame:Mission;

  constructor() {
    super({
      key: "MainScene"
    });
  }

  preload(): void {
    this.load.pack("preload", "assets/pack.json", "preload");

    // TODO: implement multiatlas version
    this.load.spritesheet('slime1',
        'assets/sprites/enemies/slime1/slime1-Sheet.png',
        { frameWidth: 64, frameHeight: 64 });

    /*this.load.atlas('slime1',
        'assets/sprites/enemies/slime1/slime1-Sheet.png',
        "assets/sprites/enemies/slime1/slime1-sheet.json");*/
  }

  create(): void {
    //FontUtils.addSpriteIntoFont(this.game, "Arial", "swordFont", 0x2694);
    //FontUtils.addSpriteIntoFont(this.game, "Arial", "heartFont", 0x2764);

    this.tfgame = new TechDemoGame();
    this.tfgame.listener.push(this);

    let t1:string[][] = [["1", "we dont like u!"], ["0", "me neither"], ["1", "ok lets fight!"]];
    let storyDialog:StoryDialog = new StoryDialog(t1);
    storyDialog.triggerFunction = function (game:Mission) {return game.getTurnCount() >= 0};
    let t2:string[][] = [["1", "you are stronger than expected!"]];
    let s2:StoryDialog = new StoryDialog(t2);
    s2.triggerFunction = function (game:Mission) {return game.enemys[0][0].currentHP <=2};
    this.tfgame.dialogs.push(s2);
    this.tfgame.dialogs.push(storyDialog);

    this.stackGUI = new StackGUI(this, "stack");
    this.boardGUI = new BoardGUI(this, this.stackGUI);

    this.deckGUI = new DeckGUI(this, "deck", this.tfgame.deck);
    this.handGUI = new HandGUI(this, this.tfgame.player.hand, this.stackGUI, this.boardGUI);
    this.gameStateGUI = new TableGUI(this, this.tfgame);

    this.playerGUI = new PlayerGUI(this, "player", this.tfgame.player);
    this.playerGUI.listener.push(this.tfgame.player);

    this.enemyGUI = new EnemyGuiLayout(this, this.tfgame.getEnemies());

    this.phaseText = this.add.text(100,100,"Draw Phase");

    this.tfgame.startCombat();
      this.tfgame.player.takeCard(this.tfgame.deck);

      this.handGUI.fadeOut();

    this.arrow = new DecisionArrow(this);
  }

  public arrow:DecisionArrow;
  update(time: number, delta: number): void {
    this.arrow.update(time, delta);
  }

  drawPhase(game: Mission) {
    this.phaseText.setText("Draw Phase");
      this.handGUI.fadeOut();
    console.log("drawPhase");
    game.nextPhase();
  }

  effectPhase(game: Mission): void {
    console.log("effect Phase");
      this.handGUI.fadeOut();
    this.phaseText.setText("Effect Phase");
  }

  enemyPhase(game: Mission): void {
    console.log("enemyPhase");
      this.handGUI.fadeOut();
    this.phaseText.setText("Enemy Phase");
  }

  energyPhase(game: Mission): void {
    console.log("energy Phase");
      this.handGUI.fadeOut();
    this.phaseText.setText("Energy Phase");
  }

  playPhase(game: Mission): void {
    console.log("play Phase");
    this.handGUI.fadeIn();
    this.phaseText.setText("Play Phase");
  }

  storyDialog(game: Mission, dialog: StoryDialog): void {


  }

  gameover(game: Mission): void {
  }

  storyMonolog(game: Mission, monolog: string): void {
  }

  waveChanged(game: Mission, activeWave: number, enemies: Enemy[]): void {
    this.enemyGUI.setEnemies(enemies);
  }
}
