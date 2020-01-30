import { Hand } from "../game-objects/hand";
import { CardGUI } from "./card-gui";
import { DeckGUI } from "./deck-gui";
import { GameState } from "../game-objects/game-state";
import { MissionScene } from "../../scenes/mission-scene";
import { HandGUI } from "./hand-gui";
import { Card } from "../game-objects/card";
import { DiscardCard } from "./discard-card";

export class DiscardGUI extends Phaser.GameObjects.Container {

    constructor(
        scene: MissionScene,
        hand: Hand,
        deck: DeckGUI,
        handGUI: HandGUI,
        card: Card
    ) {
        super(scene);

        console.log('discardCard');

        // make card on handgui invisible
        for (let cardGUI of handGUI.cardGUIs)
            cardGUI.setVisible(false);

        // create discard text
        let discardText = scene.add.text(850, 1000, 'Click one card to discard', {
            fontSize: 40, fontFamily: "pressStart"
        });

        // make deck invisible
        deck.toggleVisible(false);

        let discardCards = [];

        // create new discard objects
        for (let index in handGUI.cardGUIs) {
            discardCards.push(
                new DiscardCard(scene, 600 + Number(index) * 200, 860, handGUI.cardGUIs[index].card));
        }
        // 6th card
        discardCards.push(new DiscardCard(scene, 1600, 860, card));

        for (let discardCard of discardCards) {
            discardCard
                .on('pointerdown', function (
                ) {
                    // destroy discard cards
                    for (let c of discardCards) c.destroy();
                    // destroy discard text
                    discardText.destroy()
                    // make deck visible
                    deck.toggleVisible(true);
                    // make hand cards visible
                    for (let c of handGUI.cardGUIs) c.setVisible(true);
                    // remove clicked card from hand
                    hand.removeCard(this.card);
                    if (this.card != card) hand.addCardToGUI(card);
                    hand.discardGUIStarted = false;
                    if (hand.cardQueue.length == 0) {
                        hand.playNextCard();
                    } else {
                        setTimeout(() => {
                            hand.playNextCard();
                        }, 250);
                    }
                });
        }
    }
}