import "phaser";
import { MissionScene } from "./scenes/mission-scene";
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';
import { StartingScene } from "./scenes/starting-scene";
import WebFontLoaderPlugin from 'phaser3-rex-plugins/plugins/webfontloader-plugin';
import {NavigationScene} from "./scenes/navigation-scene";

export abstract class GameInfo {
    public static readonly X_AXIS = 0;
    public static readonly Y_AXIS = 1;

    public static hovering;

    public static width: number = 1920;
    public static height: number = 1080;

    public static convertRelativeCoordinates(axis: number, coordinate: number): number {
        if (axis == this.X_AXIS) {
            return (coordinate / 100.0) * this.width;
        } else if (this.Y_AXIS) {
            return (coordinate / 100.0) * this.height;
        } else {
            throw new TypeError("Axis has to be 0 or 1!");
        }

    }
}

const config = {
    type: Phaser.AUTO,
    width: GameInfo.width,
    height: GameInfo.height,
    scale: {
        mode: Phaser.Scale.ScaleModes.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: "#000",
    pixelArt: true,
    plugins: {
        scene: [{
            key: 'rexUI',
            plugin: UIPlugin,
            mapping: 'rexUI'
        }],
        global: [{
            key: 'WebFontLoader',
            plugin: WebFontLoaderPlugin,
            start: true
        }]
    },
    scene: [StartingScene, NavigationScene ,MissionScene]
};

export class Game extends Phaser.Game {
    constructor(config: Phaser.Types.Core.GameConfig) {
        super(config);
    }
}


window.onload = () => {
    new Game(config);
};

