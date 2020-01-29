import { Deck, DeckListener } from "../game-objects/deck";
import { CardGUI } from "./card-gui";
import { Card } from "../game-objects/card";

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
        x: number = 1545,
        y: number = 920
    ) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        this.deck = deck;
        this.scene = scene;
        this.text = this.scene.add.text(x - 50, y + 100, deck.cards.length + ' Karten').setStyle({
            fontSize: '12px',
            fontFamily: 'pressStart',
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

    cardTypesChanged(deck: Deck, newCards: Card[]) { }
    /**
    * makes all deck related objects invisible / visible
    * @param visible: true to make deck visible 
    */
    public toggleVisible(visible: boolean) {
        this.text.visible = visible;
        this.visible = visible;
    }
}
