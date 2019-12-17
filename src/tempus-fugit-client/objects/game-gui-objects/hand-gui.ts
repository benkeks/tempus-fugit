import { CardGUI } from "./card-gui";
import { StackGUI } from "./stack-gui";
import { Card } from "../game-objects/card";
import { Hand, HandListener } from "../game-objects/hand";
import { DeckGUI } from "./deck-gui";
import { isForXStatement } from "@babel/types";

/**
 * @author Mustafa
 */
export class HandGUI extends Phaser.GameObjects.Container implements HandListener {
    private hand: Hand; // hand object associated with handGUI object
    private cardGUIs: CardGUI[] = []; // a list of cardGUI objects on the hand
    private readonly stack: StackGUI;
    private readonly deck: DeckGUI;
    private readonly maxCards: number = 5;

    constructor(
        scene: Phaser.Scene,
        hand: Hand,
        stack: StackGUI,
        deck: DeckGUI,
    ) {
        super(scene);
        this.stack = stack;
        this.hand = hand;
        this.hand.listener.push(this);
        this.deck = deck;
        scene.add.existing(this);



    }

    /**
     * tints all cardGUI objects in hand black and disables dragging
     */
    fadeOut() {
        for (let c of this.cardGUIs) {
            c.fadeOut();
        }
    }

    /**
     * removes the tint from all cardGUI objects and enables dragging
     */
    fadeIn() {
        for (let c of this.cardGUIs) {
            c.fadeIn();
        }
    }


    /**
     * toggles highlighting a card
     * don't call hover method of cardGUI objects; user this moethod
     * @param card 
     */
    toggleHovering(card: CardGUI): void {

        if (!this.cardGUIs.includes(card))
            return;

        const hover = card.hovering;

        let allTweensDone = true;
        for (let c of this.cardGUIs)
            if ((typeof c.hoverTween !== 'undefined' && c.hoverTween.isPlaying()) || (typeof c.unhoverTween !== 'undefined' && c.unhoverTween.isPlaying()))
                allTweensDone = false;

        // terminate if not all previous tweens are  over; else cards can get stuck
        if (!allTweensDone)
            return;

        this.unhoverAll();

        if (!hover)
            card.hover()
    }

    /**
     * returns all cards to original position
     */
    unhoverAll(): void {
        for (let card of this.cardGUIs)
            card.unhover()
    }

    /**
     * rearranges card in hand
     * adds animations for last card ( newly added )
     */
    private arrangeCards(): void {

        // used static values since we only have a max of 5 cards
        let angles = [-20, -10, 0, 10, 20];
        let x = [700, 830, 960, 1090, 1220];
        let y = [980, 950, 940, 950, 980];
        let yOff = [0, 0, 10, 25, 0];

        let n = this.cardGUIs.length;
        let even = n % 2 == 0;
        let angleOffset = even ? 5 : 0;
        let xOffset = even ? 65 : 0;

        this.unhoverAll();

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
            //card.cardOriginDepth = card.depth;

            this.scene.tweens.add({
                targets: card,
                x: newX,
                y: newY,
                angle: newAngle,
                ease: 'power2',
                duration: 1500,
            });

            // console.log('i', i, 'card.angle', 'k', k, 'card.angle', card.angle, 'card.x', card.x, 'card.y', card.y);
        }


    }
    /**
     * adds one cardGUI object for given card to hand 
     * @param card: card to be added
     */
    addCard(card: Card): void {
        // add card to hand, enable dragging
        let cardGUI = new CardGUI(
            this.scene,
            this.deck.x,
            this.deck.y,
            card
        );

        this.add(cardGUI);
        cardGUI.setInteractive();
        cardGUI.enableDragging();
        this.cardGUIs.push(cardGUI);
        this.arrangeCards();
    }

    /**
     * moves a cardGUI object to stack
     * @param card: card to be removed
     */
    removeCard(card: Card): void {
        for (let pos in this.cardGUIs) {
            if (this.cardGUIs[pos].card === card) {
                this.stack.addCardGUI(this.cardGUIs[pos]);
                this.remove(this.cardGUIs[pos]);
                this.cardGUIs.splice(parseInt(pos), 1);
                return;
            }
        }
    }
}
