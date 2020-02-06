import { Scene, Data } from "phaser";
import { GameInfo } from "../../game";
import { CardGUI } from "../game-gui-objects/card-gui";
import { Deck } from "../game-objects/deck";
import { Card } from "../game-objects/card";
import { Player } from "../game-objects/player";
import { DescritptionDialog } from "./description-dialog";

const BACKGROUND_COLOR_FILL = 0x607d8b
const BACKGROUND_COLOR_LINE = 0x000

const BORDER_WIDTH_TEXT_AREA = 4;
const GUI_TEXT_AREA_BORDER = 0x000000;
const GUI_TEXT_AREA = 0xf2f1e7;

const GUI_FILL = 0xa96851;
const GUI_FILL_DARK = 0x5c4d4d;
const GUI_SLIDER = 0x915b4a;

const CARD_CONTAINER_COLOR = 0x999999;

const BUTTON_BACKGROUND_COLOR = 0x666666;
const BUTTON_BACKGROUND_LINE = 0x000;
const BUTTON_BACKGROUND_LINE_HOVER = 0xFFFFFF;
const RECT_LINE_WIDTH = 3;

const RED = 0xdd6666;

export class DeckBuilder {

    public static firstTime:boolean = true;

    public backgroundWidth:number;
    public backgroundHeight:number;

    public backgroundPanel;
    public mainPanel;

    public scene:Scene;
    
    public screenPadding:number = Math.max(GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 5), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 5));
    public screenMargin:number;

    public middle:number;
    public middlePadding:number = 40;

    public deckViewer;
    public deckSlider;
    public deckSliderTitle;
    public deckSliderDialog;
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

    public tween;

    public notEnoughCards;

    constructor(scene: Scene, player:Player) {
        this.scene = scene;
        this.player = player;
        this.screenMargin = this.screenPadding/2;

        this.backgroundWidth = GameInfo.width - 2 * this.screenPadding;
        this.backgroundHeight = GameInfo.height - 2 * this.screenPadding;
        this.middle = (this.backgroundWidth/4)+this.screenMargin*2;

        //@ts-ignore
        this.backgroundPanel = this.scene.rexUI.add.sizer({
            //@ts-ignore
            orientation:"h",
        });
        //@ts-ignore
        this.backgroundPanel.addBackground(this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, 0xFFFFFF)
        .setStrokeStyle(3, BACKGROUND_COLOR_LINE));
        this.backgroundPanel.setOrigin(0);

        let toolbar = [];
        toolbar.push(this.createButton("questionmark", function(pointer) {
            this.showTutorial();
        }, this, {sprite:true,
        left:5,
        right:5,
        top:5,
        bottom:5}).setDepth(100))

        toolbar.push(this.createButton("X", function(pointer) {
            if (Deck.Decks[this.deckName].deck.size < Deck.MIN_CARDS_IN_DECK) {
                this.showNotEnoughCards()
                return;
            }

            this.fadeOut(200, true);
        }, this, {backgroundColor:RED,
        left:5,
        right:5,
        top:5,
        bottom:5}).setDepth(100))


        //@ts-ignore
        let header = this.scene.rexUI.add.dialog({
            //@ts-ignore
            background:this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, GUI_TEXT_AREA)
            .setStrokeStyle(RECT_LINE_WIDTH, GUI_TEXT_AREA_BORDER),
            title:this.scene.add.text(0,0,"Deck builder", { fontSize: '16px', fontStyle: 'bold', fontFamily: 'pressStart', color: '#000000' }),
            space: {
                top:10,
                bottom:10
            },
            expand:{title:false}
        });
        header.setDepth(100).layout();

        //@ts-ignore
        this.mainPanel = this.scene.rexUI.add.dialog({
            x:this.screenPadding,
            y:this.screenPadding,
            width:this.backgroundWidth,
            height:this.backgroundHeight,
            content:this.backgroundPanel,
            toolbar:toolbar,
            title:header,
            //@ts-ignore
            background:this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, BACKGROUND_COLOR_FILL)
        .setStrokeStyle(3, BACKGROUND_COLOR_LINE),
            space:{
                left:this.screenMargin,
                right:this.screenMargin,
                top:this.screenMargin/2,
                bottom:this.screenMargin,
                titleLeft: 105+400,
                titleRight: 70+400,
                toolbarItem:10
            },
            expand:{content:true}
        });
        this.mainPanel.setOrigin(0);
        this.mainPanel.layout();
        this.backgroundPanel.layout();

        this.deckName = "custom";

        this.deckViewerRect = new Phaser.Geom.Rectangle(this.backgroundPanel.x +this.middle+this.middlePadding + this.screenPadding, this.backgroundPanel.y+this.screenPadding+this.screenPadding/2,
            this.backgroundWidth-this.middle-this.screenPadding, this.backgroundHeight-this.screenPadding);

        this.cardsViewerRect = new Phaser.Geom.Rectangle(this.backgroundPanel.x+this.screenMargin, this.backgroundPanel.y + this.screenMargin, 
            this.middle, this.backgroundHeight-this.screenMargin*2);

        this.initCardsViewer();
        this.initDeckViewer();
        this.update();

        this.fadeIn(200, function() {
            if (DeckBuilder.firstTime) {
                DeckBuilder.firstTime = false;
                this.showTutorial();
           }
        }, this);
    }

    public showTutorial() {
        this.scene.scene.run("DialogScene", {parent:"DeckBuilderScene", 
                description:"This is the DeckBuilder. Here you can design a custom deck by dragging objects from left to right and reverse. You can only have 4 to 16 cards of a differend kind in your deck. You can use this deck by simply click on a mission and selecting custom deck."});

    }

    public showNotEnoughCards() {
        this.scene.scene.run("DialogScene", {parent:"DeckBuilderScene", 
                description:"You need at least " + Deck.MIN_CARDS_IN_DECK + " cards in your deck!"});
    }

    public fadeIn(duration = 200, callback?, callbackScope?) {
        if (this.tween) this.tween.stop(0);

        this.mainPanel.setAlpha(0);
        this.tween = this.scene.add.tween({ // fade out
            targets: this.mainPanel,
            alpha: { from: 0, to: 1 },
            ease: "Linear",
            duration: duration,
            repeat: 0,
            yoyo: false,
            onComplete:callback,
            onCompleteScope:callbackScope
        });
        this.mainPanel.setVisible(true);
    }
    public fadeOut(duration = 200, destroy:boolean = false) {
        if (this.tween) this.tween.stop(1);

        this.mainPanel.setAlpha(1);
        this.tween = this.scene.add.tween({ // fade out
            targets: this.mainPanel,
            alpha: { from: 1, to: 0 },
            ease: "Linear",
            duration: duration,
            repeat: 0,
            yoyo: false,
            onComplete: function () {
                this.mainPanel.setVisible(false)
                if (destroy) this.mainPanel.destroy(true);
            },
            onCompleteScope: this
        });
    }

    public createButton(text, callback, callbackScope, config?) {
        let marginX = 25;
        let marginY = 5;

        let backgroundColor = BUTTON_BACKGROUND_COLOR;
        let left = marginX
        let right = marginX
        let top = marginY
        let bottom = marginY
        if (config) {
            if (config.backgroundColor) backgroundColor = config.backgroundColor;
            if (config.left) left = config.left;
            if (config.right) right = config.right;
            if (config.top) top = config.top;
            if (config.bottom) bottom = config.bottom;
        }

        //@ts-ignore
        let background = this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, backgroundColor)
        .setStrokeStyle(RECT_LINE_WIDTH, BUTTON_BACKGROUND_LINE)

        if (typeof text === 'string' || text instanceof String) {
            if (config.sprite) {
                text = this.scene.add.sprite(0,0,text as string);

            } else text = this.scene.add.text(0,0, text as string, { fontSize: '16px', fontStyle: 'bold', fontFamily: 'pressStart', color: '#000000' });
        }
        //@ts-ignore
        let button = this.scene.rexUI.add.dialog( {
            orientation:"h",
            background:background,
            content: text,
            space:{left:left,
                    right:right,
                    top:top,
                    bottom:bottom},
        });
        button.layout();

        button.setInteractive({useHandCursor:true}).on("pointerdown", callback, callbackScope).on("pointerover",
        function(pointer) {
            background.setStrokeStyle(RECT_LINE_WIDTH, BUTTON_BACKGROUND_LINE_HOVER);
        }).on("pointerout",
        function(pointer) {
            background.setStrokeStyle(RECT_LINE_WIDTH, BUTTON_BACKGROUND_LINE);
        })

        return button;
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
            space: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                line: 15,
            }
        });

        //@ts-ignore
        let headerBackground = this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, GUI_TEXT_AREA)
        .setStrokeStyle(BORDER_WIDTH_TEXT_AREA, GUI_TEXT_AREA_BORDER);
        this.deckSliderTitle = this.scene.add.text(0,0,"Deck", { fontSize: '16px', fontStyle: 'bold', fontFamily: 'pressStart', color: '#000000' })
        //@ts-ignore
        this.deckSliderDialog = this.scene.rexUI.add.dialog({
            //@ts-ignore
            background:headerBackground,
            title:this.deckSliderTitle,
            space: {
                top:10,
                bottom:10
            },
            expand:{title:false}
        });
        this.deckSliderDialog.layout();

        //@ts-ignore
        this.deckSlider = this.scene.rexUI.add.scrollablePanel({
            height:this.backgroundHeight-this.screenMargin*2,
            panel:{child:this.deckViewer,
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
            header:this.deckSliderDialog,
            draggable:false,
        });
        this.deckSlider.setOrigin(0);

        this.backgroundPanel.add(this.deckSlider, 1, "center", {top:15}, true);

        if (this.deckName in Deck.Decks) {
            Deck.Decks[this.deckName].deck.forEach(c => {
                this.addCardToDeck(c, false);
            });
        }
    }

    public update() {
        this.deckViewer.layout();
        this.deckSlider.layout();
        this.cardsViewer.layout();
        this.cardsSlider.layout();
        this.backgroundPanel.layout();
        this.mainPanel.layout();
    }

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
            space: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                line: 0,
            },
        });

        //@ts-ignore
        let header = this.scene.rexUI.add.dialog({
            //@ts-ignore
            background:this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, GUI_TEXT_AREA)
            .setStrokeStyle(BORDER_WIDTH_TEXT_AREA, GUI_TEXT_AREA_BORDER),
            title:this.scene.add.text(0,0,"Available Cards", { fontSize: '16px', fontStyle: 'bold', fontFamily: 'pressStart', color: '#000000' }),
            space: {
                top:10,
                bottom:10
            },
            expand:{title:false}
        });
        header.layout();

        //@ts-ignore
        this.cardsSlider = this.scene.rexUI.add.scrollablePanel({
            width:this.middle,
            height:this.backgroundHeight-2*this.screenMargin,
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

        this.backgroundPanel.add(this.cardsSlider, 0, "center", {right:this.middlePadding, top:15}, true);

        this.player.cardTypes.forEach(c => {
            if (!Deck.Decks[this.deckName].deck.has(c)) this.addCardToCardsViewer(c);
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
        console.log(elem);
        if (elem) {
            this.cardsViewer.remove(elem);
            elem.setVisible(false);
            elem.destroy(true);
            this.cardsViewer.layout();
            this.cardsSlider.layout();
        } else {
            this.player.cardTypes.add(card);
        }
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
            drag.label = label;
            drag.setPosition(pointer.x, pointer.y)
            drag.setVisible(true);
        },this).on("pointerout", function(pointer) {
            if (this.dragging) return;

            let drag = this.getDragCard(card);
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

        return label;
    }

    public updateDeckTitleText() {
        this.deckSliderTitle.setText("Deck - " + Deck.Decks[this.deckName].deck.size);
        this.deckSliderDialog.layout();
    }

    public createCard(card:Card):CardGUI {
        let c:CardGUI = new CardGUI(this.scene,0,0,card).setScale(2)
        c.cross.destroy(true);
        c.setDepth(100);

        return c;
    }

    public getDragCard(card:Card) {
        if (!(card.name in this.dragCards)) {
            let drag = this.createCard(card).setVisible(false);
            drag.disableDragging();
            drag.disableInteractive();
            this.dragCards[card.name] = drag;
            drag.setDepth(150);
        }

        return this.dragCards[card.name];
    }

    public addCardToDeck(card:Card, checkIfAlreadyInside:boolean=true) {
        if (checkIfAlreadyInside) {
            if (Deck.Decks[this.deckName].deck.has(card)) {
                return;
            }
        }

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
            this.cardsSlider.setScrollerEnable(true);
            this.deckSlider.setScrollerEnable(true);
            let drag = this.getDragCard(card);
            this.dragging = false;

            drag.setVisible(false);
            cardgui.setVisible(true);

            if (!Phaser.Geom.Rectangle.Contains(this.deckViewerRect, pointer.x, pointer.y)) {
                this.removeCardFromDeck(card);
            }
        },this);
        cardgui.enableDragging();
        
        let x_pad = (this.deckViewer.width - this.cardsInRow*cardgui.displayWidth)/(this.cardsInRow-1);
        this.deckViewer.setItemSpacing(x_pad);

        this.deckViewer.add(cardgui, {}, card.name);
        Deck.Decks[this.deckName].deck.add(card);
        this.updateDeckTitleText();
        this.update();
    }

    public removeCardFromDeck(card:Card) {
        if (!(Deck.Decks[this.deckName].deck.has(card))) return;

        let elem = this.deckViewer.getElement("items").find(function(c){return c.card.name==card.name})
        this.deckViewer.remove(elem);
        Deck.Decks[this.deckName].deck.delete(card);
        this.updateDeckTitleText();
        this.update();
        elem.destroy(true);

        this.addCardToCardsViewer(card);
    }
}