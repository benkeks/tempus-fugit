import { CardGUI } from "./card-gui";
import { StackGUI } from "./stack-gui";
import { BoardGUI } from "./board-gui";
import { Card } from "../game-objects/card";
import { Hand, HandListener } from "../game-objects/hand";

/**
 * @author Mustafa
 */
export class HandGUI extends Phaser.GameObjects.Container implements HandListener {
    private hand: Hand; // hand object associated with handGUI object
    private cardGUIs: CardGUI[] = []; // a list of cardGUI objects on the hand
    private readonly stack: StackGUI;
    private readonly board: BoardGUI;
    private readonly maxCards: number = 5;

    constructor(
        scene: Phaser.Scene,
        hand: Hand,
        stack: StackGUI,
        board: BoardGUI
    ) {
        super(scene);
        this.board = board;
        this.stack = stack;
        this.setOutlines();
        this.hand = hand;

        this.hand.listener.push(this);
        scene.add.existing(this);
    }

    /**
     * sets card outline, (white border to show where cards are positioned in hand)
     */
    private setOutlines(): void {
        let i = 0;
        while (i < this.maxCards) {
            this.scene.add.image(i++ * 200 + 550, 850, "card-outline").setDepth(-1);
        }
    }

    /**
     * adds one card to hand if there is enough space for it
     * @param card to be added
     */
    addCdard(card: Card, pos: number): void {
        // add card to hand, enable dragging
        let cardGUI = new CardGUI(
            this.scene,
            pos * 200 + 550,
            850,
            card
        );
        this.add(cardGUI);

        cardGUI.setInteractive();
        cardGUI.enableDragging();
        this.cardGUIs.push(cardGUI);
    }

    getCardGUIIndex(cardGUI: CardGUI): number {
        for (let index in this.cardGUIs) {
            if (this.cardGUIs[parseInt(index)] == cardGUI) return parseInt(index);
        }
        return -1;
    }

    /**
     * moves a card to stack
     * @param pos: position of cardGUI to remove
     */
    moveToStack(pos: number): void {
        let c = this.cardGUIs[pos];
        this.stack.addCardGUI(c);
        this.cardGUIs.splice(pos, 1);
        this.remove(c);
    }

    /**
     * tints all cardGUI objects in hand black and disables dragging
     */
    fadeOut() {
        for (let c of this.cardGUIs) {
            c.fadeOut();
            c.disableDragging();
        }
    }

    /**
     * removes the tint from all cardGUI objects and enables dragging
     */
    fadeIn() {
        for (let c of this.cardGUIs) {
            c.fadeIn();
            c.enableDragging();
        }
    }

    addCard(card: Card): void {
        this.addCard(card, pos);
    }
    removeCard(card: Card): void {
        this.moveToStack(pos);
    }
}
