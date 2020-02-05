import { Scene } from "phaser";
import { GameInfo } from "../../game";
import { CardGUI } from "../game-gui-objects/card-gui";
import { Deck } from "../game-objects/deck";
import { Card } from "../game-objects/card";

const BACKGROUND_COLOR_FILL = 0x607d8b
const BACKGROUND_COLOR_LINE = 0x000

export class DeckBuilder extends Phaser.GameObjects.Container {

    public backgroundWidth:number;
    public backgroundHeight:number;
    public background:Phaser.GameObjects.Graphics;

    public scene:Scene;
    
    public screenPadding:number = Math.max(GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 5), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 5));

    public middle:number;
    public middlePadding:number = 5;

    public deckViewer;
    public childCound:number = 0;
    public deckSlider;
    public deckCards:CardGUI[] = [];
    public deckViewerRect:Phaser.Geom.Rectangle;

    public deck:string;
    public cardsInRow:number = 3;

    constructor(scene: Scene) {
        super(scene);
        this.scene = scene;
        scene.add.existing(this);
        this.setPosition(this.screenPadding, this.screenPadding);

        this.backgroundWidth = GameInfo.width - 2 * this.screenPadding;
        this.backgroundHeight = GameInfo.height - 2 * this.screenPadding;
        this.middle = this.backgroundWidth/4;

        this.background = scene.add.graphics({
            x: 0,
            y: 0,
            fillStyle: { color: BACKGROUND_COLOR_FILL },
            lineStyle: { color: BACKGROUND_COLOR_LINE, width: 3 }
        });
        //GameInfo.width-2*this.screenPadding, GameInfo.height-2*this.screenPadding
        this.background.fillRoundedRect(0, 0, this.backgroundWidth, this.backgroundHeight);
        this.background.strokeRoundedRect(0, 0, this.backgroundWidth, this.backgroundHeight);
        this.add(this.background);
        this.deck = "custom";

        this.deckViewerRect = new Phaser.Geom.Rectangle(this.deckViewer.x + this.screenPadding, this.deckViewer.y+this.screenPadding,
            this.backgroundWidth-this.middle-2*this.screenPadding, this.backgroundHeight-this.screenPadding*2);
        this.initDeckViewer();
    }

    public initDeckViewer() {
        if (this.deckViewer) this.deckViewer.destroy(true);
        if (this.deckSlider) this.deckSlider.destroy(true);

        let padding = this.middlePadding;
        
        //@ts-ignore
        this.deckViewer = this.scene.add.rexUI.add.sizer({
            orientation:"v"
            
        });

        //@ts-ignore
        this.deckSlider = this.scene.rexUI.add.scrollablePanel({
            x:this.deckViewerRect.x,
            y:this.deckViewerRect.y,
            width:this.deckViewerRect.width,
            height:this.deckViewerRect.height,
            panel:{child:this.deckViewer,
                    mask:{padding:padding}},
            scrollMode:"h"
        });

        if (this.deck in Deck.Decks) {
            Deck.Decks[this.deck].forEach(c => {
                this.addCardToDeck(c, false);
            });
        }
    }

    public appendViewer() {
        //@ts-ignore
        let child = this.scene.add.rexUI.add.sizer({
            orientation:"h",
            width: this.deckViewerRect.width,
            height:this.deckViewerRect.height
        });
        this.deckViewer.add(child, 0, "center", {}, false, this.childCound);
        return child;
    }

    public addCardToDeck(card:Card, checkIfAlreadyInside:boolean=true) {
        this.childCound += 1;

    }

    public removeCardFromDeck(card:Card) {

    }
}