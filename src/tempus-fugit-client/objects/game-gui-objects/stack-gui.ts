import { CardGUI } from "./card-gui";

/**
 * @author Mustafa
 */
export class StackGUI extends Phaser.GameObjects.Image {
    private readonly _x: number;
    private readonly _y: number;
    private cardGUIs: CardGUI[] = []; // a list of cardGUI objects on the stack

    constructor(scene: Phaser.Scene, texture: string, x: number = 200, y: number = 950) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        this._x = x;
        this._y = y;
    }

    /**
     * adds cardGUI object to the stack, the object will be tinted black and not draggable
     * @param cardGUI
     */
    addCardGUI(cardGUI: CardGUI) {
        this.cardGUIs.push(cardGUI);
        cardGUI.setPosition(this.x, this.y);
        cardGUI.fadeOut();
        cardGUI.disableDragging();
    }

    /**
     * deletes all objects on the stack
     */
    clear(): void {
        for (let cardGUI of this.cardGUIs) {
            cardGUI.destroy();
        }
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }
}
