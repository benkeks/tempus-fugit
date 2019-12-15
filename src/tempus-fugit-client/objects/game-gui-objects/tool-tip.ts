import Container = Phaser.GameObjects.Container;
import {CharacterGui} from "./character-gui";

export class ToolTip extends CharacterGui {
    get enabled(): boolean {
        return this._enabled;
    }

    set enabled(value: boolean) {
        this._enabled = value;
        if (!value) this.setVisible(false);
    }
    public gameObject;

    public faderTimer:Phaser.Time.TimerEvent;

    private _enabled:boolean = true;

    constructor(scene: Phaser.Scene,
                x: number = 1500,
                y: number = 500,
                gameObject:Phaser.GameObjects.GameObject=undefined) {
        super(scene, x, y);
        this.gameObject = gameObject;
        scene.add.existing(this);

        gameObject.on('pointerover',function(pointer){
            if (!this._enabled) return;

            this.setPosition(pointer.x, pointer.y);

            this.faderTimer = this.scene.time.delayedCall(200, this.fadeIn, [], this);
        }, this);

        gameObject.on('pointerout',function(pointer){
            if (!this._enabled) return;

           if (this.faderTimer) this.faderTimer.destroy();
           this.fadeOut();
        }, this);

        this.setVisible(false);
    }

    public fadeIn(duration=100) {
        this.scene.add.tween({ // fade out
            targets: this,
            alpha: {from: 0, to: 1},
            ease: "Linear",
            duration: duration,
            repeat: 0,
            yoyo: false
        });
        this.setVisible(true);
    }
    public fadeOut(duration=100) {
        this.scene.add.tween({ // fade out
            targets: this,
            alpha: {from: 1, to: 0},
            ease: "Linear",
            duration: duration,
            repeat: 0,
            yoyo: false,
            onComplete: function () {
                this.setVisible(false)
            },
            onCompleteScope:this
        });
    }

}