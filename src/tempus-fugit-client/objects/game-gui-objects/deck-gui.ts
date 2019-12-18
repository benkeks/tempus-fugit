import { Deck, DeckListener } from "../game-objects/deck";
import { CardGUI } from "./card-gui";

/**
 * @author Mustafa
 */
export class DeckGUI extends Phaser.GameObjects.Sprite implements DeckListener {
    private deck: Deck;
    private text: Phaser.GameObjects.Text; // shows number of cards

    constructor(
        scene: Phaser.Scene,
        texture: string,
        deck: Deck,
        x: number = 1700,
        y: number = 930
    ) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        this.deck = deck;
        this.scene = scene;
        this.text = this.scene.add.text(x - 35, y + 100, deck.cards.length + ' Karten').setStyle({
            fontFamily: 'Arial',
        });
        this.deck.listener.push(this);
    }

    /**
     * display number of cards in deck
     * @param numCards: number of cards
     */
    numCardsChanged(numCards: number): void {
        this.text.setText(numCards + ' Karten');
    }
}
