import "phaser";
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';
import { StartingScene } from "./scenes/starting-scene";
import WebFontLoaderPlugin from 'phaser3-rex-plugins/plugins/webfontloader-plugin';
import { NavigationScene } from "./scenes/navigation-scene";
import { MissionScene } from "./scenes/mission-scene";
import { HelpScene } from "./scenes/help-scene";
import { PauseScene } from "./scenes/pause-scene";
import { DeathScene } from "./scenes/death-scene";
import { MonologScene } from "./scenes/monolog-scene";
import { NewCardsScene } from "./scenes/new-cards-scene";
import { BTextBoxScene } from "./scenes/blocking-textbox-scene";
import { TutorialScene } from "./scenes/tutorial-scene";
import { MusicScene } from "./scenes/music-scene";
import { DialogScene } from "./scenes/dialog-scene";
import { DeckBuilderScene } from "./scenes/deck-builder-scene";
import { CreditScene } from "./scenes/credit-scene";


export abstract class GameInfo {
    public static readonly X_AXIS = 0;
    public static readonly Y_AXIS = 1;

    public static hovering;

    public static width: number = 1920;
    public static height: number = 1080;

    public static scale: number = 5;

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
    pixelArt: false,
    antialias: true,
    antialiasGL: true,
    roundPixels: false,
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
    scene: [StartingScene, NavigationScene, MissionScene, HelpScene, PauseScene, MonologScene, DeathScene, NewCardsScene, BTextBoxScene, TutorialScene, MusicScene, DialogScene, DeckBuilderScene, CreditScene]
};

export class Game extends Phaser.Game {
    constructor(config: Phaser.Types.Core.GameConfig) {
        super(config);

        // Keep dynamic text smooth (canvas textures) while forcing pixel-art filtering on sprite textures.
        this.textures.on(Phaser.Textures.Events.ADD, (_key: string, texture: Phaser.Textures.Texture) => {
            const source = texture.source && texture.source[0] as any;
            const image = source && source.image;
            const isCanvasTexture = Boolean(source && (
                source.isCanvas ||
                (typeof HTMLCanvasElement !== "undefined" && image instanceof HTMLCanvasElement)
            ));

            if (!isCanvasTexture) {
                texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
            }
        });
    }
}


window.onload = () => {
    new Game(config);
};

