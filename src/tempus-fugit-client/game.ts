import "phaser";
import {MainScene} from "./scenes/main-scene";
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';
import {StartingScene} from "./scenes/starting-scene";
import WebFontLoaderPlugin from 'phaser3-rex-plugins/plugins/webfontloader-plugin';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.ScaleModes.FIT,
        width: 1920,
        height: 1080
    },
    backgroundColor: "#000",
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
    scene: [StartingScene, MainScene]
};

export class Game extends Phaser.Game {
    constructor(config: Phaser.Types.Core.GameConfig) {
        super(config);
    }
}


window.onload = () => {
    new Game(config);
};

