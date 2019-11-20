import "phaser"
import GameConfig = Phaser.Types.Core.GameConfig;

const config: GameConfig = {
    width: 1920,
    height: 1080,
    backgroundColor: 0x000000,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [],
    physics: {
        default: 'arcade'
    }
};

export class Game extends Phaser.Game {
    constructor(config: GameConfig) {
        super(config);
    }
}

window.onload = () => {
    new Game(config);
};