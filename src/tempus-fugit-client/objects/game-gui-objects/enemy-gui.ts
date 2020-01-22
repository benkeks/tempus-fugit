import {Enemy, EnemyListener} from "../game-objects/enemy";
import {ListGUI} from "./list-gui";
import Text = Phaser.GameObjects.Text;
import {ToolTip} from "./tool-tip";

/**
 * @author Mustafa
 */
export class EnemyGUI extends ListGUI {

    public enemy: Enemy; // enemy object associated with this gui
    public toolTip:ToolTip;
    public toolTipText:Text;

    //public damageText:Phaser.GameObjects.Text;
    //public posY:number;

    constructor(
        scene: Phaser.Scene,
        enemy: Enemy,
        x: number = 1500,
        y: number = 500,
        texture:string=undefined
    ) {
        super(scene, x, y);
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
        this.sprite.setScale(2,2);

        this.addText("");
        this.updateEnemyAttributes();

        this.setInteractive();

        //this.addText(enemy.specialAttack.getFormula().generateRepresentation(true), ListGUI.ALIGN_LEFT);

        this.toolTip = new ToolTip(scene, 0, 0, this);
        this.toolTip.addText(enemy.name, ListGUI.ALIGN_CENTRE,{fontSize:"26px"});
        this.toolTipText = this.toolTip.addText(enemy.description, ListGUI.ALIGN_LEFT);
        this.toolTip.fixedMaxTextWidth = true;
        this.toolTip.maxTextWidth = 400;
        this.toolTip.revalidate();

        /*this.damageText = scene.add.text(x,y,"abc",{});
        this.damageText.setVisible(false);
        this.add(this.damageText);*/
    }

    public disableListeners():void {
        this.enemy.removeListener(this);
    }

    public die():void {
        this.disableListeners();

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
            },
            onCompleteScope: this
        });
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

    /**
     * change HP display of enemy
     * @param changedTo
     */
    async enemyHpChanged(enemy:Enemy, changedFrom:number, changedTo:number) {
        let font1: Object = { fontSize: '50px', fontFamily: 'appleKid', color: '#FF0000' }
        let diff = changedFrom - changedTo;
        if (diff >= 0) {
            let damageText = this.scene.add.text(this.x-20, this.y-50, diff.toString(), font1);
            this.scene.tweens.add({targets: damageText ,duration: 600, y: damageText.y-40, ease: "Linear", delay: 500,
            onComplete: function () {
                damageText.destroy()
            }});
            let blood = this.scene.add.sprite(this.x, this.y+30, "blood");
            blood.setScale(0.2,0.2);
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
}
