import { Scene } from "phaser";
import { GameInfo } from "../../game";
import { CardGUI } from "../game-gui-objects/card-gui";
import { Deck } from "../game-objects/deck";
import { Card } from "../game-objects/card";
import { Player } from "../game-objects/player";

const BACKGROUND_COLOR_FILL = 0x607d8b
const BACKGROUND_COLOR_LINE = 0x000

const BORDER_WIDTH_TEXT_AREA = 4;
const GUI_TEXT_AREA_BORDER = 0x000000;
const GUI_TEXT_AREA = 0xf2f1e7;

const GUI_FILL = 0xa96851;
const GUI_FILL_DARK = 0x5c4d4d;
const GUI_SLIDER = 0x915b4a;

<<<<<<< Updated upstream
=======
const CARD_CONTAINER_COLOR = 0x999999;

>>>>>>> Stashed changes
export class DeckBuilder extends Phaser.GameObjects.Container {

    public backgroundWidth:number;
    public backgroundHeight:number;
    public background:Phaser.GameObjects.Graphics;

    public scene:Scene;
    
    public screenPadding:number = Math.max(GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 5), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 5));

    public middle:number;
    public middlePadding:number = 5;

    public deckViewer;
    public deckSlider;
    public deckViewerRect:Phaser.Geom.Rectangle;
    public dragCards = {};
    public sizer;

    public cardsViewer;
    public cardsSlider;
    public cardsViewerRect:Phaser.Geom.Rectangle;

    public deckName:string;
    public player:Player;
    public cardsInRow:number = 3;

    public dragging:boolean = false;

    constructor(scene: Scene, player:Player) {
        super(scene);
        this.scene = scene;
        this.player = player;
        scene.add.existing(this);
        this.setPosition(this.screenPadding, this.screenPadding);

        this.backgroundWidth = GameInfo.width - 2 * this.screenPadding;
        this.backgroundHeight = GameInfo.height - 2 * this.screenPadding;
        this.middle = this.backgroundWidth/3;

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
        this.deckName = "custom";

        this.deckViewerRect = new Phaser.Geom.Rectangle(this.x+this.middle+this.middlePadding + this.screenPadding, this.y+this.screenPadding+this.screenPadding/2,
            this.backgroundWidth-this.middle-this.screenPadding, this.backgroundHeight-this.screenPadding);

<<<<<<< Updated upstream
        this.initDeckViewer();

        this.scene.input.on("drag", function(pointer, gameObject) {
            if (!gameObject || !(gameObject instanceof CardGUI)) return;
            let drag = this.getDragCard(gameObject.card);
            drag.setVisible(true);
            gameObject.setVisible(false);
            //this.bringToTop(drag);

            drag.setPosition(pointer.x, pointer.y);
        },this)

        this.scene.input.on("dragend", function(pointer, gameObject) {
            if (!gameObject || !(gameObject instanceof CardGUI)) return;
            let card:Card = gameObject.card;
            let drag = this.dragCards[gameObject.card.name];

            drag.setVisible(false);
            gameObject.setVisible(true);

            if (!Phaser.Geom.Rectangle.Contains(this.deckViewerRect, pointer.x, pointer.y)) {
                this.removeCardFromDeck(card);
            }
            console.log(Deck.Decks[this.deck]);
        }, this);

        let label= this.createCardContainer(Card.cards["Anti-evolution"]);
        label.setPosition(500,500);
=======
        this.cardsViewerRect = new Phaser.Geom.Rectangle(this.x+this.screenPadding+this.screenPadding/2, this.y + this.screenPadding+this.screenPadding/2, 
            this.middle-this.middlePadding -this.screenPadding*1.5, this.backgroundHeight-this.screenPadding);

        this.initCardsViewer();
        this.initDeckViewer();

        //let label= this.createCardContainer(Card.cards["Anti-evolution"]);
        //label.setPosition(500,500);
>>>>>>> Stashed changes
    }

    public initDeckViewer() {
        if (this.deckViewer) this.deckViewer.destroy(true);
        if (this.deckSlider) this.deckSlider.destroy(true);

        //@ts-ignore
        let background = this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, GUI_TEXT_AREA)
        .setStrokeStyle(BORDER_WIDTH_TEXT_AREA, GUI_TEXT_AREA_BORDER);

        let padding = this.middlePadding;
        //@ts-ignore
        this.deckViewer = this.scene.rexUI.add.fixWidthSizer({
            orientation:"h",
            width:this.deckViewerRect.width,
            space: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                line: 15,
            }
<<<<<<< Updated upstream
=======
        });

        //@ts-ignore
        let header = this.scene.rexUI.add.label({
            //@ts-ignore
            background:this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, GUI_TEXT_AREA)
            .setStrokeStyle(BORDER_WIDTH_TEXT_AREA, GUI_TEXT_AREA_BORDER),
            width:100,
            height:50,
            orientation:"h",
            buttons:this.scene.add.text(0,0,"Deck", { fontSize: '14px', fontStyle: 'bold', fontFamily: 'pressStart', color: '#000000' }),
            space: {
                left:5,
                right:5,
                icon:5,
                top: 0,
                bottom: 0,
                text:5,
            },
>>>>>>> Stashed changes
        });
        header.layout();

        //@ts-ignore
        this.deckSlider = this.scene.rexUI.add.scrollablePanel({
            x:this.deckViewerRect.x-this.x,
            y:this.deckViewerRect.y-this.y,
            width:this.deckViewerRect.width,
            height:this.deckViewerRect.height,
            panel:{child:this.deckViewer,
                    mask:{padding:5}},
            scrollMode:"v",
            //@ts-ignore
<<<<<<< Updated upstream
            background: this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, GUI_TEXT_AREA)
                .setStrokeStyle(BORDER_WIDTH_TEXT_AREA, GUI_TEXT_AREA_BORDER),
=======
            background:background,
>>>>>>> Stashed changes
            slider: {
                //@ts-ignore
                track: this.scene.rexUI.add.roundRectangle(0, 0, 20, 20, 10, GUI_SLIDER),
                //@ts-ignore
                thumb: this.scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, GUI_FILL)
            },space: {
                left: 15,
                right: 15,
                top: 15,
                bottom: 10,
<<<<<<< Updated upstream
        
                panel: 10,
            },
        });
        this.deckSlider.setOrigin(0);
        //console.log(this.deckViewer);
=======
                header:20,
        
                panel: 10,
            },
            header:header,
            draggable:false,
        });
        this.deckSlider.setOrigin(0);
>>>>>>> Stashed changes

        this.add(this.deckSlider);

        if (this.deckName in Deck.Decks) {
            Deck.Decks[this.deckName].deck.forEach(c => {
                this.addCardToDeck(c, false);
            });
        }
    }

    public update() {
        this.deckViewer.layout();
        this.deckSlider.layout();
    }

<<<<<<< Updated upstream
    public createCardContainer(card:Card) {
        let maxWidth = 50;

        //@ts-ignore
        let background = this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, GUI_TEXT_AREA)
        .setStrokeStyle(BORDER_WIDTH_TEXT_AREA, GUI_TEXT_AREA_BORDER);

        let sprite = this.scene.add.sprite(0,0, card.image);
        let scale = maxWidth/sprite.displayWidth;
        sprite.setScale(scale);

        let name = this.scene.add.text(0,0, card.name, { fontSize: '14px', fontStyle: 'bold', fontFamily: 'pressStart', color: '#000000' })

        //@ts-ignore
        let label = this.scene.rexUI.add.label({
            width:150,
            height:50,
            background:background,
            orientation:"h",
            icon:sprite,
            text:name,
            draggable:true,
=======
    public initCardsViewer() {
        if (this.cardsViewer) this.cardsViewer.destroy(true);
        if (this.cardsSlider) this.cardsSlider.destroy(true);

        //@ts-ignore
        let background = this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, GUI_TEXT_AREA)
        .setStrokeStyle(BORDER_WIDTH_TEXT_AREA, GUI_TEXT_AREA_BORDER);

        let padding = this.middlePadding;
        //@ts-ignore
        this.cardsViewer = this.scene.rexUI.add.sizer({
            orientation:"v",
            width:this.cardsViewerRect.width,
            space: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                line: 0,
            },
        });

        //@ts-ignore
        let header = this.scene.rexUI.add.label({
            //@ts-ignore
            background:this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, GUI_TEXT_AREA)
            .setStrokeStyle(BORDER_WIDTH_TEXT_AREA, GUI_TEXT_AREA_BORDER),
            width:100,
            height:50,
            orientation:"h",
            text:this.scene.add.text(0,0,"Available Cards", { fontSize: '14px', fontStyle: 'bold', fontFamily: 'pressStart', color: '#000000' }),
>>>>>>> Stashed changes
            space: {
                left:5,
                right:5,
                icon:5,
                text:5
<<<<<<< Updated upstream
            }
        });
        label.layout();

        background.setInteractive().on("pointerover", function() {
            console.log("over");
        })

        console.log(label)
=======
            },
        });
        header.layout();

        //@ts-ignore
        this.cardsSlider = this.scene.rexUI.add.scrollablePanel({
            x:this.cardsViewerRect.x-this.x,
            y:this.cardsViewerRect.y-this.y,
            width:this.cardsViewerRect.width,
            height:this.cardsViewerRect.height,
            panel:{child:this.cardsViewer,
                    mask:{padding:5}},
            scrollMode:"v",
            //@ts-ignore
            background:background,
            slider: {
                //@ts-ignore
                track: this.scene.rexUI.add.roundRectangle(0, 0, 20, 20, 10, GUI_SLIDER),
                //@ts-ignore
                thumb: this.scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, GUI_FILL)
            },space: {
                left: 15,
                right: 15,
                top: 15,
                bottom: 10,
                header:20,
        
                panel: 10,
            },
            header:header,draggable:false
        });
        this.cardsSlider.setOrigin(0);

        this.cardsSlider.layout()
        this.add(this.cardsSlider);

        this.player.cardTypes.forEach(c => {
            this.addCardToCardsViewer(c);
        });
    }

    public addCardToCardsViewer(card:Card) {
        let container = this.createCardContainer(card);
        container.card = card;

        this.cardsViewer.add(container, 0, "center", {},true, card.name);
        this.cardsViewer.layout();
        this.cardsSlider.layout();
    }

    public removeCardFromCardsViewer(card:Card) {
        let elem = this.cardsViewer.getElement(card.name);
        
        this.cardsViewer.remove(elem);
        elem.setVisible(false);
        this.cardsViewer.layout();
        this.cardsSlider.layout();
    }

    public createCardContainer(card:Card) {
        let maxWidth = 50;

        //@ts-ignore
        let background = this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, CARD_CONTAINER_COLOR)
        .setStrokeStyle(BORDER_WIDTH_TEXT_AREA, GUI_TEXT_AREA_BORDER);

        let sprite = this.scene.add.sprite(0,0, card.image);
        let scale = maxWidth/sprite.displayWidth;
        sprite.setScale(scale);

        let name = this.scene.add.text(0,0, card.name, { fontSize: '14px', fontStyle: 'bold', fontFamily: 'pressStart', color: '#000000' })

        //@ts-ignore
        let label = this.scene.rexUI.add.label({
            width:150,
            height:50,
            background:background,
            orientation:"h",
            icon:sprite,
            text:name,
            space: {
                left:5,
                right:5,
                icon:5,
                text:5
            },
            
    expandTextWidth: false,
    expandTextHeight: false
        });
        label.layout();
        label.setDepth(10)

        label.setInteractive().on("pointerover", function(pointer) {
            if (this.dragging) return;

            let drag = this.getDragCard(card);
            //drag.enableDragging();
            drag.label = label;
            drag.setPosition(pointer.x, pointer.y)
            drag.setVisible(true);
        },this).on("pointerout", function(pointer) {
            if (this.dragging) return;

            let drag = this.getDragCard(card);
            //drag.disableDragging();
            drag.setVisible(false);
        },this).on("drag", function(pointer) {
            this.dragging = true;
            this.cardsSlider.setScrollerEnable(false);
            this.deckSlider.setScrollerEnable(false);
            let drag = this.getDragCard(card);

            drag.setVisible(true);
            drag.label.setVisible(false);
            drag.setPosition(pointer.x, pointer.y);
        },this).on("dragend", function(pointer) {
            console.log("draggend wrong");
            this.cardsSlider.setScrollerEnable(true);
            this.deckSlider.setScrollerEnable(true);
            let drag = this.getDragCard(card);
            this.dragging = false;

            drag.setVisible(false);
            drag.label.setVisible(true);

            if (Phaser.Geom.Rectangle.Contains(this.deckViewerRect, pointer.x, pointer.y)) {
                this.addCardToDeck(card);
            }
        },this);

        label.input.draggable = true;
>>>>>>> Stashed changes

        return label;
    }

    public createCard(card:Card):CardGUI {
        let c:CardGUI = new CardGUI(this.scene,0,0,card).setScale(2)
        c.cross.destroy(true);
<<<<<<< Updated upstream
=======
        c.setDepth(100);
>>>>>>> Stashed changes

        return c;
    }

    public getDragCard(card:Card) {
        if (!(card.name in this.dragCards)) {
            let drag = this.createCard(card).setVisible(false);
<<<<<<< Updated upstream
            this.dragCards[card.name] = drag;
=======
            drag.disableDragging();
            drag.disableInteractive();
            this.dragCards[card.name] = drag;
            drag.setDepth(150);
>>>>>>> Stashed changes
        }

        return this.dragCards[card.name];
    }

    public addCardToDeck(card:Card, checkIfAlreadyInside:boolean=true) {
        if (checkIfAlreadyInside) {
<<<<<<< Updated upstream
            if (Deck.Decks[this.deck].has(card)) {
=======
            if (Deck.Decks[this.deckName].deck.has(card)) {
>>>>>>> Stashed changes
                return;
            }
        }

<<<<<<< Updated upstream
        let scale = 2;
        let cardgui = this.createCard(card);
        cardgui.enableDragging();
        
        let x_pad = (this.deckViewer.width - this.cardsInRow*cardgui.displayWidth)/(this.cardsInRow-1);
        this.deckViewer.setItemSpacing(x_pad);

=======
        this.removeCardFromCardsViewer(card);

        let cardgui = this.createCard(card);
        cardgui.on("drag", function(pointer) {
            this.dragging = true;
            this.cardsSlider.setScrollerEnable(false);
            this.deckSlider.setScrollerEnable(false);

            let drag = this.getDragCard(card);
            drag.setVisible(true);
            cardgui.setVisible(false);

            drag.setPosition(pointer.x, pointer.y);
        },this).on("dragend", function(pointer) {
            console.log("dragend right");
            this.cardsSlider.setScrollerEnable(true);
            this.deckSlider.setScrollerEnable(true);
            let drag = this.getDragCard(card);
            this.dragging = false;

            drag.setVisible(false);
            cardgui.setVisible(true);

            if (!Phaser.Geom.Rectangle.Contains(this.deckViewerRect, pointer.x, pointer.y)) {
                console.log("delete");
                this.removeCardFromDeck(card);
            }
        },this);
        cardgui.enableDragging();
        
        let x_pad = (this.deckViewer.width - this.cardsInRow*cardgui.displayWidth)/(this.cardsInRow-1);
        this.deckViewer.setItemSpacing(x_pad);

>>>>>>> Stashed changes
        this.deckViewer.add(cardgui, {}, card.name);
        this.update();
    }

    public removeCardFromDeck(card:Card) {
<<<<<<< Updated upstream
        if (!(Deck.Decks[this.deck].has(card))) return;
=======
        if (!(Deck.Decks[this.deckName].deck.has(card))) return;
>>>>>>> Stashed changes

        let elem = this.deckViewer.getElement("items").find(function(c){return c.card.name==card.name})
        this.deckViewer.remove(elem);
        this.update();
        elem.destroy(true);

<<<<<<< Updated upstream
        Deck.Decks[this.deck].delete(card);
=======
        this.addCardToCardsViewer(card);
>>>>>>> Stashed changes
    }
}