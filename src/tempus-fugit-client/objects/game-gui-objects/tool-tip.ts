import {ListGUI} from "./list-gui";

export class ToolTip extends ListGUI {
    get enabled(): boolean {
        return this._enabled;
    }

    set enabled(value: boolean) {
        this._enabled = value;
        if (!value) this.setVisible(false);
    }
    public gameObject;

    public faderTimer:Phaser.Time.TimerEvent;
    public popUpDelay:number = 200;

    private _enabled:boolean = true;

    constructor(scene: Phaser.Scene,
                x: number = 1500,
                y: number = 500,
                gameObject:Phaser.GameObjects.GameObject=undefined) {
        super(scene, x, y);
        this.gameObject = gameObject;
        scene.add.existing(this);
        this.disableInteractive();

        gameObject.setInteractive().on('pointerover',function(pointer){
            if (!this._enabled) return;

            this.faderTimer = this.scene.time.delayedCall(this.popUpDelay, this.fadeIn, [], this);
        }, this);

        gameObject.on('pointerout',function(pointer){
            if (!this._enabled) return;

           if (this.faderTimer) this.faderTimer.destroy();
           this.fadeOut();
        }, this);
        this.setDepth(1000);

        this.setVisible(false);
    }

    
}