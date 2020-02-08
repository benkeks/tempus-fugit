import { DeckListener, Deck } from "../game-objects/deck";
import { Card } from "../game-objects/card";
import { Scene } from "phaser";
import ParticleEmitterManager = Phaser.GameObjects.Particles.ParticleEmitterManager;
import { GameInfo } from "../../game";
import { CardGUI } from "../game-gui-objects/card-gui";

const BORDER_WIDTH_TEXT_AREA = 4;
const GUI_TEXT_AREA_BORDER = 0x000000;
const GUI_TEXT_AREA = 0xf2f1e7;

const CARD_CONTAINER_COLOR = 0x999999;


export class NewCardsViewer extends Phaser.GameObjects.Container {
    public active: boolean = true;

    public displayingCards;
    public cardContainer: Phaser.GameObjects.Container;

    public scene: Scene;

    public dot: Phaser.GameObjects.Sprite;
    public dotParticles: ParticleEmitterManager;

    public fadeOutDuration: number = 1000;
    public fadeOutParticles;
    public emitter;

    public screenPadding: number = Math.max(GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 5), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 5));

    public background: Phaser.GameObjects.Graphics;
    public backgroundWidth;
    public backgroundHeight;

    public newCardText: Phaser.GameObjects.Text;
    public newCardTextBackground: Phaser.GameObjects.Graphics;

    public box:Phaser.GameObjects.Graphics;
    public text:Phaser.GameObjects.Text;
    public hoverBox:Phaser.GameObjects.Graphics;

    public final:boolean;

    constructor(scene: Scene, final:boolean=false) {
        super(scene);
        scene.add.existing(this);
        this.scene = scene;
        this.setPosition(this.screenPadding, this.screenPadding);
        this.final = final;

        this.backgroundWidth = GameInfo.width - 2 * this.screenPadding;
        this.backgroundHeight = GameInfo.height - 2 * this.screenPadding;
        this.background = scene.add.graphics({
            x: 0,
            y: 0,
            fillStyle: { color: 0x607d8b },
            lineStyle: { color: 0x000, width: 3 }
        });
        //GameInfo.width-2*this.screenPadding, GameInfo.height-2*this.screenPadding
        this.background.fillRoundedRect(0, 0, this.backgroundWidth, this.backgroundHeight);
        this.background.strokeRoundedRect(0, 0, this.backgroundWidth, this.backgroundHeight);
        this.add(this.background);

        this.dot = scene.add.sprite(this.backgroundWidth / 2, this.backgroundHeight - this.screenPadding, "book");
        this.dot.setScale(2.5);
        this.dot.setOrigin(0.5, 0.5);

        this.dotParticles = scene.add.particles("runes");
        this.dotParticles.createEmitter({
            frame: { frames: [0, 1, 2, 3] },
            x: this.dot.x,
            y: this.dot.y,
            speed: 100,
            lifespan: { min: 300, max: 400 },
            blendMode: 'ADD',
            scaleX: 1,
            scaleY: 1
        });
        let text = "You unlocked new Cards!";
        if (final) text = "You unlocked a cheat code!";

        let b_x = (GameInfo.width/2)-this.screenPadding
        let b_y = this.screenPadding/2;
        let b_width = 1000;
        let b_height = 50;
        this.newCardTextBackground = scene.add.graphics({
            x: b_x-b_width/2,
            y: b_y-b_height/2,
            fillStyle: { color: 0xFFFFFF },
            lineStyle: { color: 0x000, width: 3 }
        });
        //GameInfo.width-2*this.screenPadding, GameInfo.height-2*this.screenPadding
        this.newCardTextBackground.fillRoundedRect(0, 0, b_width, b_height);
        this.newCardTextBackground.strokeRoundedRect(0, 0, b_width, b_height);
        this.add(this.newCardTextBackground);

        this.newCardText = this.scene.add.text(b_x, b_y,text,{ fontSize: '32px', fontStyle: 'bold', fontFamily: 'pressStart', color: '#000000' });
            
        this.newCardText.setOrigin(0.5);
        this.add(this.newCardText);

        this.add(this.dot);
        this.add(this.dotParticles);

        this.createButton(this.dot.x, this.dot.y, this.screenPadding * 5, this.screenPadding);
        this.box.setAlpha(0);
        this.box.setInteractive(false);
        this.text.setAlpha(0);

        this.setVisible(false);
    }

    public async flush(cards?: Card[]) {
        if (!this.active) return;
        if (!cards && !this.final) return;
        
        this.cardContainer = this.scene.add.container(0, 0);
        this.displayingCards = [];

        let def_width = 0;
        let def_height = 0;
        if (this.final) { // display cheat code
            //@ts-ignore
            let text = this.scene.add.text(0,180,"UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT B A", { fontSize: '26px', fontStyle: 'bold', fontFamily: 'pressStart', color: '#FFFFFF' })
            text.setOrigin(0)
            text.setAlpha(0);

            this.add(this.scene.add.text(this.backgroundWidth/2,650,"If you type this on the map, you will unlock everything!", { fontSize: '22px', fontStyle: 'bold', fontFamily: 'pressStart', color: '#000000' }).setOrigin(0.5));

            this.cardContainer.add(text);
            this.displayingCards.push(text);
        } else {
            for (let i in cards) {
                let c = cards[i];

                let scale = 2;
                let w = CardGUI.DEFAULT_WIDTH * scale;
                let h = CardGUI.DEFAULT_HEIGHT * scale;

                let gui = new CardGUI(this.scene, 0, 0, c);
                gui.setScale(scale);
                gui.setAlpha(0);
                def_width = gui.displayWidth;
                def_height = gui.displayHeight;

                gui.setPosition((gui.displayWidth + this.screenPadding) * parseInt(i), 0);
                this.displayingCards.push(gui);
                this.cardContainer.add(gui);
            }
        }

        this.cardContainer.setPosition((this.backgroundWidth / 2) - (this.cardContainer.getBounds().width / 2) + def_width / 2, def_height / 2 + this.screenPadding + this.newCardText.displayHeight);
        this.add(this.cardContainer);

        this.scene.add.tween({ // fade in
            targets: this,
            alpha: { from: 0, to: 1 },
            ease: "Linear",
            duration: this.fadeOutDuration,
            repeat: 0,
            yoyo: false,
            onComplete: function (tween) {
                this.displayCards();
            },
            onCompleteScope: this
        });
        this.setVisible(true);
    }

    public displayOKButton(): void {
        this.scene.add.tween({ // fade out
            targets: [this.dot, this.dotParticles],
            alpha: { from: 1, to: 0 },
            ease: "Linear",
            duration: this.fadeOutDuration,
            repeat: 0,
            yoyo: false,
            onComplete: function (tween) {
                this.dot.setVisible(false);
                this.dotParticles.setVisible(false);
            },
            onCompleteScope: this
        });

        this.scene.add.tween({ // fade out
            targets: [this.box, this.text],
            alpha: { from: 0, to: 1 },
            ease: "Linear",
            duration: this.fadeOutDuration,
            repeat: 0,
            yoyo: false,
        });
        this.box.setInteractive(true);
    }

    private createButton(x: number, y: number, width: number = undefined, height: number = undefined) {
        this.box = this.scene.add.graphics({
            x:x-width/2,
            y:y-height/2,
            fillStyle: {color:0x666666},
            lineStyle:{color:0x000, width:3}});
        this.box.fillRoundedRect(0,0,width, height);
        this.box.strokeRoundedRect(0,0,width,height);
        this.hoverBox = this.scene.add.graphics({
            x:x-width/2,
            y:y-height/2,
            lineStyle:{color:0xFFFFFF, width:3}});
        this.hoverBox.strokeRoundedRect(0,0,width, height);
        this.hoverBox.setVisible(false);

        this.text = this.scene.add.text(x,y, "Return to Map",{
            fontSize: 26,
            fontStyle: 'bold',
            fontFamily: 'pressStart',
            color: '#FFFFFF'
        });
        this.text.setOrigin(0.5, 0.5);

        this.sendToBack(this.box);

        let hitArea = new Phaser.Geom.Rectangle(0, 0, width, height);
        this.box.setInteractive({ useHandCursor: true, hitArea:hitArea, hitAreaCallback:Phaser.Geom.Rectangle.Contains})
        this.box.on( 'pointerdown', function(pointer, localX, localY, event){
        this.scene.add.tween({ // fade out
            targets: this,
            alpha: 0,
            ease: "Linear",
            duration: this.fadeOutDuration,
            repeat: 0,
            yoyo: false,
            onComplete: function () {
                this.setVisible(false);
                this.destroy(true);
            },
            onCompleteScope: this
        });
     }, this). on("pointerover", function () {
         this.hoverBox.setVisible(true);
     },this). on("pointerout", function() {
        this.hoverBox.setVisible(false);
     }, this);

        this.add(this.box);
        this.add(this.hoverBox);
        this.add(this.text);
    }

    public displayCards(): void {
        if (this.displayingCards.length <= 0) {
            this.displayOKButton();
            return;
        }
        let gameObject = this.displayingCards.shift();

        this.scene.time.delayedCall(this.fadeOutDuration, function () {
            this.emitter.setQuantity(0);
        }, [], this);

        this.scene.add.tween({ // fade in
            targets: gameObject,
            alpha: { from: 0, to: 1 },
            ease: "Linear",
            duration: this.fadeOutDuration,
            repeat: 0,
            yoyo: false,
            onComplete: function () {
                this.displayCards();
            },
            onCompleteScope: this
        });

        if (this.fadeOutParticles) this.fadeOutParticles.destroy(true);
        this.fadeOutParticles = this.scene.add.particles("runes");
        this.add(this.fadeOutParticles);

        let x: number = this.cardContainer.x + gameObject.x - gameObject.displayWidth * gameObject.originX;
        let y: number = this.cardContainer.y + gameObject.y - gameObject.displayHeight * gameObject.originY;

        this.emitter = this.fadeOutParticles.createEmitter({
            frame: { frames: [0, 1, 2, 3], cyle: true },
            x: this.dot.x,
            y: this.dot.y,
            speed: 400,
            lifespan: 500,
            blendMode: 'ADD',
            moveToX: {
                min: x,
                max: x + gameObject.displayWidth
            },
            moveToY: {
                min: y,
                max: y + gameObject.displayHeight
            }
        });
    }
}