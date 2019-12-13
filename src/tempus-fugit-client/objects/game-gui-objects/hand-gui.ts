import { CardGUI } from "./card-gui";
import { StackGUI } from "./stack-gui";
import { Card } from "../game-objects/card";
import { Hand, HandListener } from "../game-objects/hand";

/**
 * @author Mustafa
 */
export class HandGUI extends Phaser.GameObjects.Container implements HandListener {
    private hand: Hand; // hand object associated with handGUI object
    private cardGUIs: CardGUI[] = []; // a list of cardGUI objects on the hand
    private readonly stack: StackGUI;
    private readonly maxCards: number = 5;

    constructor(
        scene: Phaser.Scene,
        hand: Hand,
        stack: StackGUI,
    ) {
        super(scene);
        this.stack = stack;
        this.hand = hand;
        this.hand.listener.push(this);
        scene.add.existing(this);
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


    /**
     * adds one cardGUI object for given card to hand 
     * @param card: card to be added
     */
    addCard(card: Card): void {
        // add card to hand, enable dragging
        let cardGUI = new CardGUI(
            this.scene,
            1 * 200 + 550,
            850,
            card
        );
        this.add(cardGUI);

        cardGUI.setInteractive();
        cardGUI.enableDragging();
        this.cardGUIs.push(cardGUI);
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
