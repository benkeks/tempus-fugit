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

/**
 * @author Mustafa
 */
export class EnemyGUI extends ListGUI implements EnemyListener, GameStateListener{
    
    public enemy: Enemy; // enemy object associated with this gui
    public toolTip:ToolTip;
    public toolTipText:Text;
    public formula:FormulaGUI;
    public specialAttackShortText: Phaser.GameObjects.GameObject;
    private properX: number;
    private properY: number;

    public scene:MissionScene;

    constructor(
        scene: MissionScene,
        enemy: Enemy,
        x: number = 1500,
        y: number = 500,
        texture:string=undefined
    ) {
        super(scene, x, y);
        this.scene = scene;
        this.enemy = enemy;
        this.enemy.listener.push(this);
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
            .on('pointerover', function () {
                if (!this.toolTip.enabled) return;
                this.toolTip.faderTimer = this.scene.time.delayedCall(this.toolTip.popUpDelay, this.toolTip.fadeIn, [], this.toolTip);
            }, this)
            .on('pointerout', function () {
                if (!this.toolTip.enabled) return;
                if (this.toolTip.faderTimer) this.toolTip.faderTimer.destroy();
                this.toolTip.fadeOut();
            }, this);
    }

    public disableListeners():void {
        this.enemy.removeListener(this);
    }

    public die():void {
        if (this.isDestroyed) return;

        this.scene.add.tween({ // fade out
            targets: this,
            alpha: { from: 1, to: 0 },
            ease: "Linear",
            duration: 200,
            repeat: 0,
            yoyo: false,
            onComplete: function () {
                this.isDestroyed = true;
                this.destroy(true);
                this.toolTip.destroy(true);
            },
            callbackScope: this
        });
        this.disableInteractive();
        this.toolTip.enabled = false;

        this.disableListeners();
    }

    public updateEnemyAttributes():void {
        this.setText(0, "\u2694 " + this.enemy.baseAttack + "   \u2764 " + this.enemy.currentHP);
    }

    public updateTint(gameState:GameState) {
        if (!this.formula) return;

        const isActive = gameState.evaluate(this.enemy.specialAttack);
        this.formula.tintGraphics.setVisible(!isActive);
        this.updateSpecialAttackShortDescriptionColor(isActive);
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

        if (typeof shortText.setColor === 'function') shortText.setColor(color);
        else if (shortText.style && typeof shortText.style.setColor === 'function') shortText.style.setColor(color);
    }

    public reposition() {
        this.x = this.properX;
        this.y = this.properY;
    }

    /**
     * change HP display of enemy
     * @param changedTo
     */
    async enemyHpChanged(enemy:Enemy, changedFrom:number, changedTo:number) {
        let font1: Object = { fontSize: '50px', fontFamily: 'pressStart', color: '#FF0000' }
        let diff = changedFrom - changedTo;
        if (diff >= 0) {
            let damageText = this.scene.add.text(this.x-20, this.y-50, diff.toString(), font1);
            this.scene.tweens.add({targets: damageText ,duration: 600, y: damageText.y-40, ease: "Linear", delay: 500,
            onComplete: function () {
                damageText.destroy()
            }});
            let blood = this.scene.add.sprite(this.x, this.y+30, "blood");
            //blood.setScale(0.2,0.2);
            blood.alpha = 0;
            this.scene.tweens.add({targets: blood ,duration: 200, alpha: 1, ease: "power2", yoyo: true,
                onComplete: function () {
                    blood.destroy()
                }});
        }

        if (changedFrom > 0 && changedTo <= 0) {
            this.die();
        }else this.updateEnemyAttributes();
    }

    async Attacking(enemy: Enemy) {
        this.scene.createAttackAnimation(this.scene, this, "-");
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
