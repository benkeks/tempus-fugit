import { Scene, Data } from "phaser";
import { GameInfo } from "../../game";
import { CardGUI } from "../game-gui-objects/card-gui";
import { Deck } from "../game-objects/deck";
import { Card } from "../game-objects/card";
import { Player } from "../game-objects/player";
import { DescritptionDialog } from "./description-dialog";
import { NavigationScene } from "../../scenes/navigation-scene";
import { ProgressStore } from "../../progress/progress-store";

const BACKGROUND_COLOR_FILL = 0x607d8b
const BACKGROUND_COLOR_LINE = 0x000

const BORDER_WIDTH_TEXT_AREA = 4;
const GUI_TEXT_AREA_BORDER = 0x000000;
const GUI_TEXT_AREA = 0xf2f1e7;

const GUI_FILL = 0xbf9486;
const GUI_FILL_DARK = 0x5c4d4d;
const GUI_SLIDER = 0x915b4a;

const CARD_CONTAINER_COLOR = 0x999999;

const BUTTON_BACKGROUND_COLOR = 0x666666;
const BUTTON_BACKGROUND_LINE = 0x000;
const BUTTON_BACKGROUND_LINE_HOVER = 0xFFFFFF;
const RECT_LINE_WIDTH = 3;

const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

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

    public activeButton;

    public newCards:Set<string>;

    constructor(scene: Scene, player:Player, newCards?:Set<string>) {
        this.scene = scene;
        this.player = player;
        this.screenMargin = this.screenPadding/2;
        if (newCards) this.newCards = newCards;
        else this.newCards = new Set<string>();

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
            if (Object.keys(Deck.Decks[this.deckName].deck).length < Deck.MIN_CARDS_IN_DECK) {
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
                titleLeft: 105+300,
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
                description:"This is the DeckBuilder. Here you can design a custom deck by dragging objects from left to right and reverse. You need at least 4 cards in your deck.\n\nYou can choose to play with your custom deck or a premade (default) deck."});

    }

    public showNotEnoughCards() {
        this.scene.scene.run("DialogScene", {parent:"DeckBuilderScene", 
                description:"You need at least " + Deck.MIN_CARDS_IN_DECK + " cards in your deck!"});
    }

    public fadeIn(duration = 200, callback?, callbackScope?) {
        if (this.tween) this.tween.stop();

        this.mainPanel.setAlpha(0);
        this.tween = this.scene.add.tween({ // fade out
            targets: this.mainPanel,
            alpha: { from: 0, to: 1 },
            ease: "Linear",
            duration: duration,
            repeat: 0,
            yoyo: false,
            onComplete:callback,
            callbackScope:callbackScope
        });
        this.mainPanel.setVisible(true);
    }
    public fadeOut(duration = 200, destroy:boolean = false) {
        if (this.tween) this.tween.stop();

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
            callbackScope: this
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
        .setStrokeStyle(BORDER_WIDTH_TEXT_AREA, GUI_TEXT_AREA_BORDER).setOrigin(0);

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
            },
            mouseWheelScroller: {
                focus: 2,
                speed: 0.3
            },
            space: {
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
            for (let c_ind in Deck.Decks[this.deckName].deck) {
                let c = Deck.Decks[this.deckName].deck[c_ind];
                this.addCardToDeck(c, false);
            }
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
        .setStrokeStyle(BORDER_WIDTH_TEXT_AREA, GUI_TEXT_AREA_BORDER).setOrigin(0);

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
            },
            mouseWheelScroller: {
                focus: 2,
                speed: 0.3
            },
            space: {
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

        //@ts-ignore
        let leftPanel = this.scene.rexUI.add.sizer({
            orientation:"v"
        });

        //@ts-ignore
        let buttonPanelBackground = this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, GUI_TEXT_AREA)
        .setStrokeStyle(BORDER_WIDTH_TEXT_AREA, GUI_TEXT_AREA_BORDER);
        //@ts-ignore
        let radioButton =this.scene.rexUI.add.buttons({
            //x: 200, y: 100,
            orientation: 'h',
            //@ts-ignore
            //background: this.scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, GUI_TEXT_AREA),
            buttons: [
                this.createRadioButton(this.scene, 'Custom', undefined),
                this.createRadioButton(this.scene, 'Default', undefined)
            ],
        })
            .setDepth(9).layout();
        radioButton.emitButtonClick(0);

        //@ts-ignore
        let buttonHeader = this.scene.rexUI.add.dialog({
            //@ts-ignore
            background:this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, GUI_TEXT_AREA)
            .setStrokeStyle(BORDER_WIDTH_TEXT_AREA, GUI_TEXT_AREA_BORDER),
            title:this.scene.add.text(0,0,"Active Deck", { fontSize: '16px', fontStyle: 'bold', fontFamily: 'pressStart', color: '#000000' }),
            space: {
                top:10,
                bottom:10
            },
            expand:{title:false}
        }).setDepth(8);
        buttonHeader.layout();

        //@ts-ignore
        let rButtonDialog = this.scene.rexUI.add.scrollablePanel({
            height:100,
            background:buttonPanelBackground,
            panel:{child:radioButton,
                mask:{padding:20}},
            header:buttonHeader,
            //expand:{actions:true, title:true},
            space: {
                left: 15,
                right: 15,
                top: 15,
                bottom: 10,
                panel: {left:100}
            }
        });
        rButtonDialog.layout();
        rButtonDialog.setScrollerEnable(false);
        
        leftPanel.add(this.cardsSlider, 1, "center", {}, true);
        leftPanel.add(rButtonDialog, 0, "center", {top:this.middlePadding}, true);
        leftPanel.layout();

        this.backgroundPanel.add(leftPanel, 0, "center", {right:this.middlePadding, top:15}, true);

        for (let c_ind in this.player.cardTypes) {
            let c = this.player.cardTypes[c_ind];
            if (!(c.name in Deck.Decks[this.deckName].deck)) this.addCardToCardsViewer(c);
        }
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
        if (elem) {
            this.cardsViewer.remove(elem);
            elem.setVisible(false);
            elem.destroy(true);
            this.cardsViewer.layout();
            this.cardsSlider.layout();
        } else {
            this.player.cardTypes[card.name] = card;
        }
        this.newCards.delete(card.name);
    }

    public createCardContainer(card:Card) {
        let maxWidth = 50;

        //@ts-ignore
        let background = this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, CARD_CONTAINER_COLOR)
        .setStrokeStyle(BORDER_WIDTH_TEXT_AREA, GUI_TEXT_AREA_BORDER);

        let sprite = this.scene.add.sprite(0,0, card.image).setOrigin(0.5);
        let scale = maxWidth/sprite.displayWidth;
        sprite.setScale(scale);

        //@ts-ignore
        let nameSizer = this.scene.rexUI.add.sizer({});
        let name = this.scene.add.text(0,0, card.name, { fontSize: '14px', fontStyle: 'bold', fontFamily: 'pressStart', color: '#000000' })
        nameSizer.add(name, 0, "left");

        let action = undefined;
        if (this.newCards.has(card.name)) {
            this.newCards.delete(card.name);
            action = this.scene.add.sprite(sprite.displayWidth/4, sprite.displayHeight/2, 'notification').setScale(2).setOrigin(0.5);
        }

        //@ts-ignore
        let label = this.scene.rexUI.add.label({
            width:150,
            height:50,
            background:background,
            orientation:"h",
            icon:sprite,
            text:nameSizer,
            action:action,
            space: {
                left:5,
                right:5,
                icon:10,
            },
    expandTextWidth: true,
    expandTextHeight: false
        });
        label.layout();

        label.setInteractive().on("pointermove", function(pointer) {
            if (this.dragging) return;
            let obj = this.cardsSlider.getElement("background");
            if (!Phaser.Geom.Rectangle.Contains(new Phaser.Geom.Rectangle(obj.x,obj.y,obj.width,obj.height)
            , pointer.x, pointer.y)) return;
            let drag = this.getDragCard(card);
            const spriteBounds = sprite.getBounds();
            const nameBounds = name.getBounds();
            const hoverZone = new Phaser.Geom.Rectangle(
                spriteBounds.left,
                label.getBounds().top,
                nameBounds.right - spriteBounds.left,
                label.getBounds().height
            );
            if (hoverZone.contains(pointer.x, pointer.y)) {
                drag.label = label;
                drag.setPosition(pointer.x + 200, pointer.y);
                drag.setVisible(true);
            } else {
                drag.setVisible(false);
            }
        },this).on("pointerout", function(pointer) {
            if (this.dragging) return;

            let drag = this.getDragCard(card);
            drag.setVisible(false);
        },this).on("drag", function(pointer) {
            let obj = this.cardsSlider.getElement("background")
            if (!Phaser.Geom.Rectangle.Contains(new Phaser.Geom.Rectangle(obj.x,obj.y,obj.width,obj.height)
            , pointer.x, pointer.y) && !this.dragging) return;
            this.dragging = true;
            this.cardsSlider.setScrollerEnable(false);
            this.deckSlider.setScrollerEnable(false);
            let drag = this.getDragCard(card);

            if (!drag.label) return;

            drag.setVisible(true);
            drag.label.setVisible(false);
            drag.setPosition(pointer.x, pointer.y);
        },this).on("dragend", function(pointer) {
            if (!this.dragging) return;
            this.cardsSlider.setScrollerEnable(true);
            this.deckSlider.setScrollerEnable(true);
            let drag = this.getDragCard(card);
            this.dragging = false;
            if (!drag.label) return

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
        this.deckSliderTitle.setText("Custom Deck - " + Object.keys(Deck.Decks[this.deckName].deck).length + " Cards");
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
            if (card.name in Deck.Decks[this.deckName].deck) {
                return;
            }
        }

        this.removeCardFromCardsViewer(card);

        let cardgui = this.createCard(card);
        cardgui.on("drag", function(pointer) {
            let obj = this.deckSlider.getElement("background");
            if (!Phaser.Geom.Rectangle.Contains(new Phaser.Geom.Rectangle(obj.x,obj.y,obj.width,obj.height)
            , pointer.x, pointer.y) && !this.dragging) return;
            this.dragging = true;
            this.cardsSlider.setScrollerEnable(false);
            this.deckSlider.setScrollerEnable(false);

            let drag = this.getDragCard(card);
            drag.setVisible(true);
            cardgui.setVisible(false);

            drag.setPosition(pointer.x, pointer.y);
        },this).on("dragend", function(pointer) {
            if (!this.dragging) return;

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
        Deck.Decks[this.deckName].deck[card.name] = (card);
        this.persistProgress();
        this.updateDeckTitleText();
        this.update();
    }

    public removeCardFromDeck(card:Card) {
        if (!(card.name in Deck.Decks[this.deckName].deck)) return;

        let elem = this.deckViewer.getElement("items").find(function(c){return c.card.name==card.name})
        this.deckViewer.remove(elem);
        delete Deck.Decks[this.deckName].deck[card.name];
        this.persistProgress();
        this.updateDeckTitleText();
        elem.destroy(true);

        this.addCardToCardsViewer(card);
        this.update();
    }

    public createRadioButton(scene, text, name, config?) {
        if (name === undefined) {
            name = text;
        }
        var button = scene.rexUI.add.label({
            width: 100,
            height: 40,
            text: scene.add.text(0, 0, text, { fontSize: '14px', fontStyle: 'bold', fontFamily: 'pressStart', color: '#000000' }),
            icon: scene.add.circle(0, 0, 10).setStrokeStyle(3, COLOR_DARK),
            space: {
                left: (config && config.left) ? config.left : 62,
                right: (config && config.right) ? config.right : 62,
                icon: (config && config.icon) ? config.icon : 10,
                top:(config && config.top) ? config.top : 15
            },
    
            name: name
        }).layout().setDepth(10).setInteractive({useHandCursor:true});

        button.on("pointerdown", function(pointer) {
            if (this.activeButton) {
                this.activeButton.getElement('icon')
                .setFillStyle(undefined)
            }

            button.getElement('icon')
                    .setFillStyle(COLOR_LIGHT);
            if (button.name == "Custom") {
                NavigationScene.instance.useCustomDeck = true;
            } else {
                NavigationScene.instance.useCustomDeck = false;
            }
            this.activeButton = button;
        },this)

        if (NavigationScene.instance.useCustomDeck && name == "Custom") {
            this.activeButton = button;
            button.getElement('icon')
                    .setFillStyle(COLOR_LIGHT);
        }
        if (!NavigationScene.instance.useCustomDeck && name == "Default") {
            this.activeButton = button;
            button.getElement('icon')
                    .setFillStyle(COLOR_LIGHT);
        }
   
        return button;
    }

    private persistProgress() {
        ProgressStore.save(this.player, Deck.Decks["custom"], this.newCards, NavigationScene.instance.missionKeys.length);
    }
}