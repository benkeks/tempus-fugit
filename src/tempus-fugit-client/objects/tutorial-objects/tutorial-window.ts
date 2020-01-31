//@ts-nocheck //ts is very annoying with rexUI

// Colors
import { HelpButton } from "../help-gui-objects/help-button";
import { PauseButton } from "./pause-button";
import { MissionScene } from "../../scenes/mission-scene";
import { GameInfo } from "../../game";
import { Pages } from 'phaser3-rex-plugins/templates/ui/ui-components.js';

const GUI_TITLE = 0xeceff1;
const GUI_BORDER = 0x5d4037;
const GUI_BORDER_HIGHLIGHT = 0xd7ccc8;
const GUI_FILL = 0xa96851;
const GUI_FILL_DARK = 0x5c4d4d;
const GUI_LABEL_BG = 0xeceff1;
const GUI_CLOSE = 0xdd6666;

// Format constants
const PAUSE_HEIGHT = 100;
const PAUSE_WIDTH = 500;
const BORDER_WIDTH = 3;
const TITLE_SPACER = '    ';


export class TutorialWindow extends Phaser.GameObjects.Container{
    public scene: Phaser.Scene;

    public static spriteKeys;

    private sprites:Phaser.GameObjects.Sprite[] = [];
    private spriteBackgrounds:Phaser.GameObjects.Graphics[] = [];
    private activeIndex = 0;

    public background:Phaser.GameObjects.Graphics;

    public screenPadding: number = Math.max(GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 5), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 5));

    public backgroundWidth:number;
    public backgroundHeight:number;

    public leftButton:Phaser.GameObjects.Text;
    public rightButton:Phaser.GameObjects.Text;

    public titleText:Phaser.GameObjects.Text;
    public titleBackground:Phaser.GameObjects.Graphics;

    public exitText:Phaser.GameObjects.Text;
    public exitBackground:Phaser.GameObjects.Graphics;
    public exitBackgroundHover:Phaser.GameObjects.Graphics;

    public guided:boolean;

    constructor(scene: Phaser.Scene, guided:boolean=true) {
        let screenPadding = Math.max(GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 5), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 5));
        super(scene, screenPadding, screenPadding);

        this.guided = guided;
        this.screenPadding = screenPadding;
        this.scene = scene;
        scene.add.existing(this);

        TutorialWindow.spriteKeys = ["tutorialSlide1","tutorialSlide2", "tutorialSlide3"];

        this.backgroundWidth = GameInfo.width - 2 * this.screenPadding;
        this.backgroundHeight = GameInfo.height - 2 * this.screenPadding;
        this.background = this.scene.add.graphics({
            x: 0,
            y: 0,
            fillStyle: { color: 0xa96851 },
            lineStyle: { color: 0x000, width: 3 }
        });
        this.background.fillRoundedRect(0, 0, this.backgroundWidth, this.backgroundHeight);
        this.background.strokeRoundedRect(0, 0, this.backgroundWidth, this.backgroundHeight);
        this.sendToBack(this.background);
        this.add(this.background);

        this.initSprites(TutorialWindow.spriteKeys, new Phaser.Geom.Rectangle(
            this.screenPadding, this.screenPadding, this.backgroundWidth-this.screenPadding*2, this.backgroundHeight-this.screenPadding*2));
        
        this.setUpScrollingArrows();
        this.setUpTitle();
        this.setUpExit();

        this.fadeIn();
    }

    public initSprites(sprites:string[], rect:Phaser.Geom.Rectangle) {
        for (let i=0; i < sprites.length; i++) {
            let key = sprites[i];
            let padding = 10;

            let sprite = this.scene.add.sprite(rect.x+padding,rect.y+padding, key);
            sprite.setDisplaySize(rect.width-2*padding, rect.height-2*padding);
            sprite.setOrigin(0);

            let backgroundSprite = this.scene.add.graphics({
                x: rect.x,
                y: rect.y,
                fillStyle: { color: 0xFFFFFF },
                lineStyle: { color: 0x000, width: 3 }
            });
            backgroundSprite.fillRoundedRect(0, 0, rect.width, rect.height);
            backgroundSprite.strokeRoundedRect(0, 0, rect.width, rect.height);
            this.add(backgroundSprite);
            this.add(sprite);
            //this.sendToBack(sprite);
            //this.sendToBack(backgroundSprite);
            this.spriteBackgrounds.push(backgroundSprite);
            this.sprites.push(sprite);

            if (i != this.activeIndex) {
                sprite.setVisible(false);
                backgroundSprite.setVisible(false);
            }


        }
    }

    public setSlide(next:number=this.activeIndex+1):boolean {
        if (next >= this.sprites.length) next = 0;
        else if (next < 0) next = this.sprites.length-1;

        if (this.guided && next == this.sprites.length-1 && !this.exitText.visible) this.fadeIn([this.exitBackground, this.exitText]);

        let sprite = this.sprites[next];
        let old_sprite = this.sprites[this.activeIndex];
        let background = this.spriteBackgrounds[next];
        let old_background = this.spriteBackgrounds[this.activeIndex];

        let duration = 500;
        this.scene.add.tween({ // fade out
            targets: [old_sprite, old_background],
            alpha: 0,
            ease: "Linear",
            duration: duration,
            repeat: 0,
            yoyo: false,
            onComplete: function () {
                old_sprite.setVisible(false);
                old_background.setVisible(false);
            },
            onCompleteScope: this
        });
        
        sprite.setVisible(true);
        background.setVisible(true);
        this.scene.add.tween({ // fade in
            targets: [sprite, background],
            alpha: {from:0, to:1},
            ease: "Linear",
            duration: duration,
            repeat: 0,
            yoyo: false
        });

        this.activeIndex = next;
    }

    public updateTitleText() {
        let ind:number = this.activeIndex+1
        this.titleText.setText("Tutorial - " + (ind) + "/" + this.sprites.length);
    }

    public setUpTitle() {
        let x = this.backgroundWidth/2;
        let y = this.screenPadding/2;
        let config = { fontSize: "22px", fontFamily: 'pressStart' ,color:"#000000"}
        let padding = 5;

        this.titleText = this.scene.add.text(x,y,"", config).setOrigin(0.5);
        this.updateTitleText();

        let rect = this.titleText.getBounds();
        
        let w = rect.width*2
        let h = rect.height*2;
        this.titleBackground = this.scene.add.graphics({
            x: x-w/2,
            y: y-h/2,
            fillStyle: { color: 0xFFFFFF },
            lineStyle: { color: 0x000, width: 3 }
        });
        this.titleBackground.fillRoundedRect(0,0, w, h);
        this.titleBackground.strokeRoundedRect(0,0, w, h);

        this.add(this.titleBackground);
        this.add(this.titleText);
    }

    public setUpExit() {
        let x = this.backgroundWidth-this.screenPadding/2;
        let y = this.screenPadding/2;
        let config = { fontSize: "22px", fontFamily: 'pressStart' ,color:"#000000"}
        let padding = 15;

        this.exitText = this.scene.add.text(x,y,"X", config).setOrigin(0.5);

        let rect = this.exitText.getBounds();
        
        let w = rect.width+2*padding
        let h = rect.height+2*padding;
        this.exitBackground = this.scene.add.graphics({
            x: x,
            y: y,
            fillStyle: { color: 0xdd6666 },
            lineStyle: { color: 0x000, width: 3 }
        });
        this.exitBackgroundHover = this.scene.add.graphics({
            x: x,
            y: y,
            lineStyle: { color: 0xFFFFFF, width: 3 }
        });
        this.exitBackground.fillCircle(0, 0, Math.max(w,h)/2);
        this.exitBackground.strokeCircle(0, 0, Math.max(w,h)/2);
        this.exitBackgroundHover.strokeCircle(0,0, Math.max(w,h)/2).setVisible(false);

        let hitArea = new Phaser.Geom.Circle(0,0, Math.max(w,h)/2);
        this.exitBackground.setInteractive({ useHandCursor: true, hitArea:hitArea, hitAreaCallback:Phaser.Geom.Circle.Contains})
        .on("pointerover", () => {
            this.exitBackgroundHover.setVisible(true);
        }, this).on("pointerout", () => {
            this.exitBackgroundHover.setVisible(false);
        })
        this.exitBackground.on("pointerdown", () => {
            this.fadeOut();
        },this);

        this.add(this.exitBackground);
        this.add(this.exitBackgroundHover);
        this.add(this.exitText);

        if (this.guided) {
            this.exitText.setVisible(false);
            this.exitBackground.setVisible(false);
        }
    }

    public fadeOut(go=[this]) {
        this.scene.add.tween({ // fade out
            targets: go,
            alpha: 0,
            ease: "Linear",
            duration: 500,
            repeat: 0,
            yoyo: false,
            onComplete: function () {
                go.map(g => g.destroy(true));
            },
            onCompleteScope: this
        });
    }

    public fadeIn(go=[this]) {
        go.map(g => g.setVisible(true));
        this.scene.add.tween({ // fade out
            targets: go,
            alpha: {from:0, to:1},
            ease: "Linear",
            duration: 500,
            repeat: 0,
            yoyo: false
        });
    }

    public setUpScrollingArrows() {
        let padding = 15;
        let config = { fontSize: "22px", fontFamily: 'pressStart' }
        this.rightButton = this.scene.add.text(this.backgroundWidth/2+padding, this.backgroundHeight-this.screenPadding/2, "next", config)
        .setOrigin(0,0.5);
        this.leftButton = this.scene.add.text(this.backgroundWidth/2-padding, this.backgroundHeight-this.screenPadding/2, "previous", config)
        .setOrigin(1,0.5);

        this.leftButton.setInteractive({useHandCursor:true}).on("pointerdown", () => {
            this.setSlide(this.activeIndex-1);
            this.updateTitleText();
        }, this);

        this.rightButton.setInteractive({useHandCursor:true}).on("pointerdown", () => {
            this.setSlide();
            this.updateTitleText();
        }, this);

        this.add(this.rightButton);
        this.add(this.leftButton);
    }
}