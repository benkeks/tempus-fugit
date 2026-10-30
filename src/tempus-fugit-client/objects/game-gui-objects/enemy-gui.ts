import {Enemy, EnemyListener} from "../game-objects/enemy";
import {ListGUI} from "./list-gui";
import Text = Phaser.GameObjects.Text;
import {ToolTip} from "./tool-tip";
import { Scene, Game } from "phaser";
import { MissionScene } from "../../scenes/mission-scene";
import { FormulaGUI } from "./formula-gui";
import { GameStateListener, GameState } from "../game-objects/game-state";
import { GameInfo } from "../../game";
import { formatEffectDescription } from "./effect-icon-text";
import type { CardAnimationPosition } from "../../animations/card-animation-registry";

/**
 * @author Mustafa
 */
export class EnemyGUI extends ListGUI implements EnemyListener, GameStateListener{
    
    public enemy: Enemy; // enemy object associated with this gui
    public toolTip!:ToolTip;
    public toolTipText!:Text;
    public formula!:FormulaGUI;
    public specialAttackShortText!: Phaser.GameObjects.GameObject;
    private removeEnemyListener: () => void;
    private removeGameStateListener: () => void;
    private properX: number;
    private properY: number;
    private dragOutlineVisible: boolean = false;
    private deathAnimationStarted: boolean = false;
    private deathRemovalTimer: Phaser.Time.TimerEvent | null = null;
    private bossDeathTween: Phaser.Tweens.Tween | null = null;
    private deathInfo: Phaser.GameObjects.Container | null = null;

    public scene:MissionScene;

    constructor(
        scene: MissionScene,
        enemy: Enemy,
        x: number = 1500,
        y: number = 500,
        texture?: string
    ) {
        super(scene, x, y);
        this.scene = scene;
        this.enemy = enemy;
        this.removeEnemyListener = this.enemy.addListener(this);
        this.removeGameStateListener = this.scene.tfgame.gameState.addListener(this);
        this.properX = x;
        this.properY = y;

        if (!texture) texture = enemy.image;

        this.addSpriteByTexture(texture);

        scene.anims.create({
            key: texture,
            frames: scene.anims.generateFrameNumbers(texture, {start:0}),
             frameRate: 10,
             repeat: -1
       });

        this.sprite.anims.play(texture);
        this.sprite.setDepth(100);
        this.sprite.setScale(GameInfo.scale);

        this.addText("");
        this.updateEnemyAttributes();

        // special attack
        if (enemy.specialAttack) {
            this.formula = new FormulaGUI(scene, enemy.specialAttack.getFormulaGuiString(), 0, this.getBounds().height, 2, true, false);
            this.formula.setPosition(-this.formula.getBounds().width/2, this.maxY + this.yPadding*2);
            this.add(this.formula);

            this.createSpecialAttackShortDescription();
            const gameState = this.scene && this.scene.tfgame ? this.scene.tfgame.gameState : undefined;
            const isActive = gameState ? gameState.evaluate(this.enemy.specialAttack) : false;
            this.updateSpecialAttackShortDescriptionColor(isActive);
        }

        this.setInteractive();
    }

    public initTooltips() {
        this.toolTip = new ToolTip(this.scene, 0, -GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 30), this.sprite);
        this.toolTip.addText(this.enemy.name, ListGUI.ALIGN_CENTRE, { fontSize: "22px", fontFamily: 'pressStart' });
        this.toolTipText = this.toolTip.addText(this.enemy.description, ListGUI.ALIGN_CENTRE, { fontSize: "16px", fontFamily: 'pressStart' }, true, 10);
        this.toolTip.addText("Special Attack", ListGUI.ALIGN_CENTRE, { fontSize: "16px", fontFamily: 'pressStart' });

        const hasBBCode = Boolean((this.scene as any).rexUI && (this.scene as any).rexUI.add && (this.scene as any).rexUI.add.BBCodeText);
        const specialAttackDescription = formatEffectDescription(this.scene, this.enemy.specialAttackDescription, hasBBCode);

        if (hasBBCode) {
            // @ts-ignore
            const iconText = this.scene.rexUI.add.BBCodeText(0, 0, specialAttackDescription, {
                fontFamily: 'pressStart',
                fontSize: '16px',
                color: '#FF0000',
                wrap: {
                    mode: 'word',
                    width: 400
                }
            });
            iconText.setLineSpacing(10);
            this.toolTip.addContainter(iconText, ListGUI.ALIGN_CENTRE, false);
        } else {
            this.toolTip.addText(specialAttackDescription, ListGUI.ALIGN_CENTRE, { fontSize: '16px', fontFamily: 'pressStart', color: '#FF0000' }, false, 10);
        }

        this.toolTip.fixedMaxTextWidth = true;
        this.toolTip.maxTextWidth = 400;
        this.toolTip.revalidate();
        this.add(this.toolTip);

        if (this.formula) {
            this.bindTooltipToGameObject(this.formula.tintRect ? this.formula.tintRect : this.formula);
        }
    }

    private bindTooltipToGameObject(gameObject: Phaser.GameObjects.GameObject): void {
        if (!gameObject || !this.toolTip) return;

        const interactiveObject: any = gameObject as any;
        if (typeof interactiveObject.setInteractive !== 'function') return;

        interactiveObject
            .setInteractive()
            .on('pointerover', () => {
                if (!this.toolTip.enabled) return;
                if (this.toolTip.faderTimer) this.toolTip.faderTimer.remove(false);
                this.toolTip.faderTimer = this.scene.time.delayedCall(this.toolTip.popUpDelay, this.toolTip.fadeIn, [], this.toolTip);
            }, this)
            .on('pointerout', () => {
                if (!this.toolTip.enabled) return;
                if (this.toolTip.faderTimer) this.toolTip.faderTimer.destroy();
                this.toolTip.fadeOut();
            }, this);
    }

    public disableListeners():void {
        if (this.removeEnemyListener) this.removeEnemyListener();
        if (this.removeGameStateListener) this.removeGameStateListener();
    }

    public die():void {
        if (this.deathAnimationStarted) {
            this.destroy(true);
            return;
        }

        this.playDeathAnimation();
    }

    public destroy(fromScene?: boolean): void {
        if (this.isDestroyed) return;
        this.isDestroyed = true;
        if (this.deathRemovalTimer) {
            this.deathRemovalTimer.remove(false);
            this.deathRemovalTimer = null;
        }
        if (this.bossDeathTween) {
            this.bossDeathTween.stop();
            this.bossDeathTween = null;
        }
        if (this.deathInfo) {
            this.scene.tweens.killTweensOf(this.deathInfo);
            this.deathInfo.destroy();
            this.deathInfo = null;
        }
        this.disableListeners();
        super.destroy(fromScene);
    }

    private fadeDeathInfo(): void {
        const children = this.getAll().filter(child => child !== this.sprite && child !== this.toolTip);
        if (children.length === 0) return;

        const transform = this.getWorldTransformMatrix();
        this.remove(children);
        const info = this.scene.add.container(transform.tx, transform.ty, children);
        info.setRotation(transform.rotation).setScale(transform.scaleX, transform.scaleY).setDepth(this.depth);
        this.deathInfo = info;

        this.scene.tweens.add({
            targets: info,
            alpha: 0,
            scaleX: info.scaleX * 0.5,
            scaleY: info.scaleY * 0.5,
            duration: 180,
            ease: "Cubic.easeIn",
            onComplete: () => {
                info.destroy();
                this.deathInfo = null;
            }
        });
    }

    public updateEnemyAttributes():void {
        this.setText(0, "\u2694 " + this.enemy.baseAttack + "   \u2764 " + this.enemy.currentHP);
    }

    public updateTint(gameState:GameState) {
        if (this.isDestroyed || !this.formula || !(this.formula as any).scene) return;

        const isActive = gameState.evaluate(this.enemy.specialAttack);
        this.formula.tintGraphics.setVisible(!isActive);
        this.updateSpecialAttackShortDescriptionColor(isActive);
    }

    public setDragOutline(color: number): void {
        if (this.isDestroyed || this.deathAnimationStarted || !this.enemy.isAlive() || !this.sprite || !(this.sprite as any).scene) return;

        if (!this.dragOutlineVisible) {
            this.sprite.setPostPipeline('rexOutlinePostFx');
            this.dragOutlineVisible = true;
        }

        const pipeline = this.sprite.getPostPipeline('rexOutlinePostFx') as Phaser.Renderer.WebGL.Pipelines.PostFXPipeline & { setThickness(n: number): unknown; setOutlineColor(c: number): unknown };
        pipeline.setOutlineColor(color);
        pipeline.setThickness(4);
    }

    public clearDragOutline(): void {
        if (!this.dragOutlineVisible || !this.sprite || !(this.sprite as any).scene) return;

        this.sprite.removePostPipeline('rexOutlinePostFx');
        this.dragOutlineVisible = false;
    }

    private isSmallEnemy(): boolean {
        return !this.enemy.size || this.enemy.size[0] <= 32;
    }

    public isHovered(xCursor: number, yCursor: number): boolean {
        return this.enemy.isAlive() && !this.deathAnimationStarted && super.isHovered(xCursor, yCursor);
    }

    private playDeathAnimation(): void {
        if (this.isDestroyed || this.deathAnimationStarted) return;

        const smallEnemy = this.isSmallEnemy();
        this.deathAnimationStarted = true;

        if (this.sprite && this.sprite.anims) {
            this.sprite.anims.stop();
        }

        this.clearDragOutline();
        this.disableInteractive();
        if (this.toolTip) {
            this.toolTip.enabled = false;
        }
        this.disableListeners();
        this.fadeDeathInfo();

        if (this.enemy.key === "boss") {
            this.playBossDeathAnimation();
            return;
        }

        if (smallEnemy) {
            const startX = this.x;
            const startY = this.y;
            const durationSeconds = 0.52;
            const horizontalDistance = 260;
            const horizontalSpeed = horizontalDistance / durationSeconds;
            const initialVerticalSpeed = -260;
            const gravity = 1400;

            this.scene.trackCombatAnimation(this.scene.tweens.addCounter({
                from: 0,
                to: durationSeconds,
                duration: durationSeconds * 1000,
                ease: "Linear",
                onUpdate: tween => {
                    const t = tween.getValue() as number;
                    this.x = startX + horizontalSpeed * t;
                    this.y = startY + initialVerticalSpeed * t + 0.5 * gravity * t * t;
                }
            }));
        } else {
            const waveEnemies = this.scene.tfgame.getEnemies();
            this.deathRemovalTimer = this.scene.time.delayedCall(1000, () => {
                this.deathRemovalTimer = null;
                if (waveEnemies.some(enemy => enemy.isAlive())) this.destroy(true);
            });
        }

        this.scene.trackCombatAnimation(this.scene.tweens.add({
            targets: this.sprite,
            angle: { from: this.sprite.angle, to: 90 },
            duration: smallEnemy ? 520 : 700,
            ease: "Cubic.easeIn",
            onComplete: () => {
                if (this.isDestroyed) return;
                if (!smallEnemy) {
                    return;
                }

                this.destroy(true);
            }
        }));
    }

    private playBossDeathAnimation(): void {
        const startX = this.x;
        const startY = this.y;
        const endY = -this.getBounds().height;
        const startAngle = this.angle;

        this.bossDeathTween = this.scene.trackCombatAnimation(this.scene.tweens.addCounter({
            from: 0,
            to: 1,
            duration: 1200,
            ease: "Cubic.easeIn",
            onUpdate: tween => {
                const progress = tween.getValue();
                const phase = progress * Math.PI * 6;
                const radius = 160 * Math.sin(progress * Math.PI);
                this.x = startX + Math.sin(phase) * radius;
                this.y = startY + (endY - startY) * progress;
                this.angle = startAngle + 1080 * progress;
            },
            onComplete: () => {
                this.bossDeathTween = null;
                this.destroy(true);
            }
        }));
    }

    private createSpecialAttackShortDescription(): void {
        if (!this.formula || !this.enemy.specialAttackShortDescription) return;

        const hasBBCode = Boolean((this.scene as any).rexUI && (this.scene as any).rexUI.add && (this.scene as any).rexUI.add.BBCodeText);
        const formatted = formatEffectDescription(this.scene, this.enemy.specialAttackShortDescription, hasBBCode);

        const rexScene: any = this.scene as any;
        const shortText: any = hasBBCode
            ? rexScene.rexUI.add.BBCodeText(0, 0, formatted, { fontFamily: 'pressStart', fontSize: '16px', color: '#777777' })
            : this.scene.add.text(0, 0, formatted, { fontFamily: 'pressStart', fontSize: '16px', color: '#777777' });

        shortText.setOrigin(1, 0.5);
        shortText.setPosition(this.formula.x - 28, this.formula.y);
        this.add(shortText);
        this.specialAttackShortText = shortText;
    }

    private updateSpecialAttackShortDescriptionColor(isActive: boolean): void {
        if (!this.specialAttackShortText) return;

        const color = isActive ? '#FF0000' : '#777777';
        const shortText: any = this.specialAttackShortText;

        if (!shortText.active || !shortText.scene) return;

        try {
            if (typeof shortText.setColor === 'function')
                shortText.setColor(color);
            else if (shortText.style && typeof shortText.style.setColor === 'function')
                shortText.style.setColor(color);
        } catch (e) {
            return;
        }
    }

    public reposition() {
        if (this.deathAnimationStarted) return;
        this.x = this.properX;
        this.y = this.properY;
    }

    public getEffectPosition(): CardAnimationPosition {
        const center = this.sprite.getCenter(undefined, true);
        return {x: center.x, y: center.y, groundY: this.sprite.getBottomCenter(undefined, true).y, sprite: this.sprite};
    }

    /**
     * change HP display of enemy
     * @param changedTo
     */
    async enemyHpChanged(enemy:Enemy, changedFrom:number, changedTo:number) {
        let font1: Object = { fontSize: '50px', fontFamily: 'pressStart', color: '#FF0000' }
        let diff = changedFrom - changedTo;
        if (diff >= 0) {
            const damageAnimation = this.scene.getCardDamageAnimation(enemy);
            if (damageAnimation) {
                this.scene.trackCombatAnimation(damageAnimation(this.scene, this.sprite));
            } else {
                this.scene.trackCombatAnimation(this.scene.tweens.add({
                    targets: this.sprite,
                    angle: { from: 0, to: 10 },
                    duration: 150,
                    ease: "Linear",
                    yoyo: true,
                    repeat: 0
                }));
            }

            let damageText = this.scene.add.text(this.x-20, this.y-50, diff.toString(), font1);
            this.scene.tweens.add({targets: damageText ,duration: 600, y: damageText.y-40, ease: "Linear", delay: 500,
            onComplete: function () {
                damageText.destroy()
            }});
            if (!damageAnimation) {
                let blood = this.scene.add.sprite(this.x, this.y+30, "blood");
                blood.alpha = 0;
                this.scene.tweens.add({targets: blood ,duration: 200, alpha: 1, ease: "power2", yoyo: true,
                    onComplete: function () {
                        blood.destroy()
                    }});
            }
        }

        if (changedFrom > 0 && changedTo <= 0) {
            this.playDeathAnimation();
        }else this.updateEnemyAttributes();
    }

    async Attacking(enemy: Enemy, specialAttackActive: boolean) {
        const animation = enemy.specialAttack?.animation;
        if (animation && this.scene.tfgame.cardActionAnimator?.has(animation)) return;
        this.scene.createAttackAnimation(this.scene, this, "-", 100, specialAttackActive ? 1 : 0);
    }

    async baseAttackChanged(enemy:Enemy) {
        this.updateEnemyAttributes();
    }

    roundChanged(gameState: import("../game-objects/game-state").GameState, lastRound: number, activeRound: number) {
        this.updateTint(gameState);
    }
    async variableChanged(gameState: import("../game-objects/game-state").GameState, oldVariable: import("../../temporal-logic/variable").Variable, variable: import("../../temporal-logic/variable").Variable, valueChanges: { [state: number]: boolean; }) {
        this.updateTint(gameState);
    }
    energyChanged(gameState: import("../game-objects/game-state").GameState, oldEnergy: number, newEnergy: number, oldMaxEnergy: number, newMaxEnergy: number) {
    }
    activated(gameState: import("../game-objects/game-state").GameState) {
    }

}
