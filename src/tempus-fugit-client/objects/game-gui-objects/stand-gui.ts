
import {Stand, StandListener} from "../game-objects/stand";
import {Mission} from "../../mechanics/mission";
import {CardGUI} from "./card-gui";


/**
 * @author Florian
 */
export class StandGUI extends Phaser.GameObjects.Sprite implements StandListener{

    public stand: Stand; // stand object associated with this gui
    public name: string;
    public attack: number;
    public rounds: number;
    private upperText: Phaser.GameObjects.Text; // shows name and attack of stand
    private lowerText: Phaser.GameObjects.Text; // shows remaining rounds of stand
    private miniCardGUI: Phaser.GameObjects.Sprite;

    private textStyle = {
        fontSize: '18px',
        fontStyle: 'bold',
        fontFamily: 'Arial',
        color: '#FFFFFF'
    };


    public updateText(active: boolean) {
        if (active) {
            this.upperText.setText(this.stand.name + " with " + this.stand.standAttack + " attack");
            this.lowerText.setText(this.stand.getRoundsRemaining() + " rounds left");
        } else {
            this.upperText.setText("no stand here... :)");
            this.lowerText.setText("");
        }

    }

    constructor(
        scene: Phaser.Scene,
        mission: Mission,
        texture: string,
        stand: Stand,
        x: number = 800,
        y: number = 500,
    ) {
        super(scene, x, y, texture);
        this.x = x;
        this.y = y;
        this.scene.add.existing(this);
        this.stand = stand;
        for (stand of mission.getStands()) {
            stand.listener.push(this);
            console.log("pushed a stand");
        }
        this.upperText = this.scene.add.text(this.x - 100  , this.y - 150, "no stand here ..:)").setStyle(this.textStyle);
        this.lowerText = this.scene.add.text(this.x - 50  , this.y + 150, "").setStyle(this.textStyle);
    }

    hide(): void {
        this.setTint(0x000000);
    }

    show(): void {
        this.setTint(0xFFFFFF);
    }

    public turnRed() {
        this.setTint(0xFF0000);
        this.miniCardGUI.setTint(0xFF0000);
    }

    public turnNormal() {
        this.setTint(0xFFFFFF);
        this.miniCardGUI.setTint(0xFFFFFF);
    }

    /**
     * change HP display of enemy
     * @param changedTo
     */
    public activateStand(stand): void {
        this.stand = stand;
        this.show();
        this.updateText(true);
        this.miniCardGUI = this.scene.add.sprite(this.x+100, this.y, this.stand.getCard().getImage());
        this.miniCardGUI.setScale(0.4);
    }

    public updateStandText(): void {
        this.updateText(true);
    }

    public deactiveStand(stand: Stand): void {
        this.miniCardGUI.destroy(true);
        this.stand = null;
        this.hide();
        this.updateText(false);
    }
}