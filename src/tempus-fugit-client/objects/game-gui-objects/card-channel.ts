import Container = Phaser.GameObjects.Container;
import Graphics = Phaser.GameObjects.Graphics;
import ParticleEmitter = Phaser.GameObjects.Particles.ParticleEmitter;
import {GameInfo} from "../../game";
import {DecisionArrow} from "./decision-arrow";
import {MissionScene} from "../../scenes/mission-scene";
import ParticleEmitterManager = Phaser.GameObjects.Particles.ParticleEmitterManager;
import {CardGUI} from "./card-gui";
import Tween = Phaser.Tweens.Tween;
import {EnemyGUI} from "./enemy-gui";

export class CardChannel extends Container{

    public decisionArrow:DecisionArrow;

    public color:number = 0xFFFFFF;

    public dot:Graphics;
    public dotParticles:ParticleEmitterManager;

    public fadeOutDuration:number = 500;
    public fadeOutParticles = undefined;
    public emitter = undefined;
    public channeled:boolean;

    public missionScene:MissionScene;

    constructor(scene:MissionScene,
                x:number = 50,
                y:number = 60) {
        super(scene);
        scene.add.existing(this);
        this.missionScene = scene;

        this.dot = scene.add.graphics({x:0, y:0});
        this.dot.lineStyle(5, this.color, 1);
        this.dot.strokeCircle(0, 0, 50);

        this.dotParticles = scene.add.particles("blue");
        this.dotParticles.createEmitter({
            x: 0,
            y: 0,
            speed: 100,
            lifespan: { min: 300, max: 400 },
            blendMode: 'ADD',
            scaleX : 0.3,
            scaleY : 0.3
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
        this.scene.input.on(
            "drag",
            function(
                pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.Sprite
            ) {
                if (!(gameObject instanceof CardGUI)) return;
                this.missionScene.enableToolTips(false);

                if (pointer.y < this.y) {
                    if (!this.channeled) {
                            this.fadeOut = this.missionScene.add.tween({ // fade out
                                targets: gameObject,
                                alpha: {from: 1, to: 0},
                                ease: "Linear",
                                duration: this.fadeOutDuration,
                                repeat: 0,
                                yoyo: false
                            });

                            this.dotParticles.setVisible(true);
                        if (this.fadeOutParticles) this.fadeOutParticles.destroy(true);
                        this.fadeOutParticles = this.missionScene.add.particles("blue");

                        let x:number = gameObject.x-gameObject.displayWidth*gameObject.originX;
                        let y:number = gameObject.y-gameObject.displayHeight*gameObject.originY;
                        this.emitter = this.fadeOutParticles.createEmitter({
                            x: {
                                min: x,
                                max: x + gameObject.displayWidth
                            },
                            y:{
                                min: y,
                                max: y + gameObject.displayHeight
                            },
                            speed: 400,
                            lifespan: 500,
                            blendMode: 'ADD',
                            scaleX: 0.3,
                            scaleY: 0.3,
                            moveToX: this.x,
                            moveToY: this.y,
                            deathCallback: function() {
                                if (this.emitter.getParticleCount() == 0) {
                                    this.fadeOutParticles.destroy(true);
                                    this.fadeOutParticles = undefined;
                                }
                            },
                            deathCallbackScope:this
                        });

                        this.missionScene.time.delayedCall(this.fadeOutDuration, function() {
                            this.emitter.setQuantity(0);
                        }, [], this);
                        this.channeled = true;
                    }

                    this.decisionArrow.updateDrag(pointer);
                } else {
                    if (this.channeled) {
                        this.reEmitCard(gameObject);
                    }

                    if (this.fadeOutParticles) {
                        let x:number = gameObject.x-gameObject.displayWidth*gameObject.originX;
                        let y:number = gameObject.y-gameObject.displayHeight*gameObject.originY;

                        this.emitter.moveToX.propertyValue =  (x + x+gameObject.displayWidth)/2;
                        //console.log(this.emitter.moveToX);
                        this.emitter.moveToY.propertyValue = (y + y+gameObject.displayHeight)/2;
                    }

                    gameObject.setPosition(pointer.x, pointer.y); // dragging cards
                }
            }, this);

        this.scene.input.on(
            "dragend",
            function(
                pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.Sprite
            ) {
                this.decisionArrow.setVisible(false);
                this.missionScene.enableToolTips(true);

                if (!(gameObject instanceof CardGUI)) return;

                this.scene.input.activePointer.smoothFactor = 0;
                this.scene.sys.canvas.style.cursor = "default";

                let e = this.cursorHoversEnemy(pointer.x, pointer.y);
                if (e) {
                    // TODO: remove card from hand
                    this.playCard(e, gameObject);
                } else {
                    if (pointer.y < this.y) this.reEmitCard(gameObject);
                    gameObject.setPosition(GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 30), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 80))
                }
            }, this);
    }

    public cursorHoversEnemy(xCursor:number, yCursor:number):EnemyGUI {
        for (let e of this.missionScene.enemyGUI.enemies) {
            if (e.isHovered(xCursor, yCursor)) {
                return e;
            }
        }
        return undefined;
    }

    public playCard(enemy:EnemyGUI, card:CardGUI) {
        this.missionScene.tfgame.player.applyCard(card.card, enemy.enemy, this.missionScene.gameStateGUI.gameState, this.missionScene.tfgame);
    }

    public reEmitCard(gameObject):void {
        this.missionScene.add.tween({ // fade in
            targets: gameObject,
            alpha: {from: 0, to: 1},
            ease: "Linear",
            duration: this.fadeOutDuration,
            repeat: 0,
            yoyo: false
        });


        this.dotParticles.setVisible(false);
        if (this.fadeOutParticles) this.fadeOutParticles.destroy(true);
        this.fadeOutParticles = this.missionScene.add.particles("blue");

        let x:number = gameObject.x-gameObject.displayWidth*gameObject.originX;
        let y:number = gameObject.y-gameObject.displayHeight*gameObject.originY;
        this.emitter = this.fadeOutParticles.createEmitter({
            x:this.x,
            y:this.y,
            speed: 400,
            lifespan: 500,
            blendMode: 'ADD',
            scaleX: 0.3,
            scaleY: 0.3,
            moveToX: 0,
            moveToY: 0,
            deathCallback: function() {
                if (this.emitter.getParticleCount() == 0) {
                    this.fadeOutParticles.destroy(true);
                    this.fadeOutParticles = undefined;
                }
            },
            deathCallbackScope:this,
        });

        this.missionScene.time.delayedCall(this.fadeOutDuration, function() {
            this.emitter.setQuantity(0);
        }, [], this);

        this.decisionArrow.setVisible(false);
        this.channeled = false;
    }

}