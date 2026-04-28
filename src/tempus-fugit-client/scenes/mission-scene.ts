import { Card } from "../objects/game-objects/card";
import { Enemy } from "../objects/game-objects/enemy";
import { PlayerGUI } from "../objects/game-gui-objects/player-gui";
import { TableGUI } from "../objects/game-gui-objects/table-gui";
import { HandGUI } from "../objects/game-gui-objects/hand-gui";
import { DeckGUI } from "../objects/game-gui-objects/deck-gui";
import { EnemyGuiLayout } from "../objects/game-gui-objects/enemy-gui-layout";
import { Mission, MissionListener } from "../mechanics/mission";
import { StoryDialog } from "../mechanics/story-dialog";

import { CardChannel } from "../objects/game-gui-objects/card-channel";
import { Textbox } from "../objects/game-gui-objects/textbox";
import { GameInfo } from "../game";

import Image = Phaser.GameObjects.Image;
import { StandGUILayout } from "../objects/game-gui-objects/stand-gui-layout";
import { WheelGUI } from "../objects/game-gui-objects/wheel-gui";
import { Scene, GameObjects } from "phaser";
import { PauseButton } from "../objects/pause-gui-objects/pause-button";
import { HelpButton } from "../objects/help-gui-objects/help-button";
import { Stack } from "../objects/game-objects/stack";

import { HelpWindow } from "../objects/help-gui-objects/help-window";

import { TutorialButton } from "../objects/tutorial-objects/tutorial-button";
import { MusicScene } from "./music-scene";
import { SoundButton } from "../objects/sound-button";

type PendingWavePresentation = {
    game: Mission;
    enemies?: Enemy[];
    dialogs: StoryDialog[];
    monolog?: string;
    music?: string;
};

type AnimationWaiter = () => void;


export class MissionScene extends Phaser.Scene implements MissionListener {
    static latestData: Object;

    public playerGUI!: PlayerGUI;
    public gameStateGUI!: TableGUI; // variable table at the top
    public handGUI!: HandGUI;
    public deckGUI!: DeckGUI;
    public enemyGUI!: EnemyGuiLayout;
    public stack!: Stack;
    public standGUI!: StandGUILayout;
    public textBox!: Textbox;
    public helpButton!: HelpButton;
    public pauseButton!: PauseButton;
    public tutorialButton!: TutorialButton;
    public soundButton!:SoundButton;

    public tfgame!: Mission;
    public missionIndex!: number;
    public cardChannel!: CardChannel;

    public background!: Image;

    public lowerMenu!: Phaser.GameObjects.Graphics;

    public gameOverText;

    public phaseWheel!: WheelGUI;

    public delay:number = 1250;
    private pendingAnimations = 0;
    private animationWaiters: AnimationWaiter[] = [];
    private pendingTurnStartDiscard: Card | null = null;
    private pendingWavePresentation: PendingWavePresentation | null = null;
    public showCredits:boolean = false;

    constructor() {
        super({
            key: "MissionScene"
        });
    }

    private isPlayerInteractionPhase(): boolean {
        return this.tfgame.curPhase === Mission.ENERGY_PHASE || this.tfgame.curPhase === Mission.PLAY_PHASE;
    }

    private scheduleSceneCallback(callback: () => void, delay: number = 0): void {
        this.time.delayedCall(delay, callback, [], this);
    }

    private updateMissionInteractivity(): void {
        const interactive = !this.tfgame.paused && this.isPlayerInteractionPhase();
        this.tfgame.player.active = interactive;
        this.tfgame.gameState.active = interactive && this.tfgame.curPhase !== Mission.PLAY_PHASE;
    }

    private async withMissionPresentation<T>(
        game: Mission,
        options: { blocking: boolean; suspendPlayerOnly?: boolean },
        present: () => T,
    ): Promise<void> {
        const restorePlayerInteractivity = !options.blocking && !!options.suspendPlayerOnly;

        if (options.blocking) {
            game.setPaused(true);
        } else if (restorePlayerInteractivity) {
            game.active = false;
        }

        try {
            present();

            if (options.blocking) {
                await this.waitForSceneResume();
                return;
            }

            await this.wait(0);
        } finally {
            if (restorePlayerInteractivity) {
                this.updateMissionInteractivity();
            }
        }
    }

    private async presentWinMonologIfNeeded(game: Mission): Promise<void> {
        const winMonolog = game.monologue[game.waveCounter];
        if (winMonolog && winMonolog.length > 0) {
            await this.presentMonolog(game, winMonolog);
        }
    }

    private scheduleAfterWaveSetup(callback: () => void, delayAfterWave: boolean): void {
        this.scheduleSceneCallback(callback, delayAfterWave ? this.delay : 0);
    }

    private captureWaveDialog(game: Mission, dialog: StoryDialog): boolean {
        if (!this.pendingWavePresentation || this.pendingWavePresentation.game !== game) {
            return false;
        }

        this.pendingWavePresentation.dialogs.push(dialog);
        return true;
    }

    private captureWaveMonolog(game: Mission, monolog: string): boolean {
        if (!this.pendingWavePresentation || this.pendingWavePresentation.game !== game) {
            return false;
        }

        this.pendingWavePresentation.monolog = monolog;
        return true;
    }

    private captureWaveMusic(game: Mission, sound: string): boolean {
        if (!this.pendingWavePresentation || this.pendingWavePresentation.game !== game) {
            return false;
        }

        this.pendingWavePresentation.music = sound;
        return true;
    }

    private onWaveChangedPresentation(game: Mission, enemies: Enemy[]): void {
        if (!this.pendingWavePresentation || this.pendingWavePresentation.game !== game) {
            this.pendingWavePresentation = { game, dialogs: [] };
        }

        this.pendingWavePresentation.enemies = enemies;
    }

    private startWavePresentation(game: Mission): void {
        if (!this.pendingWavePresentation || this.pendingWavePresentation.game !== game) {
            return;
        }

        const start = () => {
            void this.flushWavePresentation(game);
        };

        this.scheduleAfterWaveSetup(start, game.waveCounter > 0);
    }

    private async flushWavePresentation(game: Mission): Promise<void> {
        if (!this.pendingWavePresentation || this.pendingWavePresentation.game !== game) return;

        const presentation = this.pendingWavePresentation;
        this.pendingWavePresentation = null;

        if (presentation.monolog) {
            await this.presentMonolog(game, presentation.monolog);
        }

        if (presentation.enemies) {
            this.enemyGUI.setEnemies(presentation.enemies, game.waveCounter > 0);
            if (game.waveCounter > 0) {
                await this.wait(this.enemyGUI.fadeInDuration);
            }
        }

        if (presentation.music) {
            MusicScene.instance.play(presentation.music);
        }

        for (const dialog of presentation.dialogs) {
            await this.presentDialog(game, dialog);
        }

        game.nextPhase(0);
    }

    private hasPendingTurnStartDiscard(): boolean {
        return this.pendingTurnStartDiscard !== null;
    }

    private queuePendingTurnStartDiscard(card: Card): void {
        this.pendingTurnStartDiscard = card;
        this.scheduleTurnStartDiscardCheck();
    }

    private scheduleTurnStartDiscardCheck(): void {
        this.scheduleSceneCallback(() => {
            this.tryOpenTurnStartDiscard();
        });
    }

    private tryOpenTurnStartDiscard(): void {
        if (!this.pendingTurnStartDiscard) return;
        if (this.tfgame.paused || !this.isPlayerInteractionPhase()) return;

        const card = this.pendingTurnStartDiscard;
        this.pendingTurnStartDiscard = null;
        this.tfgame.active = false;
        this.handGUI.discardCard(card);
    }

    private trackAnimation(tween: Phaser.Tweens.Tween): Phaser.Tweens.Tween {
        this.pendingAnimations++;

        let settled = false;
        const finish = () => {
            if (settled) return;
            settled = true;
            this.pendingAnimations--;

            if (this.pendingAnimations === 0) {
                const waiters = this.animationWaiters;
                this.animationWaiters = [];
                waiters.forEach(resolve => resolve());
            }
        };

        tween.once("complete", finish);
        tween.once("stop", finish);
        return tween;
    }

    preload(): void {

    }

    create(data): void {
        this.tfgame = Mission.Missions[data.key].copy();
        this.missionIndex = data.index;
        this.tfgame.player = data.player;
        this.tfgame.deck = data.deck;
        this.showCredits = data.showCredits;
        this.tfgame.listener.push(this);

        MissionScene.latestData = {
            key: data.key,
            index: data.index,
            player: data.player.copy(),
            deck: data.deck.copy()
        };

        this.tfgame.deck.setUpDeck();
        this.tfgame.deck.shuffle();

        // this.background = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, this.tfgame.background)
        // let scaleX = this.cameras.main.width / this.background.width
        // let scaleY = this.cameras.main.height / this.background.height
        // let scale = Math.max(scaleX, scaleY)
        // this.background.setScale(scale).setScrollFactor(0)
        this.background = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 - 40, this.tfgame.background)
            .setScale(1);
        this.background.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

        //Menun Layout
        //5C4D4D, 915B4A, A96851
        this.lowerMenu = this.add.graphics();
        let innerTop = GameInfo.height * 0.715;
        let margin = GameInfo.width * 0.01;
        let color1 = 0x5C4D4D;
        let color3 = 0x915B4A;
        let color2 = 0xA96851;

        // Uppder box
        this.lowerMenu.fillStyle(color2, 1);
        this.lowerMenu.fillRect(10, 0, GameInfo.width - 20, GameInfo.height * 0.239);
        this.lowerMenu.lineStyle(15, color1, 1);
        this.lowerMenu.strokeRoundedRect(0, 0, GameInfo.width, GameInfo.height * 0.239, 30);

        //Book box
        this.lowerMenu.lineStyle(20, color1, 1);
        this.lowerMenu.strokeRoundedRect(GameInfo.width * 0.435 + margin, GameInfo.height * 0.54, GameInfo.width * 0.12 - margin, GameInfo.height * 0.25, 30);
        this.lowerMenu.fillStyle(color2, 1);
        this.lowerMenu.fillRoundedRect(GameInfo.width * 0.435 + margin, GameInfo.height * 0.54, GameInfo.width * 0.12 - margin, GameInfo.height * 0.25, 30);

        //Main
        this.lowerMenu.lineStyle(20, color1, 1);
        this.lowerMenu.strokeRoundedRect(0, GameInfo.height * 0.7, GameInfo.width, GameInfo.height * 1, 30);
        this.lowerMenu.fillStyle(color2, 1);
        this.lowerMenu.fillRoundedRect(0, GameInfo.height * 0.7, GameInfo.width, GameInfo.height * 1, 30);

        this.lowerMenu.lineStyle(20, color2, 1);
        this.lowerMenu.lineBetween(GameInfo.width * 0.435 + margin, GameInfo.height * 0.7, GameInfo.width * 0.555, GameInfo.height * 0.7);

        //Profile
        this.lowerMenu.lineStyle(6, color1, 1);
        this.lowerMenu.strokeRoundedRect(GameInfo.width * 0.0 + margin, innerTop, GameInfo.width * 0.1 - margin, GameInfo.height * 0.27, 30);
        this.lowerMenu.fillStyle(color3, 1);
        this.lowerMenu.fillRoundedRect(GameInfo.width * 0.0 + margin, innerTop, GameInfo.width * 0.1 - margin, GameInfo.height * 0.27, 30);
        this.add.sprite(GameInfo.width * 0.055, GameInfo.height * 0.80, "playerProfile").setScale(6).setAlpha(0.5);

        //Stats
        this.lowerMenu.lineStyle(6, color1, 1);
        this.lowerMenu.strokeRoundedRect(GameInfo.width * 0.1 + margin, innerTop, GameInfo.width * 0.15 - margin, GameInfo.height * 0.15, 30);
        this.lowerMenu.fillStyle(color3, 1);
        this.lowerMenu.fillRoundedRect(GameInfo.width * 0.1 + margin, innerTop, GameInfo.width * 0.15 - margin, GameInfo.height * 0.15, 30);

        //Help
        this.lowerMenu.lineStyle(6, color1, 1);
        this.lowerMenu.strokeRoundedRect(GameInfo.width * 0.12 + margin, innerTop + GameInfo.height * 0.17, GameInfo.width * 0.1 - margin, GameInfo.height * 0.1, 30);
        this.lowerMenu.fillStyle(color3, 1);
        this.lowerMenu.fillRoundedRect(GameInfo.width * 0.12 + margin, innerTop + GameInfo.height * 0.17, GameInfo.width * 0.1 - margin, GameInfo.height * 0.1, 30);

        //Hand box
        this.lowerMenu.lineStyle(6, color1, 1);
        this.lowerMenu.strokeRoundedRect(GameInfo.width * 0.25 + margin, innerTop, GameInfo.width * 0.5 - margin, GameInfo.height * 0.27, 30);
        this.lowerMenu.fillStyle(color3, 1);
        this.lowerMenu.fillRoundedRect(GameInfo.width * 0.25 + margin, innerTop, GameInfo.width * 0.5 - margin, GameInfo.height * 0.27, 30);

        //Cards left box
        this.lowerMenu.lineStyle(6, color1, 1);
        this.lowerMenu.strokeRoundedRect(GameInfo.width * 0.75 + margin, innerTop, GameInfo.width * 0.1 - margin, GameInfo.height * 0.27, 30);
        this.lowerMenu.fillStyle(color3, 1);
        this.lowerMenu.fillRoundedRect(GameInfo.width * 0.75 + margin, innerTop, GameInfo.width * 0.1 - margin, GameInfo.height * 0.27, 30);

        //Phase box
        this.lowerMenu.lineStyle(6, color1, 1);
        this.lowerMenu.strokeRoundedRect(GameInfo.width * 0.85 + margin, innerTop, GameInfo.width * 0.14 - margin, GameInfo.height * 0.27, 30);
        this.lowerMenu.fillStyle(color3, 1);
        this.lowerMenu.fillRoundedRect(GameInfo.width * 0.85 + margin, innerTop, GameInfo.width * 0.14 - margin, GameInfo.height * 0.27, 30);


        this.stack = new Stack();

        this.deckGUI = new DeckGUI(this, this.tfgame.deck);
        this.handGUI = new HandGUI(this, this.tfgame.player.hand, this.stack, this.deckGUI, this.tfgame.gameState);
        this.tfgame.player.hand.missionScene = this;
        this.gameStateGUI = new TableGUI(this, this.tfgame)

        // box for arrow and energy
        this.lowerMenu.fillStyle(color2, 1);
        this.lowerMenu.fillRoundedRect(0, GameInfo.height * 0.242, 30 + this.gameStateGUI.energyTable.x + this.gameStateGUI.energyTable.width / 2, 50, 10);
        this.lowerMenu.lineStyle(10, color1, 1);
        this.lowerMenu.strokeRoundedRect(0, GameInfo.height * 0.242, 30 + this.gameStateGUI.energyTable.x + this.gameStateGUI.energyTable.width / 2, 50, 10);

        // outline
        this.lowerMenu.lineStyle(20, color1, 1);
        this.lowerMenu.strokeRect(0, 0, GameInfo.width, GameInfo.height)

        this.textBox = new Textbox(this, this.handGUI, this.tfgame);

        this.playerGUI = new PlayerGUI(this, "player", this.tfgame.player);
        this.playerGUI.listener.push(this.tfgame.player);

        this.enemyGUI = new EnemyGuiLayout(this, this.tfgame);

        this.standGUI = new StandGUILayout(this);
        this.tfgame.gameState.listener.push(this.standGUI);
        this.tfgame.standListener.push(this.standGUI);

        this.phaseWheel = new WheelGUI(this, this.tfgame);

        this.handGUI.fadeOut();

        this.cardChannel = new CardChannel(this, 50, 62.5);
        this.tfgame.startCombat();

        this.helpButton = new HelpButton(this, true);
        this.pauseButton = new PauseButton(this, true);
        this.tutorialButton = new TutorialButton(this, 1690, 310);
        this.soundButton = new SoundButton(this, 1780, 310);

        this.events.on('resume', () => {
            this.updateMissionInteractivity();
            this.scheduleTurnStartDiscardCheck();
        }, this);
    }

    private finishWonMission(): void {
        const config = { mission: this.tfgame, index: this.missionIndex, tutorial:false };
        if (this.showCredits) {
            this.scene.start("Credits", {key:"NavigationScene", config:config});
        } else {
            this.scene.start("NavigationScene", config);
        }
    }

    update(time: number, delta: number): void {
        if (this.cardChannel) {
            this.cardChannel.decisionArrow.update(time, delta);
        }
    }

    public enableToolTips(value: boolean) {
        this.enemyGUI.enemies.forEach(e => {
            e.toolTip.enabled = value;
        });
    }

    async drawPhase(game: Mission) { }

    /**
     * added so discard gui can call next phase in case the hand is full and the user selects a card to discard
     */
    async callNextPhase() {
        this.tfgame.nextPhase();
        if (!this.hasPendingTurnStartDiscard()) {
            this.tfgame.player.hand.discardGUIStarted = false;
        }
    }

    async enemyPhase(game: Mission) {
        this.iteratePhases(4, 500);
    }

    async energyPhase(game: Mission) {
        this.playerGUI.reposition();
        this.enemyGUI.reposition();
        this.scheduleTurnStartDiscardCheck();
    }

    async playPhase(game: Mission) { this.scheduleTurnStartDiscardCheck(); }

    async iteratePhases(phase: number, delay: number) {
        if (this.tfgame.curPhase != phase) return;

        await this.wait(delay);

        if (this.tfgame.curPhase != phase || this.tfgame.paused) return;

        this.tfgame.nextPlayer();
        await this.waitForActionAnimations();

        if (this.tfgame.curPhase == phase && !this.tfgame.paused) {
            this.iteratePhases(phase, delay);
        }
    }

    async standPhase(game: Mission) {
        this.iteratePhases(3, 500);
    }

    storyDialog(game: Mission, dialog: StoryDialog) {
        if (this.captureWaveDialog(game, dialog)) {
            return;
        }

        this.scheduleAfterWaveSetup(() => {
            void this.presentDialog(game, dialog);
        }, game.waveCounter > 0);
    }

    async gameover(game: Mission, gameWon: boolean) {
        if (!gameWon) {
            this.scene.start("DeathScene", { mission: this.tfgame, index: this.missionIndex });
        } else {
            await this.presentWinMonologIfNeeded(game);
            this.finishWonMission();
        }
        this.updateHelp();
    }

    storyMonolog(game: Mission, monolog: string) {
        if (monolog && monolog.length > 0) {
            if (!this.captureWaveMonolog(game, monolog)) {
                void this.presentMonolog(game, monolog);
            }
        }
    }

    async waveChanged(game: Mission, activeWave: number, enemies: Enemy[]) {
        this.onWaveChangedPresentation(game, enemies);
    }

    wavePresentationReady(game: Mission): void {
        this.startWavePresentation(game);
    }

    private async presentMonolog(game: Mission, monolog: string): Promise<void> {
        await this.withMissionPresentation(game, { blocking: true }, () => {
            this.scene.run('MonologScene', { monolog: monolog, gameOver: game.isGameWon() });
        });
    }

    private async presentDialog(game: Mission, dialog: StoryDialog): Promise<void> {
        await this.withMissionPresentation(
            game,
            { blocking: dialog.blocking, suspendPlayerOnly: !dialog.blocking },
            () => {
                this.textBox.addStoryDialog(dialog, dialog.blocking);
            }
        );
    }

    public queueTurnStartDiscard(card: Card): void {
        this.queuePendingTurnStartDiscard(card);
    }

    public onDiscardDialogClosed(): void {
        this.updateMissionInteractivity();
        this.scheduleTurnStartDiscardCheck();
    }

    private wait(delay: number): Promise<void> {
        return new Promise(resolve => {
            this.time.delayedCall(delay, () => resolve(), [], this);
        });
    }

    public waitForActionAnimations(): Promise<void> {
        if (this.pendingAnimations === 0) {
            return Promise.resolve();
        }

        return new Promise(resolve => {
            this.animationWaiters.push(resolve);
        });
    }

    private waitForSceneResume(): Promise<void> {
        return new Promise(resolve => {
            this.events.once('resume', () => resolve());
        });
    }

    async music(mission: Mission, sound: string) {
        if (!this.captureWaveMusic(mission, sound)) {
            MusicScene.instance.play(sound);
        }
    }

    Activated(game: Mission, active: boolean) { }
    async baseAttackPossible(game: Mission, active: boolean) { }

    public createAttackAnimation(scene: Scene, target: GameObjects.GameObject, direction: string = "+", offset: number = 100, repeat: number = 0): Phaser.Tweens.Tween {
        return this.trackAnimation(scene.add.tween({
            targets: target,
            x: direction + "=" + offset,
            ease: "Linear",
            duration: 150,
            repeat: repeat,
            yoyo: true
        }));
    }

    public updateHelp() {
        let data = HelpWindow.order[this.missionIndex];
        if (data && data.once) {
            (<Array<any>>data.tabs).map(t => HelpWindow.help_data.push(t));
            if (data.index) HelpWindow.lastIndex = data.index;
            data.once = false;
            if (data.tabs.length) HelpButton.newInfo = true;
        }
    }
}