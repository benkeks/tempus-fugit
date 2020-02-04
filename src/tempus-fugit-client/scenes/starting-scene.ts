import { GameInfo } from "../game";
import {SoundButton} from "../objects/sound-button";
import { Formula } from "../temporal-logic/formula";
import { GameState } from "../objects/game-objects/game-state";
import { MusicScene } from "./music-scene";

export class StartingScene extends Phaser.Scene {

    constructor() {
        super({
            key: "StartingScene"
        });
    }

    preload() {
        // @ts-ignore
        this.load.rexWebFont({
            google: {
                families: ["Comfortaa"]
            }
        });

        this.load.spritesheet("gamelogo", "assets/title_screen/TempusFugit-Sheet.png", { frameWidth: 105, frameHeight: 78 });
    }

    create(data) {

        /*let f = new Formula("(#O#On)&#F(l&t)&s");
        console.log(f.generateRepresentation(true, true));
        console.log(f.generateRepresentation(true, false));
        let gs = new GameState();
        gs.setVariableValues({"l": {0:false, 1:true, 2:false},
                                "t":{0:true, 1:false, 2:true},
                                "n":{0:true, 1:false, 2:false},
                                "s":{0:false, 1:false, 2:true}});
        gs.activeState = 2;
        console.log(gs.evaluate(f));*/
        this.scene.run("MusicScene", {startSong:"pacman"});

        this.cameras.main.setBackgroundColor('#89CFF0')

        let bla = this.add.sprite(950, 450, "gamelogo", 0);
        bla.setScale(8, 8);
        this.anims.create({
            key: "gamelogo2",
            frames: this.anims.generateFrameNumbers("gamelogo", { start: 0 }),
            frameRate: 10,
            repeat: -1
        });
        bla.anims.play("gamelogo2");

        const playText = this.add.text(
            GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 50),
            GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 85),
            "Play",
            { fontSize: GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 4), fontFamily: "pressStart" }
        );
        playText.setOrigin(0.5);
        playText.setColor("#402539");

        playText.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
            let s: String = "abc";
            this.scene.start("NavigationScene", {tutorial:true});
        });

        playText.on('pointerover', () => {
            playText.setColor('#ffffff');
        });

        playText.on('pointerout', () => {
            playText.setColor('#402539');

        });

    }
}
