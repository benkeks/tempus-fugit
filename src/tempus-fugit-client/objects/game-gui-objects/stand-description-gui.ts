import { Card } from "../game-objects/card";
import Text = Phaser.GameObjects.Text;
import Rectangle = Phaser.GameObjects.Rectangle;
import Line = Phaser.GameObjects.Line;
import Tween = Phaser.Tweens.Tween;
import { FormulaGUI } from "./formula-gui";
import {CardGUI} from "./card-gui";

/**
 * @author Florian
 */
export class StandDescriptionGUI extends CardGUI {

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        card: Card
    ) {
        super(scene, x, y, card);
    }


}
