import "phaser";
import {MainScene} from "./scenes/main-scene";
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: "#000",
    plugins: {
        scene: [{
            key: 'rexUI',
            plugin: UIPlugin,
            mapping: 'rexUI'
        },
        ]
    },
    scene: [MainScene]
};

export class Game extends Phaser.Game {
    constructor(config: Phaser.Types.Core.GameConfig) {
        super(config);
    }
}


window.onload = () => {
    new Game(config);
};

