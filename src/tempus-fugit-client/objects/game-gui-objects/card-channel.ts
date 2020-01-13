import Container = Phaser.GameObjects.Container;
import Graphics = Phaser.GameObjects.Graphics;
import { GameInfo } from "../../game";
import { DecisionArrow } from "./decision-arrow";
import { MissionScene } from "../../scenes/mission-scene";
import ParticleEmitterManager = Phaser.GameObjects.Particles.ParticleEmitterManager;
import { CardGUI } from "./card-gui";
import { Card } from "../game-objects/card";
import { EnemyGUI } from "./enemy-gui";
import { Mission } from "../../mechanics/mission";
import { HandGUI } from "./hand-gui";
export class CardChannel extends Container {

    public decisionArrow: DecisionArrow;

    public color: number = 0xFFFFFF;

    public dot: Graphics;
    public dotParticles: ParticleEmitterManager;

    public fadeOutDuration: number = 500;
    public fadeOutParticles = undefined;
    public emitter = undefined;
    public channeled: boolean;

    public missionScene: MissionScene;

    constructor(scene: MissionScene,
        x: number = 50,
        y: number = 60) {
        super(scene);
        scene.add.existing(this);
        this.missionScene = scene;

        this.dot = scene.add.graphics({ x: 0, y: 0 });
        this.dot.lineStyle(5, this.color, 1);
        this.dot.strokeCircle(0, 0, 50);

        this.dotParticles = scene.add.particles("runes");
        this.dotParticles.createEmitter({
            frame: {frames: [0,1,2,3]},
            x: 0,
            y: 0,
            speed: 100,
            lifespan: { min: 300, max: 400 },
            blendMode: 'ADD',
            scaleX: 1,
            scaleY: 1
        });

        this.dotParticles.setVisible(false);

        this.decisionArrow = new DecisionArrow(scene);

        this.add(this.dotParticles);
        this.add(this.dot);

        this.setPosition(GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, x), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, y));
        this.decisionArrow.setPosition(this.x, this.y);

        this.initEvents();
    }

    private initEvents() {

        // The distance, in pixels, a pointer has to move while being held down, before it thinks it is being dragged.
        //  The pointer has to move 100 pixels before it's considered as a drag
        this.scene.input.dragDistanceThreshold = 100;

        this.scene.input.on(
            "drag",
            function (
                pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.Sprite
            ) {
                console.log('card drag');
                if (!(gameObject instanceof CardGUI)) return;
                let card: Card = (gameObject as CardGUI).card;
                this.missionScene.enableToolTips(false);

                if (pointer.y < this.y) {
                    if (!this.channeled) {
                        this.emitCard(gameObject);

                        this.channeled = true;
                    }

                    if (card.getKind() == Card.DIRECTED) this.decisionArrow.updateDrag(pointer);
                } else {
                    if (this.channeled) {
                        this.reEmitCard(gameObject);
                    }

                    if (this.fadeOutParticles) {
                        let x: number = gameObject.x - gameObject.displayWidth * gameObject.originX;
                        let y: number = gameObject.y - gameObject.displayHeight * gameObject.originY;

                        this.emitter.moveToX.propertyValue = (x + x + gameObject.displayWidth) / 2;
                        //console.log(this.emitter.moveToX);
                        this.emitter.moveToY.propertyValue = (y + y + gameObject.displayHeight) / 2;
                    }

                    gameObject.setPosition(pointer.x, pointer.y); // dragging cards
                    gameObject.setAngle(0);
                }
            }, this);

        this.scene.input.on(
            "dragend",
            function (
                pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.Sprite
            ) {
                this.decisionArrow.setVisible(false);
                this.dotParticles.setVisible(false);
                this.missionScene.enableToolTips(true);

                if (!(gameObject instanceof CardGUI)) return;
                let card: Card = (gameObject as CardGUI).card;

                this.scene.input.activePointer.smoothFactor = 0;
                this.scene.sys.canvas.style.cursor = "default";

                let e = this.cursorHoversEnemy(pointer.x, pointer.y);
                if (e || (card.getKind() != Card.DIRECTED && pointer.y > this.y)) {
                    this.missionScene.handGUI.removeCard(gameObject.card);
                    this.playCard(e, gameObject);
                } else {
                    if (pointer.y < this.y) this.reEmitCard(gameObject);
                    //gameObject.setPosition(GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 30), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 80))
                    this.missionScene.handGUI.unhoverAll(true);
                }

            }, this);

        // card is displayed bigger when hovered
        this.scene.input.on('pointerover', function (
            pointer: Phaser.Input.Pointer,
            gameObject: Phaser.GameObjects.Sprite
        ) {
            if (gameObject[0] instanceof CardGUI)
                this.missionScene.handGUI.toggleHovering(gameObject[0], false);

        }, this);

        this.scene.input.on('pointerout', function (
            pointer: Phaser.Input.Pointer,
            gameObject: Phaser.GameObjects.Sprite
        ) {

            if (gameObject[0] instanceof CardGUI)
                this.missionScene.handGUI.toggleHovering(gameObject[0], true);

        }, this);
    }

    public cursorHoversEnemy(xCursor: number, yCursor: number): EnemyGUI {
        for (let e of this.missionScene.enemyGUI.enemies) {
            if (e.isHovered(xCursor, yCursor)) {
                return e;
            }
        }
        return undefined;
    }

    public playCard(enemy: EnemyGUI, card: CardGUI) {
        let e = undefined;
        if (enemy != undefined) e = enemy.enemy;

        this.missionScene.tfgame.player.applyCard(card.card, e, this.missionScene.tfgame);
    }

    public emitCard(gameObject):void {
        this.missionScene.add.tween({ // fade out
            targets: gameObject,
            alpha: { from: 1, to: 0 },
            ease: "Linear",
            duration: this.fadeOutDuration,
            repeat: 0,
            yoyo: false
        });

        this.dotParticles.setVisible(true);
        if (this.fadeOutParticles) this.fadeOutParticles.destroy(true);
        this.fadeOutParticles = this.missionScene.add.particles("runes");

        let x: number = gameObject.x - gameObject.displayWidth * gameObject.originX;
        let y: number = gameObject.y - gameObject.displayHeight * gameObject.originY;
        this.emitter = this.fadeOutParticles.createEmitter({
            frame: {frames: [0,1,2,3],cyle:true},
            x: {
                min: x,
                max: x + gameObject.displayWidth
            },
            y: {
                min: y,
                max: y + gameObject.displayHeight
            },
            speed: 400,
            lifespan: 500,
            blendMode: 'ADD',
            moveToX: this.x,
            moveToY: this.y,
            deathCallback: function () {
                if (this.emitter.getParticleCount() == 0) {
                    this.fadeOutParticles.destroy(true);
                    this.fadeOutParticles = undefined;
                }
            },
            deathCallbackScope: this
        });

        this.missionScene.time.delayedCall(this.fadeOutDuration, function () {
            this.emitter.setQuantity(0);
        }, [], this);
    }

    public reEmitCard(gameObject): void {
        this.missionScene.add.tween({ // fade in
            targets: gameObject,
            alpha: { from: 0, to: 1 },
            ease: "Linear",
            duration: this.fadeOutDuration,
            repeat: 0,
            yoyo: false
        });

        if (this.fadeOutParticles) this.fadeOutParticles.destroy(true);
        this.fadeOutParticles = this.missionScene.add.particles("runes");

        let x: number = gameObject.x - gameObject.displayWidth * gameObject.originX;
        let y: number = gameObject.y - gameObject.displayHeight * gameObject.originY;
        this.emitter = this.fadeOutParticles.createEmitter({
            frame: {frames: [0,1,2,3],cyle:true},
            x: this.x,
            y: this.y,
            speed: 400,
            lifespan: 500,
            blendMode: 'ADD',
            moveToX: 0,
            moveToY: 0,
            deathCallback: function () {
                if (this.emitter.getParticleCount() == 0) {
                    this.fadeOutParticles.destroy(true);
                    this.fadeOutParticles = undefined;
                }
            },
            deathCallbackScope: this,
        });

        this.missionScene.time.delayedCall(this.fadeOutDuration, function () {
            this.emitter.setQuantity(0);
        }, [], this);

        this.decisionArrow.setVisible(false);
        this.channeled = false;
    }

}