import {Enemy, EnemyListener} from "../game-objects/enemy";
import {ListGUI} from "./list-gui";
import Text = Phaser.GameObjects.Text;
import {ToolTip} from "./tool-tip";

/**
 * @author Mustafa
 */
export class EnemyGUI extends ListGUI implements EnemyListener{

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
        this.scene.anims.create({
            key: "standing",
            frames: this.scene.anims.generateFrameNumbers(texture, {start:0}),
            frameRate: 10,
            repeat: -1
        });
        console.log(this.sprite);
        console.log(enemy);

        this.sprite.anims.play("standing");
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
        //this.popText((changedTo-changedFrom).toString());
        if (changedTo <= 0) {
            this.disableListeners();
            this.destroy(true);
        } else this.updateEnemyAttributes();
    }
}
