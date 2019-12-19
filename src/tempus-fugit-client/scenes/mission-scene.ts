import { Card } from "../objects/game-objects/card";
import { Enemy } from "../objects/game-objects/enemy";
import { CardGUI } from "../objects/game-gui-objects/card-gui";
import { PlayerGUI } from "../objects/game-gui-objects/player-gui";
import {Player} from "../objects/game-objects/player";
import { TechDemoGame } from "../mechanics/tech-demo-game";
import { TableGUI } from "../objects/game-gui-objects/table-gui";
import { HandGUI } from "../objects/game-gui-objects/hand-gui";
import { DeckGUI } from "../objects/game-gui-objects/deck-gui";
import { StackGUI } from "../objects/game-gui-objects/stack-gui";
import { EnemyGuiLayout } from "../objects/game-gui-objects/enemy-gui-layout";
import { Mission, GameStateListener } from "../mechanics/mission";
import { StoryDialog } from "../mechanics/story-dialog";
import { StandGUI } from "../objects/game-gui-objects/stand-gui";
import { CardChannel } from "../objects/game-gui-objects/card-channel";
import { Textbox } from "../objects/game-gui-objects/textbox";
import { GameInfo } from "../game";

import Image = Phaser.GameObjects.Image;
import { FormulaGUI } from "../objects/game-gui-objects/formula-gui";


export class MissionScene extends Phaser.Scene implements GameStateListener {
    public playerGUI: PlayerGUI;
    public gameStateGUI: TableGUI;
    public handGUI: HandGUI;
    public deckGUI: DeckGUI;
    public enemyGUI: EnemyGuiLayout;
    public stackGUI: StackGUI;
    public standGUI: StandGUI;
    public phaseText: Phaser.GameObjects.Text;
    public textBox: Textbox;

    public tfgame:Mission;
    public missionIndex:number;
    public cardChannel:CardChannel;

    public background:Image;

  constructor() {
    super({
      key: "MissionScene"
    });
  }
  
  preload(): void {


    // TODO: implement multiatlas version
    //this.load.spritesheet('slime1',
    //    'assets/sprites/enemies/slime1/slime1-Sheet.png',
    //    { frameWidth: 64, frameHeight: 64 });

    /*this.load.atlas('slime1',
        'assets/sprites/enemies/slime1/slime1-Sheet.png',
        "assets/sprites/enemies/slime1/slime1-sheet.json");*/

    //MissionScene.loadFile("json/mission.json");
  }

  create(data): void {
    this.tfgame = Mission.Missions[data[0]].copy();
    this.tfgame.player = data[1];
    this.tfgame.deck = data[2];
    this.missionIndex = data[3];
    this.tfgame.listener.push(this);

    this.background = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, this.tfgame.background)
    let scaleX = this.cameras.main.width / this.background.width
    let scaleY = this.cameras.main.height / this.background.height
    let scale = Math.max(scaleX, scaleY)
    this.background.setScale(scale).setScrollFactor(0)

      this.textBox = new Textbox(this);

      this.stackGUI = new StackGUI(this, "stack");

      this.deckGUI = new DeckGUI(this, "deck", this.tfgame.deck);
      this.handGUI = new HandGUI(this, this.tfgame.player.hand, this.stackGUI, this.deckGUI);
      this.gameStateGUI = new TableGUI(this, this.tfgame)

      this.playerGUI = new PlayerGUI(this, "player", this.tfgame.player);
      this.playerGUI.listener.push(this.tfgame.player);

      this.enemyGUI = new EnemyGuiLayout(this, this.tfgame.getEnemies());

      this.phaseText = this.add.text(100, 100, "Draw Phase");

      this.tfgame.player.takeCard(this.tfgame.deck);

      this.handGUI.fadeOut();

      this.cardChannel = new CardChannel(this);
      this.tfgame.startCombat();
  }

  update(time: number, delta: number): void {
    if (this.cardChannel) {
      this.cardChannel.decisionArrow.update(time, delta);
    }
  }

  public enableToolTips(value:boolean) {
    this.enemyGUI.enemies.map(e => {
      e.toolTip.enabled = value;
    })
  }

  async drawPhase(game: Mission) {
    this.phaseText.setText("Draw Phase");
      this.handGUI.fadeOut();
    console.log("drawPhase");
    game.nextPhase();
  }

  async effectPhase(game: Mission) {
    console.log("effect Phase");
      this.handGUI.fadeOut();
    this.phaseText.setText("Effect Phase");
  }

  async enemyPhase(game: Mission) {
    console.log("enemyPhase");
      this.handGUI.fadeOut();
    this.phaseText.setText("Enemy Phase");
  }

  async energyPhase(game: Mission) {
    console.log("energy Phase");
      this.handGUI.fadeOut();
    this.phaseText.setText("Energy Phase");
  }

  async playPhase(game: Mission) {
    console.log("play Phase");
    this.handGUI.fadeIn();
    this.phaseText.setText("Play Phase");
  }

  async standPhase(game: Mission) {
    console.log("stand Phase");
    this.handGUI.fadeOut();
    this.phaseText.setText("Stand Phase");
  }


  async storyDialog(game: Mission, dialog: StoryDialog){
      this.textBox.addStoryDialog(dialog);
  }

  async gameover(game: Mission, gameWon:boolean) {
    console.log(gameWon);
    if (gameWon) {
      this.tfgame.player.missionStates[this.missionIndex] = true;
      this.scene.wake("NavigationScene");
      this.scene.stop();
      this.scene.remove();
    } else {
      // TODO: implement gameover screen
    }
  }

  async storyMonolog(game: Mission, monolog: string) {
    //   this.handGUI.unhoverAll();
    //   this.displayMonologue(monolog);
  }

  async waveChanged(game: Mission, activeWave: number, enemies: Enemy[]) {
    this.enemyGUI.setEnemies(enemies);
  }

  /**
         * shows the monolog letter by letter
         * adds animation for cursor so it seems like someone is typing
         * @param displayString 
         */
        displayMonologue(displayString: string): void {
          //a little bit hacky solution; adding a big black rectangle to current screen the destroying it later.
          let backgroundRect = this.add.rectangle(GameInfo.width / 2, GameInfo.height / 2, GameInfo.width, GameInfo.height, 0x000000);
          backgroundRect.setDepth(10);
  
          let wrapWidth = 1000;
          let height = GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 50) - wrapWidth / 2;
          let width = GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 30);
          let space = '|';
          let interval = 100;
          let t = this.add.text(height, width, '', {
              fontSize: 50, fontFamily: "appleKid"
          });
          t.setWordWrapWidth(wrapWidth);
          t.setAlign('center');
          t.setDepth(11);
  
          let showText = function (target: Phaser.GameObjects.Text, displayedText: string, message: string[], index: number, interval: number, blink: number, blinkIntervall: number) {
              // print letter
              if (index < message.length) {
                  target.setText(displayedText + message[index++] + space);
                  setTimeout(function () { showText(target, displayedText + message[index - 1], message, index, interval, blink, blinkIntervall); }, interval);
              } else {
                  // space animation at end of string
                  if (blink >= 0) {
                      let showPipe = blink % 2 == 0;
                      if (showPipe) {
                          target.setText(displayedText + space);
                          setTimeout(function () { showText(target, displayedText + space, message, index, interval, --blink, blinkIntervall); }, blinkIntervall);
  
                      } else {
                          target.setText(displayedText.substring(0, displayedText.length - 1));
                          setTimeout(function () { showText(target, displayedText.substring(0, displayedText.length - 1), message, index, interval, --blink, blinkIntervall); }, blinkIntervall);
                      }
                  } else {
                      backgroundRect.destroy();
                      t.destroy();
                  }
              }
          }
  
          showText(t, '', displayString.split(''), 0, interval, 10, interval * 4);
      }
    }