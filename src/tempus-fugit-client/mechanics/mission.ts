import EventEmitter = Phaser.Events.EventEmitter;
import {Deck} from "../objects/game-objects/deck";
import {Player} from "../objects/game-objects/player";
import {GameState} from "../objects/game-objects/game-state";
import {Enemy, EnemyListener} from "../objects/game-objects/enemy";
import {StoryDialog} from "./story-dialog";
import Map = Phaser.Structs.Map;
import {Card} from "../objects/game-objects/card";

export class Mission implements EnemyListener {
    get enemies(): Enemy[][]  {
        return this._enemies;
    }

    set enemies(value:Enemy[][]) {
        this._enemies = value;

        for (let i in value) {
            let eList:Enemy[] = value[i];

            eList.map(e => e.listener.push(this))
        }
    }
    
    public pushStand(stand: Card) {
        this.stands.push(stand);
    }

    public static Missions: {[name:string]:Mission} = {};
    public name: string;
    public background: string;
    public waveCounter: number;
    public _enemies: Enemy[][] = [];
    public monologue: {[wave: string]: string} = {};
    public dialogue: StoryDialog[] = [];

    public readonly numPhases:number = 5;
    public curPhase: number;
    public emitter: EventEmitter;
    public curTurn: number;
    public toPhase: Map<number, string>;
    public aliveEnemiesCount:number = -1;

    public listener:GameStateListener[] = [];

    public deck:Deck;
    public player:Player;
    public gameState:GameState;

    private stands:Card[] = [];
    // TODO: effect list

    public copy():Mission {
        let mission:Mission = new Mission();
        mission.enemies = this.enemies;
        mission.name = this.name;
        mission.background = this.background;
        mission.monologue = this.monologue;
        mission.dialogue = this.dialogue;
        mission.gameState = this.gameState;
        mission.stands = this.stands;

        return mission;
    }

    constructor() {
        this.curPhase = 0;
        this.emitter = new EventEmitter();
        this.curTurn = 0;
        this.waveCounter = 0;

        this.listener = [];

        this.toPhase = new Map<number,string>([]);
        this.toPhase.set(0, 'draw-phase');
        this.toPhase.set(1, 'energy-phase');
        this.toPhase.set(2, 'play-phase');
        this.toPhase.set(3, 'stand-phase');
        this.toPhase.set(4, 'enemy-phase');
        this.toPhase.set(5, 'effect-phase');


        this.gameState = new GameState();
        this.gameState.maxEnergy = 2;
        this.gameState.setVariable("l", false);
        this.gameState.setVariable("t", false);
        this.gameState.setVariable("n", false);
        this.gameState.setVariable("s", false);
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
        this.gameState.active = false;

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

    public nextWave(next:number = this.waveCounter+1):void {
        this.waveCounter = next;

        this.listener.map(l => l.storyMonolog(this, this.monologue[this.waveCounter]));

        if (this.waveCounter >= this.getMaxWaveCount()) {
            this.listener.map(l => l.gameover(this));
            return;
        }

        this.aliveEnemiesCount = this.getEnemies().length;
        this.nextPhase(0);
        this.listener.map(l => l.waveChanged(this, next, this.getEnemies()));
    }

    private drawPhase():void {
        if (!this.player.hand.isFull()) {
            var card = this.player.takeCard(this.deck);
        }
    }

    private energyPhase():void {
        this.gameState.active = true;
    }

    private playPhase():void {

    }

    private standPhase(): void {
        for (var stand of this.getStands()) {
            stand.turnRed();
            stand.act(this, this.player);
            if (stand.getRoundsRemaining() <= 0) {
                for (var l of stand.listener) {
                    l.deactiveStand(stand);
                }
                for(var i = 0; i < this.stands.length; i++){
                    if ( this.stands[i] === stand) {
                        this.stands.splice(i, 1);
                    }
                };
            }
        }
    }

    private enemyPhase():void {
        for (var stand of this.stands) {
                stand.turnNormal();
        }
        this.getEnemies().map(e => e.applyCard(e.specialAttack, this));

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
        let i = this.waveCounter;
        console.log(this.waveCounter);
        if (i < 0 || i > this.enemies.length) {
            return [];
        }

        return this.enemies[i];
    }

    public getStands():Card[] {
        return this.stands;
    }

    public getMaxWaveCount():number {
        return this.enemies.length;
    }

    async enemyHpChanged(enemy:Enemy, changedFrom:number, changedTo:number) {
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

    public static createFromJSON(jString): void {
        let json = JSON.parse(jString);
        for (let m of json.missions) {
            let mission = new Mission();
            mission.name = m.name;
            mission.background = m.background;
            for (let wave of m.enemies) {
                let wave_enemies:Enemy[] = [];
                for (let e of wave) {
                    wave_enemies.push(Enemy.enemies[e].copy());
                }
                mission.enemies.push(wave_enemies);
            }

            mission.monologue = m.monologue;

            for (let dial of m.dialogue) {
                let sd: StoryDialog = new StoryDialog(dial.text);
                sd.triggerFunctionString = dial.triggerFunctionString;
                sd.parsetriggerFunctionString();
                mission.dialogue.push(sd);
            }

            this.Missions[m.name] = mission;
          }
    }

    public async activateStand(stand: Card) {}
    public async deactiveStand(stand: Card) {}
    public async updateStandText(){}
    public async turnRed(){}
    public async turnNormal(){}
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