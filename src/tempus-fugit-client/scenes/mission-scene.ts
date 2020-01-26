import { Card } from "../objects/game-objects/card";
import { Enemy } from "../objects/game-objects/enemy";
import { CardGUI } from "../objects/game-gui-objects/card-gui";
import { PlayerGUI } from "../objects/game-gui-objects/player-gui";
import { Player } from "../objects/game-objects/player";
import { TechDemoGame } from "../mechanics/tech-demo-game";
import { TableGUI } from "../objects/game-gui-objects/table-gui";
import { HandGUI } from "../objects/game-gui-objects/hand-gui";
import { DeckGUI } from "../objects/game-gui-objects/deck-gui";
import { StackGUI } from "../objects/game-gui-objects/stack-gui";
import { EnemyGuiLayout } from "../objects/game-gui-objects/enemy-gui-layout";
import { Mission, MissionListener } from "../mechanics/mission";
import { StoryDialog } from "../mechanics/story-dialog";

import { CardChannel } from "../objects/game-gui-objects/card-channel";
import { Textbox } from "../objects/game-gui-objects/textbox";
import { GameInfo } from "../game";

import Image = Phaser.GameObjects.Image;
import { FormulaGUI } from "../objects/game-gui-objects/formula-gui";
import { StandGUILayout } from "../objects/game-gui-objects/stand-gui-layout";
import { EnemyGUI } from "../objects/game-gui-objects/enemy-gui";
import { WheelGUI } from "../objects/game-gui-objects/wheel-gui";
import { Scene, GameObjects } from "phaser";
import { PauseButton } from "../objects/pause-gui-objects/pause-button";
import { HelpButton } from "../objects/help-gui-objects/help-button";


export class MissionScene extends Phaser.Scene implements MissionListener {
    static latestData: Object;

    public playerGUI: PlayerGUI;
    public gameStateGUI: TableGUI;
    public handGUI: HandGUI;
    public deckGUI: DeckGUI;
    public enemyGUI: EnemyGuiLayout;
    public stackGUI: StackGUI;
    public standGUI: StandGUILayout;
    public textBox: Textbox;
    public helpButton: HelpButton;
    public pauseButton: PauseButton;

    public tfgame: Mission;
    public missionIndex: number;
    public cardChannel: CardChannel;

    public background: Image;

    public lowerMenu: Phaser.GameObjects.Graphics;

    public gameOverText;

    public phaseWheel: WheelGUI;

    constructor() {
        super({
            key: "MissionScene"
        });
    }

    preload(): void {

    }

    create(data): void {
        this.tfgame = Mission.Missions[data.key].copy();
        this.missionIndex = data.index;
        this.tfgame.player = data.player;
        this.tfgame.deck = data.deck;
        this.tfgame.listener.push(this);

        MissionScene.latestData = {
            key: data.key,
            index: data.index,
            player: data.player.copy(),
            deck: data.deck.copy()
        };

        this.tfgame.deck.shuffle();

        this.background = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, this.tfgame.background)
        let scaleX = this.cameras.main.width / this.background.width
        let scaleY = this.cameras.main.height / this.background.height
        let scale = Math.max(scaleX, scaleY)
        this.background.setScale(scale).setScrollFactor(0)

        //Menun Layout
        //5C4D4D, 915B4A, A96851
        this.lowerMenu = this.add.graphics();
        let innerTop = GameInfo.height*0.715;
        let margin = GameInfo.width*0.01;
        let color1 = 0x5C4D4D;
        let color3 = 0x915B4A
        let color2 = 0xA96851;


        //Book box
        this.lowerMenu.lineStyle(20, color1, 1);
        this.lowerMenu.strokeRoundedRect(GameInfo.width*0.435+margin,GameInfo.height*0.54,GameInfo.width*0.12-margin,GameInfo.height*0.25, 30);
        this.lowerMenu.fillStyle(color2, 1);
        this.lowerMenu.fillRoundedRect(GameInfo.width*0.435+margin,GameInfo.height*0.54,GameInfo.width*0.12-margin,GameInfo.height*0.25, 30);

        //Main
        this.lowerMenu.lineStyle(20, color1, 1);
        this.lowerMenu.strokeRoundedRect(0,GameInfo.height*0.7,GameInfo.width,GameInfo.height*1, 30);
        this.lowerMenu.fillStyle(color2, 1);
        this.lowerMenu.fillRoundedRect(0,GameInfo.height*0.7,GameInfo.width,GameInfo.height*1, 30);
        
        this.lowerMenu.lineStyle(20, color2, 1);
        this.lowerMenu.lineBetween(GameInfo.width*0.435+margin,GameInfo.height*0.7,GameInfo.width*0.555,GameInfo.height*0.7);

        //Profile
        this.lowerMenu.lineStyle(6, color1, 1);
        this.lowerMenu.strokeRoundedRect(GameInfo.width*0.0+margin,innerTop,GameInfo.width*0.1-margin,GameInfo.height*0.27, 30);
        this.lowerMenu.fillStyle(color3, 1);
        this.lowerMenu.fillRoundedRect(GameInfo.width*0.0+margin,innerTop,GameInfo.width*0.1-margin,GameInfo.height*0.27, 30);
        this.add.sprite(GameInfo.width*0.055,GameInfo.height*0.80, "playerProfile").setScale(6);

        //Stats
        this.lowerMenu.lineStyle(6, color1, 1);
        this.lowerMenu.strokeRoundedRect(GameInfo.width*0.1+margin,innerTop,GameInfo.width*0.15-margin,GameInfo.height*0.15, 30);
        this.lowerMenu.fillStyle(color3, 1);
        this.lowerMenu.fillRoundedRect(GameInfo.width*0.1+margin,innerTop,GameInfo.width*0.15-margin,GameInfo.height*0.15, 30);

        //Help
        this.lowerMenu.lineStyle(6, color1, 1);
        this.lowerMenu.strokeRoundedRect(GameInfo.width*0.12+margin,innerTop+GameInfo.height*0.17,GameInfo.width*0.1-margin,GameInfo.height*0.1, 30);
        this.lowerMenu.fillStyle(color3, 1);
        this.lowerMenu.fillRoundedRect(GameInfo.width*0.12+margin,innerTop+GameInfo.height*0.17,GameInfo.width*0.1-margin,GameInfo.height*0.1, 30);

        //Hand box
        this.lowerMenu.lineStyle(6, color1, 1);
        this.lowerMenu.strokeRoundedRect(GameInfo.width*0.25+margin,innerTop,GameInfo.width*0.5-margin,GameInfo.height*0.27, 30);
        this.lowerMenu.fillStyle(color3, 1);
        this.lowerMenu.fillRoundedRect(GameInfo.width*0.25+margin,innerTop,GameInfo.width*0.5-margin,GameInfo.height*0.27, 30);

        //Stack box
        this.lowerMenu.lineStyle(6, color1, 1);
        this.lowerMenu.strokeRoundedRect(GameInfo.width*0.75+margin,innerTop,GameInfo.width*0.1-margin,GameInfo.height*0.27, 30);
        this.lowerMenu.fillStyle(color3, 1);
        this.lowerMenu.fillRoundedRect(GameInfo.width*0.75+margin,innerTop,GameInfo.width*0.1-margin,GameInfo.height*0.27, 30);
        
        //Phase box
        this.lowerMenu.lineStyle(6, color1, 1);
        this.lowerMenu.strokeRoundedRect(GameInfo.width*0.85+margin,innerTop,GameInfo.width*0.14-margin,GameInfo.height*0.27, 30);
        this.lowerMenu.fillStyle(color3, 1);
        this.lowerMenu.fillRoundedRect(GameInfo.width*0.85+margin,innerTop,GameInfo.width*0.14-margin,GameInfo.height*0.27, 30);



        this.textBox = new Textbox(this);

        //this.stackGUI = new StackGUI(this, "stack");

        this.deckGUI = new DeckGUI(this, "deck", this.tfgame.deck);
        this.handGUI = new HandGUI(this, this.tfgame.player.hand, this.stackGUI, this.deckGUI, this.tfgame.gameState);
        this.gameStateGUI = new TableGUI(this, this.tfgame)

        this.playerGUI = new PlayerGUI(this, "player", this.tfgame.player);
        this.playerGUI.listener.push(this.tfgame.player);

        this.enemyGUI = new EnemyGuiLayout(this, this.tfgame);

        this.standGUI = new StandGUILayout(this);
        this.tfgame.standListener.push(this.standGUI);

        this.phaseWheel = new WheelGUI(this, this.tfgame);

        this.tfgame.player.takeCard(this.tfgame.deck);

        this.handGUI.fadeOut();

        this.cardChannel = new CardChannel(this, 50, 62.5);
        this.tfgame.startCombat();

        this.helpButton = new HelpButton(this, true);
        this.pauseButton = new PauseButton(this, true);

        //this.gameOverText = this.add.text(GameInfo.width / 2, GameInfo.height / 2, "GAME OVER!", { fontSize: '50px', fontStyle: 'bold', fontFamily: 'appleKid', color: '#FF0000' });
        //this.gameOverText.setOrigin(0.5, 0.5);
        //this.gameOverText.setVisible(false);

        this.input.keyboard.addKey("B").on("down", e => {
            this.tfgame.gameWon = true;
            this.tfgame.waveCounter = 100;
            this.gameover(this.tfgame, true);
        })
    }

    update(time: number, delta: number): void {
        if (this.cardChannel) {
            this.cardChannel.decisionArrow.update(time, delta);
        }
    }

    public enableToolTips(value: boolean) {
        this.enemyGUI.enemies.map(e => {
            e.toolTip.enabled = value;
        })
    }

    async drawPhase(game: Mission) {
    }

    /**
     * added so discard gui can call next phase in case the hand is full and the user selects a card to discard
     */
    async callNextPhase() {
        this.tfgame.nextPhase();
    }

    async effectPhase(game: Mission) {
        console.log("effect Phase");
    }

    async enemyPhase(game: Mission) {
        console.log("enemyPhase");
        this.time.delayedCall(1000, this.tfgame.nextPhase, [], this.tfgame);
    }

    async energyPhase(game: Mission) {
        console.log("energy Phase");
    }

    async playPhase(game: Mission) {
        console.log("play Phase");
    }

    async standPhase(game: Mission) {
        console.log("stand Phase");
        this.time.delayedCall(1000, this.tfgame.nextPhase, [], this.tfgame);
    }


    async storyDialog(game: Mission, dialog: StoryDialog) {
        this.textBox.addStoryDialog(dialog);
    }

    async gameover(game: Mission, gameWon: boolean) {
        this.tfgame.destroy();
        this.scene.start("NavigationScene", { mission: this.tfgame, index: this.missionIndex });
    }

    async storyMonolog(game: Mission, monolog: string) {
        this.handGUI.unhoverAll();
        if (monolog && monolog.length > 0)
            this.scene.run('MonologScene', { monolog });
    }

    async waveChanged(game: Mission, activeWave: number, enemies: Enemy[]) {
        this.enemyGUI.setEnemies(enemies, true);
    }

    Activated(game: Mission, active: boolean) { }

    public static createAttackAnimation(scene: Scene, target: GameObjects.GameObject, direction: string = "+", offset: number = 100): Phaser.Tweens.Tween {

        return scene.add.tween({
            targets: target,
            x: direction + "=100",
            ease: "Linear",
            duration: 150,
            repeat: 0,
            yoyo: true
        });
    }
}