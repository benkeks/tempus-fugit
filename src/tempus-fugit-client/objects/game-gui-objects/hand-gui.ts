import { CardGUI } from "./card-gui";
import { StackGUI } from "./stack-gui";
import { Card } from "../game-objects/card";
import { Hand, HandListener } from "../game-objects/hand";
import { DeckGUI } from "./deck-gui";
import { isForXStatement } from "@babel/types";
import { Mission } from "../../mechanics/mission";
import { GameState, GameStateListener } from "../game-objects/game-state";
import { Variable } from "../../temporal-logic/variable";
import { MissionScene } from "../../scenes/mission-scene";
import { GameInfo } from "../../game";


/**
 * @author Mustafa
 */
export class HandGUI extends Phaser.GameObjects.Container implements HandListener, GameStateListener {

    private hand: Hand; // hand object associated with handGUI object
    private cardGUIs: CardGUI[] = []; // a list of cardGUI objects on the hand
    private readonly stack: StackGUI;
    private readonly deck: DeckGUI;
    private readonly maxCards: number = 5;
    public gamestate: GameState;
    public missionScene: MissionScene;

    constructor(
        scene: MissionScene,
        hand: Hand,
        stack: StackGUI,
        deck: DeckGUI,
        gamestate: GameState,
    ) {
        super(scene);
        this.stack = stack;
        this.hand = hand;
        this.hand.listener.push(this);
        this.deck = deck;
        this.gamestate = gamestate;
        this.gamestate.listener.push(this);
        this.missionScene = scene;
    }

    /**
     * tints all cardGUI objects in hand black and disables dragging
     */
    fadeOut() {
        //setTimeout(() => this.unhoverAll(true), 0);
        for (let c of this.cardGUIs) {
            c.fadeOut();
            c.disableDragging();
            this.scene.tweens.add({
                targets: c.cross,
                alpha: 0,
                duration: 200
            });
        }
    }

    /**
     * removes the tint from all cardGUI objects and enables dragging
     */
    fadeIn(gamestate: GameState = this.gamestate) {
        //setTimeout(() => this.unhoverAll(true), 0);
        for (let c of this.cardGUIs) {
            c.fadeIn();
            if (gamestate.evaluate(c.card.getFormula())) {
                c.enableDragging();
                this.scene.tweens.add({
                    targets: c.cross,
                    alpha: 0,
                    duration: 200
                });
            } else {
                c.fadeOut();
                this.scene.tweens.add({
                    targets: c.cross,
                    alpha: 0.4,
                    duration: 200,
                    delay: 300
                });
            }

        }
    }


    /**
     * toggles highlighting a card
     * don't call hover method of cardGUI objects; user this moethod
     * @param card
     * @param unhover: true if card need to return to normal position on hand 
     */
    toggleHovering(card: CardGUI, unhover: Boolean): void {

        if (!this.cardGUIs.includes(card))
            return;

        let allTweensDone = true;
        for (let c of this.cardGUIs)
            if ((typeof c.hoverTween !== 'undefined' && c.hoverTween.isPlaying()) || (typeof c.unhoverTween !== 'undefined' && c.unhoverTween.isPlaying()))
                allTweensDone = false;

        // if tween animations are not done wait 100 msec(duration of tweens)
        // and try again
        let self = this;
        if (!allTweensDone) {
            new Promise(resolve => setTimeout(resolve, 100))
                .then(() => {
                    self.unhoverAll();
                    if (!unhover)
                        card.hover()
                })
        } else {

            this.unhoverAll();

            if (!unhover)
                card.hover();
        }
    }

    /**
     * returns all cards to original position
     * adds animations for cards if immediate is false ( by dafault )
     */
    unhoverAll(immediate: boolean = false): void {

        if (!immediate) {
            for (let card of this.cardGUIs)
                card.unhover();
        } else {
            for (let card of this.cardGUIs) {
                card.x = card.cardOriginX;
                card.y = card.cardOriginY;
                card.angle = card.cardOriginAngle;
                card.setDepth(card.cardOriginZ);
                card.setScale(1);
            }
        }
    }

    /**
     * rearranges card in hand
     * adds animations for cards if immediate is false ( by dafault )
     */
    arrangeCards(immediate: boolean = false): void {

        // used static values since we only have a max of 5 cards
        let angles = [-20, -10, 0, 10, 20];
        let x = [700, 830, 960, 1090, 1220];
        let y = [980, 950, 940, 950, 980];
        let yOff = [0, 0, 10, 25, 0];

        let n = this.cardGUIs.length;
        let even = n % 2 == 0;
        let angleOffset = even ? 5 : 0;
        let xOffset = even ? 65 : 0;

        this.unhoverAll(immediate);

        for (let index in this.cardGUIs) {
            let i = parseInt(index)
            let card = this.cardGUIs[i];
            let k = Math.floor((5 - n) / 2) + i;
            let yOffset = even ? yOff[k] : 0;

            let newX = x[k] + xOffset;
            let newY = y[k] + yOffset;
            let newAngle = angles[k] + angleOffset;

            card.cardOriginAngle = newAngle;
            card.cardOriginX = newX;
            card.cardOriginY = newY;
            card.cardOriginZ = 2 * i;
            card.setDepth(2 * i);
            card.cross.x = newX;
            card.cross.y = newY;
            card.cross.setDepth(2 * i + 1);

            if (!immediate) {
                this.scene.tweens.add({
                    targets: card,
                    x: newX,
                    y: newY,
                    z: 2 * i,
                    angle: newAngle,
                    ease: 'power2',
                    duration: 400,
                });
                card.cross.x = card.cardOriginX;
                card.cross.y = card.cardOriginY;
                card.cross.angle = card.cardOriginAngle;
                card.cross.setAlpha(0);
                this.scene.tweens.add({
                    targets: card.cross,
                    x: newX,
                    y: newY,
                    z: 2 * i + 1,
                    angle: newAngle,
                    ease: 'power2',
                    duration: 400,
                });
            }
            else {
                card.x = card.cardOriginX;
                card.y = card.cardOriginY;
                card.angle = card.cardOriginAngle;
                card.cross.x = card.cardOriginX;
                card.cross.y = card.cardOriginY;
                card.cross.angle = card.cardOriginAngle;
            }
        }
    }

    /**
     * adds one cardGUI object for given card to hand 
     * @param card: card to be added
     */
    async addCard(card: Card) {
        // add card to hand, enable dragging
        let cardGUI = new CardGUI(
            this.scene,
            this.deck.x,
            this.deck.y,
            card
        );

        //this.add(cardGUI);
        cardGUI.setInteractive();
        cardGUI.enableDragging();
        this.cardGUIs.push(cardGUI);
        this.arrangeCards();

        if (this.hand.active) this.fadeIn(this.gamestate);
        else this.fadeOut();
    }

    /**
     * lets user choose a card to be disgarded when hand is full (5 card in hand)
     * @param card: 6th card
     */
    async discardCard(card: Card) {
        console.log('disgardCard');
        //a little bit hacky solution; adding a big black rectangle to current screen the destroying it later.
        let removedCard;
        let top = this.missionScene.gameStateGUI.energyTable.bottom;
        let bottom = GameInfo.height;

        let backgroundRect = this.scene.add.rectangle(GameInfo.width / 2, bottom + (bottom - top) / 2, GameInfo.width, (bottom - top), 0x000000, 0.5);
        backgroundRect.setDepth(1000);

        if (removedCard.card !== card) {
            // user disgards card previously on hand
            this.hand.removeCard(removedCard.card);
            this.hand.addCard(card);
        } else {
            // user disgards 6th card
            this.stack.addCardGUI(removedCard);
        }
    }

    /**
     * moves a cardGUI object to stack
     * @param card: card to be removed
     */
    async removeCard(card: Card) {
        for (let pos in this.cardGUIs) {
            if (this.cardGUIs[pos].card === card) {
                this.stack.addCardGUI(this.cardGUIs[pos]);
                //this.remove(this.cardGUIs[pos]);
                this.cardGUIs.splice(parseInt(pos), 1);
                this.arrangeCards(true);
                return;
            }
        }
    }

    async Activated(hand: Hand, active: boolean) {
        if (active) this.fadeIn(this.gamestate);
        else this.fadeOut();
    }

    async roundChanged(gameSate: GameState, lastRound: number, activeRound: number) { }
    async variableChanged(gameState: GameState, oldVariable: Variable, variable: Variable, valueChanges: { [state: number]: boolean; }) {
        if (this.hand.active) this.fadeIn();
    }
    async energyChanged(gameState: GameState, oldEnergy: number, newEnergy: number, oldMaxEnergy: number, newMaxEnergy: number) { }
    async activated(gameState: GameState) { }
}
