import {ListGUI} from "./list-gui";

export class ToolTip extends ListGUI {
    get enabled(): boolean {
        return this._enabled;
    }

    set enabled(value: boolean) {
        this._enabled = value;
        if (!value) {
            if (this.faderTimer) {
                this.faderTimer.remove(false);
                this.faderTimer = undefined;
            }
            if (this.tween) this.tween.stop();
            this.setVisible(false);
        }
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

            if (this.faderTimer) this.faderTimer.remove(false);
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

    public fadeIn(duration = 200, scale: boolean = false): void {
        if (!this.enabled || !this.scene) return;
        super.fadeIn(duration, scale);
    }

    public destroy(fromScene?: boolean): void {
        if (!this.scene) return;
        this.enabled = false;
        super.destroy(fromScene);
    }
}