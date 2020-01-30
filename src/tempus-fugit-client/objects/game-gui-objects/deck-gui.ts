import { Deck, DeckListener } from "../game-objects/deck";
import { CardGUI } from "./card-gui";
import { Card } from "../game-objects/card";

/**
 * @author Mustafa
 */
export class DeckGUI extends Phaser.GameObjects.Container implements DeckListener {
    private deck: Deck;
    public text: Phaser.GameObjects.Text; // shows number of cards
    public description: Phaser.GameObjects.Text;
    public x: number;
    public y: number;

    constructor(
        scene: Phaser.Scene,
        deck: Deck,
        x: number = 1545,
        y: number = 920
    ) {
        super(scene, x, y);
        scene.add.existing(this);
        this.deck = deck;
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.text = this.scene.add.text(x - 30, y + 40, deck.cards.length.toString()).setStyle({
            fontSize: '30px',
            fontFamily: 'pressStart',
        });
        this.description = this.scene.add.text(x - 55, y + 90, "Cards in\nthe Deck").setStyle({
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
        if (numCards < 10) {
            this.text.x = this.x - 7;
        } else {
            this.text.x = this.x - 30;
        }
        this.text.setText(numCards.toString());
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
