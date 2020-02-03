import {Enemy, EnemyListener} from "../game-objects/enemy";
import {ListGUI} from "./list-gui";
import Text = Phaser.GameObjects.Text;
import {ToolTip} from "./tool-tip";
import { Scene, Game } from "phaser";
import { MissionScene } from "../../scenes/mission-scene";
import { FormulaGUI } from "./formula-gui";
import { GameStateListener, GameState } from "../game-objects/game-state";
import { GameInfo } from "../../game";

/**
 * @author Mustafa
 */
export class EnemyGUI extends ListGUI implements EnemyListener, GameStateListener{
    
    public enemy: Enemy; // enemy object associated with this gui
    public toolTip:ToolTip;
    public toolTipText:Text;
    public formula:FormulaGUI;

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

        if (!texture) texture = enemy.image;

        this.addSpriteByTexture(texture);

        scene.anims.create({
            key: texture,
            frames: scene.anims.generateFrameNumbers(texture, {start:0}),
             frameRate: 10,
             repeat: -1
       });

        this.sprite.anims.play(texture);
        this.sprite.setScale(GameInfo.scale);

        this.addText("");
        this.updateEnemyAttributes();

        // special attack
        if (enemy.specialAttack) {
            this.formula = new FormulaGUI(scene, enemy.specialAttack.getFormulaGuiString(), 0, this.getBounds().height, 2, true, false);
            this.formula.setPosition(-this.formula.getBounds().width/2, this.maxY + this.yPadding*2);
            this.add(this.formula);
        }

        this.setInteractive();

        this.toolTip = new ToolTip(scene, 0, -GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 30), this.sprite);
        this.toolTip.addText(enemy.name, ListGUI.ALIGN_CENTRE, { fontSize: "22px", fontFamily: 'pressStart' });
        this.toolTipText = this.toolTip.addText(enemy.description, ListGUI.ALIGN_CENTRE, { fontSize: "16px", fontFamily: 'pressStart' }, true, 10);
        this.toolTip.addText("Special Attack", ListGUI.ALIGN_CENTRE, { fontSize: "16px", fontFamily: 'pressStart' });
        this.toolTip.addText(enemy.specialAttackDescription, ListGUI.ALIGN_CENTRE, { fontSize: '16px', fontFamily: 'pressStart', color: '#FF0000' }, false, 10);
        this.toolTip.fixedMaxTextWidth = true;
        this.toolTip.maxTextWidth = 400;
        this.toolTip.revalidate();
        this.add(this.toolTip);
    }

    public disableListeners():void {
        this.enemy.removeListener(this);
    }

    public die():void {
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
            onCompleteScope: this
        });
        this.disableInteractive();
        this.toolTip.enabled = false;

        this.disableListeners();
    }

    public updateEnemyAttributes():void {
        this.setText(0, "\u2694 " + this.enemy.baseAttack + "   \u2764 " + this.enemy.currentHP);
    }

    /*
    public popText(text:string):void {
        //this.damageText.setText(text);
        this.setVisible(true);

        this.posY = this.y;
        this.scene.add.tween({
            targets: this,
            alpha:{from: 0.2, to: 1},
            y:{from: this.y, to:this.y-50},
            ease: "Linear",
            duration: 100,
            repeat: 0,
            yoyo: false,
            onComplete: function () {
                this.setVisible(false);
                this.setPosition(this.x, this.posY);
            },
            onCompleteScope: this
        });
    }*/

    public updateTint(gameState:GameState) {
        if (this.formula) this.formula.tintGraphics.setVisible(!gameState.evaluate(this.enemy.specialAttack));
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
