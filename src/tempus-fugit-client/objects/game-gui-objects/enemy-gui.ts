import {Enemy, EnemyListener} from "../game-objects/enemy";
import {ListGUI} from "./list-gui";
import Text = Phaser.GameObjects.Text;
import {ToolTip} from "./tool-tip";

/**
 * @author Mustafa
 */
export class EnemyGUI extends ListGUI implements EnemyListener{

    public enemy: Enemy; // enemy object associated with this gui
    public attributeText:Text;
    public toolTip:ToolTip;
    public toolTipText:Text;

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
        this.defaultColor = 0x404040;
        this.defaultStrokeColor = 0xFFFFFF;

        this.addSpriteByTexture(texture);
        this.scene.anims.create({
            key: "standing",
            frames: this.scene.anims.generateFrameNumbers(texture, {start:0}),
            frameRate: 10,
            repeat: -1
        });

        this.sprite.anims.play("standing");
        this.sprite.setScale(2,2);

        this.attributeText = this.addText("");

        this.updateEnemyAttributes();

        this.setInteractive();

        //this.addText(enemy.specialAttack.getFormula().generateRepresentation(true), ListGUI.ALIGN_LEFT);

        this.toolTip = new ToolTip(scene, 0, 0, this);
        this.toolTip.addText(enemy.name, ListGUI.ALIGN_CENTRE,{fontSize:"26px"});
        this.toolTipText = this.toolTip.addText(enemy.description, ListGUI.ALIGN_LEFT);
        this.toolTip.fixedMaxTextWidth = true;
        this.toolTip.maxTextWidth = 400;
        this.toolTip.revalidate();
    }

    public updateEnemyAttributes():void {
        super.setText(0, "\u2694 " + this.enemy.baseAttack + "   \u2764 " + this.enemy.currentHP);
    }

    /**
     * change HP display of enemy
     * @param changedTo
     */
    enemyHpChanged(enemy:Enemy, changedFrom:number, changedTo:number): void {
        this.updateEnemyAttributes();
    }
}
