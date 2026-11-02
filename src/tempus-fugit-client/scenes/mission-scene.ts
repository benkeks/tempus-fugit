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
import { CardAnimationRegistry } from "../animations/card-animation-registry";
import type { CardAnimationPosition, CardDamageAnimation } from "../animations/card-animation-registry";
import { lightning } from "../animations/lightning";
import { electrocution } from "../animations/electrocution";
import { rootPierce } from "../animations/root-pierce";
import { healing } from "../animations/healing";
import { positiveAura, negativeAura } from "../animations/aura";
import { fireball, incinerate } from "../animations/fireball";
import { lightBeam, darkBeam, greenBeam, sandBeam } from "../animations/beam";
import { sunWave } from "../animations/sun-wave";
import { magicBolts, magicRain, magicSwarm } from "../animations/magic-particles";
import { slash } from "../animations/slash";
import { needleVolley } from "../animations/needle-volley";
import { groundImpact } from "../animations/ground-impact";
import { slimeSplash } from "../animations/slime-splash";
import { stoneThrow } from "../animations/stone-throw";
import { puffBlast } from "../animations/puff-blast";
import type { CardActionImpact, CardActionSource, CardActionTarget } from "../mechanics/card-action-animation";

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

    public gameOverText!: Phaser.GameObjects.Text;

    public phaseWheel!: WheelGUI;

    public delay:number = 1250;
    public readonly combatAnimationTimeoutMs: number = 2500;
    private pendingAnimations = 0;
    private animationEpoch = 0;
    public readonly cardAnimations = new CardAnimationRegistry();
    private cardDamageAnimation: {
        targets: readonly CardActionTarget[];
        animation: CardDamageAnimation;
    } | undefined;
    private animationWaiters: AnimationWaiter[] = [];
    private pendingTurnStartDiscard: Card | null = null;
    private pendingWavePresentation: PendingWavePresentation | null = null;
    private phaseIteration: {phase: number; wave: number; turn: number} | null = null;
    private ending = false;
    public showCredits:boolean = false;

    private readonly handleScenePause = (): void => {
        this.tfgame.setPaused(true);
    };

    private readonly handleSceneResume = (): void => {
        this.tfgame.setPaused(false);
        this.updateMissionInteractivity();
        this.scheduleTurnStartDiscardCheck();
    };

    private readonly handleSceneShutdown = (): void => {
        this.pendingWavePresentation = null;
        this.pendingTurnStartDiscard = null;
        this.phaseIteration = null;
        this.ending = false;

        if (this.tfgame) {
            this.tfgame.destroy();
        }

        const waiters = this.animationWaiters;
        this.animationEpoch++;
        this.animationWaiters = [];
        this.pendingAnimations = 0;
        waiters.forEach(resolve => resolve());

        this.events.off('pause', this.handleScenePause, this);
        this.events.off('resume', this.handleSceneResume, this);
    };

    constructor() {
        super({
            key: "MissionScene"
        });
        // Player cards and enemy attacks share effects and impact timing via their "animation" key.
        this.cardAnimations.register("lightning", lightning, electrocution);
        this.cardAnimations.register("root-pierce", rootPierce);
        this.cardAnimations.register("healing", healing);
        this.cardAnimations.register("positive-aura", positiveAura);
        this.cardAnimations.register("negative-aura", negativeAura);
        this.cardAnimations.register("fireball", fireball);
        this.cardAnimations.register("incinerate", incinerate);
        this.cardAnimations.register("light-beam", lightBeam);
        this.cardAnimations.register("dark-beam", darkBeam);
        this.cardAnimations.register("green-beam", greenBeam);
        this.cardAnimations.register("sand-beam", sandBeam);
        this.cardAnimations.register("sun-wave", sunWave);
        this.cardAnimations.register("magic-bolts", magicBolts);
        this.cardAnimations.register("magic-rain", magicRain);
        this.cardAnimations.register("magic-swarm", magicSwarm);
        this.cardAnimations.register("slash", slash);
        this.cardAnimations.register("needle-volley", needleVolley);
        this.cardAnimations.register("ground-impact", groundImpact);
        this.cardAnimations.register("slime-splash", slimeSplash);
        this.cardAnimations.register("stone-throw", stoneThrow);
        this.cardAnimations.register("puff-blast", puffBlast);
    }

    public getCardDamageAnimation(target: CardActionTarget): CardDamageAnimation | undefined {
        return this.cardDamageAnimation?.targets.includes(target) ? this.cardDamageAnimation.animation : undefined;
    }

    private getCardAnimationPosition(actor: CardActionSource): CardAnimationPosition {
        if (actor === this.tfgame.player) {
            const center = this.playerGUI.getCenter(undefined, true);
            return {x: center.x, y: center.y, groundY: this.playerGUI.getBottomCenter(undefined, true).y, sprite: this.playerGUI};
        }
        const gui = this.enemyGUI.enemies.find(gui => gui.enemy === actor);
        if (!gui) throw new Error("Missing card animation actor: " + actor.name);
        return gui.getEffectPosition();
    }

    public playCardAnimation(
        card: Card, targets: readonly CardActionTarget[], impact: CardActionImpact, complete: () => void,
        source: CardActionSource = this.tfgame.player,
        repeat: boolean = false,
    ): void {
        const key = card.animation;
        const animation = key && this.cardAnimations.get(key);
        if (!animation) throw new Error("Unknown card animation: " + key);

        const positions = targets.map((target, index) =>
            target === null ? null : {...this.getCardAnimationPosition(target), index})
            .filter(position => position !== null);
        const caster = this.getCardAnimationPosition(source);
        const epoch = this.animationEpoch;
        const damageAnimation = this.cardAnimations.getDamageAnimation(key);
        let impacted = false;
        const hitIndices = new Set<number>();
        const applyImpact: CardActionImpact = index => {
            if (impacted || epoch !== this.animationEpoch) return;
            if (index !== undefined && (!Number.isInteger(index) || index < 0 || index >= targets.length)) {
                throw new RangeError("Invalid card animation target index: " + index);
            }
            const indices = (index === undefined ? targets.map((_, i) => i) : [index])
                .filter(i => !hitIndices.has(i));
            if (index !== undefined && indices.length === 0) return;
            indices.forEach(i => hitIndices.add(i));
            impacted = hitIndices.size === targets.length;
            const previousDamageAnimation = this.cardDamageAnimation;
            // Scope special hit reactions to this action's targets; later ordinary hits must use the default.
            this.cardDamageAnimation = damageAnimation ? {targets: indices.map(i => targets[i]), animation: damageAnimation} : undefined;
            try {
                impact(index);
            } finally {
                this.cardDamageAnimation = previousDamageAnimation;
            }
        };
        const finishSequence = repeat ? this.beginCombatAnimation() : undefined;
        const playEffect = (again: boolean) => {
            const tween = animation(this, positions, applyImpact, card, caster);
            let settled = false;
            const finish = (completed: boolean) => {
                if (settled) return;
                settled = true;
                if (completed && again) {
                    // Phaser emits completion before effect cleanup; restore poses before starting the replay.
                    queueMicrotask(() => {
                        if (epoch === this.animationEpoch) playEffect(false);
                    });
                } else {
                    finishSequence?.();
                }
            };
            tween.once("complete", () => finish(true));
            tween.once("stop", () => finish(false));
            this.trackCombatAnimation(tween);
        };
        playEffect(repeat);
        void this.waitForActionAnimations().then(async () => {
            if (epoch !== this.animationEpoch) return;
            if (!impacted) {
                console.warn("Card animation interrupted before impact: " + key);
                applyImpact();
                await this.waitForActionAnimations();
            }
            if (epoch === this.animationEpoch) complete();
        });
    }

    private isPlayerInteractionPhase(): boolean {
        return !this.ending && !this.tfgame.waveTransitionInProgress &&
            (this.tfgame.curPhase === Mission.ENERGY_PHASE || this.tfgame.curPhase === Mission.PLAY_PHASE);
    }

    private scheduleSceneCallback(callback: () => void, delay: number = 0): void {
        const epoch = this.animationEpoch;
        this.time.delayedCall(delay, () => {
            if (epoch === this.animationEpoch) callback();
        }, [], this);
    }

    private updateMissionInteractivity(): void {
        this.tfgame.active = !this.tfgame.paused && this.isPlayerInteractionPhase();
    }

    private async withMissionPresentation<T>(
        game: Mission,
        options: { blocking: boolean; suspendPlayerOnly?: boolean },
        present: () => T,
    ): Promise<void> {
        if (game !== this.tfgame) return;
        const epoch = this.animationEpoch;
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
            if (restorePlayerInteractivity && epoch === this.animationEpoch) {
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

        const epoch = this.animationEpoch;
        const presentation = this.pendingWavePresentation;
        this.pendingWavePresentation = null;

        if (presentation.monolog) {
            await this.presentMonolog(game, presentation.monolog);
            if (epoch !== this.animationEpoch) return;
        }

        if (presentation.enemies) {
            this.enemyGUI.setEnemies(presentation.enemies, game.waveCounter > 0);
            if (game.waveCounter > 0) {
                await this.wait(this.enemyGUI.fadeInDuration);
                if (epoch !== this.animationEpoch) return;
            }
        }

        if (presentation.music) {
            MusicScene.instance.play(presentation.music);
        }

        for (const dialog of presentation.dialogs) {
            await this.presentDialog(game, dialog);
            if (epoch !== this.animationEpoch) return;
        }

        game.startWaveCombat();
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

    private beginCombatAnimation(): () => void {
        this.pendingAnimations++;
        const epoch = this.animationEpoch;
        let settled = false;
        return () => {
            if (settled) return;
            settled = true;
            if (epoch !== this.animationEpoch) return;
            this.pendingAnimations--;
            if (this.pendingAnimations === 0) {
                const waiters = this.animationWaiters;
                this.animationWaiters = [];
                waiters.forEach(resolve => resolve());
            }
        };
    }

    public trackCombatAnimation(tween: Phaser.Tweens.Tween, timeoutMs: number = this.combatAnimationTimeoutMs): Phaser.Tweens.Tween {
        const release = this.beginCombatAnimation();
        let settled = false;
        let timeoutEvent: Phaser.Time.TimerEvent | null = null;
        const finish = () => {
            if (settled) return;
            settled = true;
            if (timeoutEvent) timeoutEvent.remove(false);
            release();
        };

        tween.once("complete", finish);
        tween.once("stop", finish);
        timeoutEvent = this.time.delayedCall(timeoutMs, () => {
            console.warn("Combat animation timed out after " + timeoutMs + "ms");
            tween.stop();
            finish();
        }, [], this);
        return tween;
    }

    private async waitForCombatAnimationsToSettle(): Promise<void> {
        const epoch = this.animationEpoch;
        // Allow same-frame listener callbacks to enqueue their tracked tweens.
        await this.wait(0);

        if (epoch !== this.animationEpoch || this.pendingAnimations === 0) return;

        await this.waitForActionAnimations();
        if (epoch !== this.animationEpoch) return;
        await this.wait(300);
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
        this.tfgame.cardActionAnimator = {
            has: key => this.cardAnimations.get(key) !== undefined,
            play: (card, targets, impact, complete, source, repeat) => this.playCardAnimation(card, targets, impact, complete, source, repeat),
        };

        MissionScene.latestData = {
            key: data.key,
            index: data.index,
            player: data.player.copy(),
            deck: data.deck.copy(),
            showCredits: data.showCredits
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

        this.events.on('pause', this.handleScenePause, this);
        this.events.on('resume', this.handleSceneResume, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleSceneShutdown, this);
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
            e.toolTip.enabled = value && e.enemy.isAlive();
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

    public async endPlayerTurn(withBaseAttack: boolean): Promise<void> {
        const game = this.tfgame;
        if (!game.active || !this.isPlayerInteractionPhase()) return;
        if (withBaseAttack && !game.tryConsumeBaseAttack()) return;
        const epoch = this.animationEpoch;
        const wave = game.waveCounter;
        // Share the action lock so cards, resume handlers and duplicate clicks cannot reopen the turn.
        const finish = game.beginAction();
        try {
            if (withBaseAttack) {
                game.player.attackWithBaseAttack(game);
                await this.wait(500);
                if (epoch !== this.animationEpoch) return;
            }
            await this.waitForActionAnimations();
            if (epoch !== this.animationEpoch) return;
            while (game.paused) {
                await this.waitForSceneResume();
                if (epoch !== this.animationEpoch) return;
            }
            if (game.waveCounter !== wave || !game.player.isAlive() || !this.isPlayerInteractionPhase()) return;
            if (withBaseAttack) game.player.takeCard(game.deck);
            game.nextPhase(Mission.STAND_PHASE);
        } finally {
            finish();
        }
    }

    async iteratePhases(phase: number, delay: number) {
        const game = this.tfgame;
        const epoch = this.animationEpoch;
        if (game.curPhase != phase) return;
        const wave = game.waveCounter;
        const turn = game.curTurn;
        if (this.phaseIteration?.phase === phase && this.phaseIteration.wave === wave && this.phaseIteration.turn === turn) return;
        const iteration = {phase, wave, turn};
        this.phaseIteration = iteration;
        const isCurrent = () => this.phaseIteration === iteration && epoch === this.animationEpoch &&
            game.curPhase === phase && game.waveCounter === wave && game.curTurn === turn &&
            game.player.isAlive() && !this.ending;
        try {
            while (isCurrent()) {
                await this.wait(delay);
                if (!isCurrent()) return;
                while (game.paused && isCurrent()) await this.waitForSceneResume();
                if (!isCurrent()) return;
                game.nextPlayer();
                await this.waitForActionAnimations();
            }
        } finally {
            if (this.phaseIteration === iteration) this.phaseIteration = null;
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
        if (game !== this.tfgame || this.ending) return;
        this.ending = true;
        const epoch = this.animationEpoch;
        await this.waitForCombatAnimationsToSettle();
        if (epoch !== this.animationEpoch) return;

        if (!gameWon) {
            this.scene.start("DeathScene", { mission: game, index: this.missionIndex });
        } else {
            await this.presentWinMonologIfNeeded(game);
            if (epoch !== this.animationEpoch) return;
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
        void this.startWavePresentationAfterCombat(game);
    }

    private async startWavePresentationAfterCombat(game: Mission): Promise<void> {
        const epoch = this.animationEpoch;
        await this.waitForCombatAnimationsToSettle();
        if (epoch !== this.animationEpoch) return;
        this.startWavePresentation(game);
    }

    private async presentMonolog(game: Mission, monolog: string): Promise<void> {
        await this.withMissionPresentation(game, { blocking: true }, () => {
            this.scene.pause('MissionScene');
            this.scene.setVisible(false, 'MissionScene');
            this.scene.run('MonologScene', { monolog: monolog });
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
            // Scene-clock timers are removed on shutdown; release their promises as well.
            const finish = () => {
                timer.remove(false);
                this.events.off(Phaser.Scenes.Events.SHUTDOWN, finish);
                resolve();
            };
            const timer = this.time.delayedCall(delay, finish, [], this);
            this.events.once(Phaser.Scenes.Events.SHUTDOWN, finish);
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
            const finish = () => {
                this.events.off('resume', finish);
                this.events.off(Phaser.Scenes.Events.SHUTDOWN, finish);
                resolve();
            };
            this.events.once('resume', finish);
            this.events.once(Phaser.Scenes.Events.SHUTDOWN, finish);
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
        return this.trackCombatAnimation(scene.add.tween({
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