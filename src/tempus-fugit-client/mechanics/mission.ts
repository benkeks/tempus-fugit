import EventEmitter = Phaser.Events.EventEmitter;
import {Deck} from "../objects/game-objects/deck";
import {Player} from "../objects/game-objects/player";
import {GameState} from "../objects/game-objects/game-state";
import {Enemy, EnemyListener} from "../objects/game-objects/enemy";
import {Card} from "../objects/game-objects/card";
import {StoryDialog} from "./story-dialog";
import {Stand} from "../objects/game-objects/stand";

export class Mission implements EnemyListener {
    get enemies(): { [p: number]: Enemy[] } {
        return this._enemies;
    }

    set enemies(value: { [p: number]: Enemy[] }) {
        this._enemies = value;

        for (let i in value) {
            let eList:Enemy[] = value[i];

            eList.map(e => e.listener.push(this))
        }
    }
    public static Missions: {[name:string]:string} = {};
    public name: string;
    public background: string;
    private readonly numPhases:number = 5;
    private curPhase: number;
    private emitter: EventEmitter;
    private curTurn: number;
    private toPhase: Map<number, string>;

    public listener:GameStateListener[] = [];

    public deck:Deck = new Deck();
    public player:Player;
    public gameState:GameState;
    private _enemies:{[wave:number]:Enemy[]} = {};
    private stands:Stand[] = [];
    private aliveEnemiesCount:number = -1;
    public cards:Card[] = [];

    public monologs:{[wave:number]:string} = {};
    public dialogue:StoryDialog[] = [];

    public waveCounter;
    // TODO: effect list

    constructor() {
        this.curPhase = 0;
        this.emitter = new EventEmitter();
        this.curTurn = 0;
        this.waveCounter = 0;

        this.toPhase = new Map<number,string>();
        this.toPhase.set(0, 'draw-phase');
        this.toPhase.set(1, 'energy-phase');
        this.toPhase.set(2, 'play-phase');
        this.toPhase.set(3, 'enemy-phase');
        this.toPhase.set(4, 'stand-phase');
        this.toPhase.set(5, 'effect-phase');
    }

    private checkDialogEvents() {
        for (let i=0; i < this.dialogue.length; i++) {
            let d:StoryDialog = this.dialogue[i];
            if (d.isTriggered(this)) {
                this.listener.map(l => l.storyDialog(this, d));
                this.dialogue.splice(i, 1);
            }
        }
    }

    /**
     * Switches phases
     * --- Player's turn ---
     * 0 -> Draw Phase
     * 1 -> Energy Phase
     * 2 -> Play Phase
     * 3 -> Stand Phase
     * --- Enemy's turn ---
     * 4 -> Enemy Phase
     * 5 -> Effect Phase
     *
     * emits an event for each phase, names can be seen in toPhase map
     * increments turn counter every time player turn is reached
     */
    public nextPhase(next:number = (this.curPhase + 1) % this.numPhases):void {
        if (this.curPhase === this.numPhases-1) {
            this.endOfRound();
        }
        this.curPhase = next;

        switch (this.curPhase) {
            case 0:
                this.drawPhase();
                this.listener.map(l => l.drawPhase(this));
                break;
            case 1:
                this.energyPhase();
                this.listener.map(l => l.energyPhase(this));
                break;
            case 2:
                this.playPhase();
                this.listener.map(l => l.playPhase(this));
                break;
            case 3:
                this.standPhase();
                this.listener.map(l => l.standPhase(this));
                break;
            case 4:
                this.enemyPhase();
                this.listener.map(l => l.enemyPhase(this));
                break;
            case 5:
                this.effectPhase();
                this.listener.map(l => l.effectPhase(this));
                break;
        }

        /*this.emitter.emit(this.getPhaseString());
        if (this.curPhase === 0) {
            this.incrementTurnCount();
            this.emitter.emit('next-round');
        }*/

        this.checkDialogEvents();
    }

    public nextWave(next:number = this.waveCounter+1 % this.getMaxWaveCount()):void {
        this.waveCounter = next;

        if (this.waveCounter >= this.getMaxWaveCount()) {
            this.listener.map(l => l.gameover(this));
            return;
        }

        this.aliveEnemiesCount = this.enemies[this.waveCounter].length;
        this.nextPhase(0);
        this.listener.map(l => l.waveChanged(this, next, this.enemies[this.waveCounter]));

        this.listener.map(l => l.storyMonolog(this, this.monologs[this.waveCounter]));
    }

    private drawPhase():void {
        if (!this.player.hand.isFull()) {
            var card = this.player.takeCard(this.deck);
            card.getStand().listener.push(this);
        }
    }

    private energyPhase():void {

    }

    private playPhase():void {

    }

    private standPhase(): void {
        for (var stand of this.getStands()) {
            if (stand.active) {
                stand.turnRed();
                console.log(stand.targets.length);
                for (var target of stand.targets) {
                    target.takeHit(stand.standAttack);
                    console.log("Stand attacked with " + stand.standAttack + "!");
                }
                stand.decreaseRoundsRemaining();
                if (stand.getRoundsRemaining() <= 0) {
                    stand.active = false;
                    for (var l of stand.listener) {
                        l.deactiveStand(stand);
                    }
                }
            }
        }
    }

    private enemyPhase():void {
        for (var stand of this.getStands()) {
            if (stand.active) {
                stand.turnNormal();
            }
        }
        this.enemies[this.waveCounter].map(e => e.attack(this.player, this.gameState));

    }

    private effectPhase():void {
    }

    private endOfRound():void {
        this.gameState.changeRound();

        this.curTurn++;
    }

    /**
     * Emits 'draw-phase' event to start the combat
     */
    public startCombat():void {
        this.curPhase = 0;
        this.curTurn = 0;
        this.nextWave(0);
    }

    /**
     * Returns the current phase as a number 0-4
     * 0 -> Draw Phase
     * 1 -> Energy Phase
     * 2 -> Play Phase
     * 3 -> Enemy Phase
     * 4 -> Effect Phase
     */
    public getPhase():number {
        return this.curPhase;
    }

    /**
     * return curTurn
     */
    public getTurnCount():number {
        return this.curTurn;
    }

    /**
     * sets curPhase and curTurn to 0
     */
    public resetGameLoop():void {
        this.resetPhase();
        this.resetTurnCount();
    }

    /**
     * sets curPhase to 0
     */
    public resetPhase():void {
        this.curPhase = -1;
    }

    /**
     * sets curTurn to 0
     */
    public resetTurnCount():void {
        this.curTurn = -1;
    }

    public getEnemies():Enemy[] {
        return this.enemies[this.waveCounter];
    }

    public getStands():Stand[] {
        return this.stands;
    }

    public getMaxWaveCount():number {
        return this.enemies[this.waveCounter].length;
    }

    enemyHpChanged(enemy:Enemy, changedFrom:number, changedTo:number): void {
        let aliveChange:number = 0;

        if (changedFrom <= 0 && changedTo > 0) {
            aliveChange = 1;
        } else if (changedFrom > 0 && changedTo <= 0) {
            aliveChange = -1;
        }

        this.aliveEnemiesCount += aliveChange;

        if (this.aliveEnemiesCount <= 0) {
            this.nextWave();
        }
    }

    public activateStand(stand: Stand) {}
    public deactiveStand(stand: Stand) {}
    public updateStandText(){}
    public turnRed(){}
    public turnNormal(){}
}

export interface GameStateListener {
    drawPhase(game:Mission):void;
    energyPhase(game:Mission):void;
    playPhase(game:Mission):void;
    standPhase(game:Mission):void;
    enemyPhase(game:Mission):void;
    effectPhase(game:Mission):void;
    storyDialog(game:Mission, dialog:StoryDialog):void;
    storyMonolog(game:Mission, monolog:string):void;
    waveChanged(game:Mission, activeWave:number, enemies:Enemy[]):void;
    gameover(game:Mission):void;
}