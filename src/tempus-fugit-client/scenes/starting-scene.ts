import { GameInfo } from "../game";
import { Formula } from "../temporal-logic/formula";
import {Variable} from "../temporal-logic/variable";

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

        this.load.spritesheet("gamelogo", "assets/title_screen/TempusFugit-Sheet.png", {frameWidth: 105, frameHeight: 78});
    }

    create(data) {
        console.log("booting");

        this.cameras.main.setBackgroundColor('#89CFF0')


        /*const title = this.add.text(
            GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 50),
            GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 20),
            "Tempus Fugit",
            { fontSize: GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 5), fontFamily: "appleKid" }
        );
        title.setOrigin(0.5)
            .setColor("#fff");*/

        /*const tutText = this.add.text(
            GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 50),
            GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 50),
            "Tutorial",
            { fontSize: GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 5), fontFamily: "appleKid" }
        );
        tutText.setOrigin(0.5);
        tutText.setColor("#fff");*/
        

        let f:Formula = new Formula("#En|#G!n");
        let v:Variable = f.variables["n"];
        v.values = [false, true,true];
        v.finiteStatesFuture = false;
        v.finiteStatesPast = true;
        v.defaultValueFuture = false;
        v.defaultValuePast = false;

        console.log(f.generateRepresentation(true, true));
        console.log(f.evaluate(0));
        console.log(f.evaluate(1));
        console.log(f.evaluate(2));

        let bla = this.add.sprite(950,450,"gamelogo",0);
        bla.setScale(8,8);
        this.anims.create({
            key: "gamelogo2",
            frames: this.anims.generateFrameNumbers("gamelogo", {start:0}),
            frameRate: 10,
            repeat: -1
        });
        bla.anims.play("gamelogo2");

        const playText = this.add.text(
            GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 50),
            GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 85),
            "Play",
            { fontSize: GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 5), fontFamily: "appleKid" }
        );
        playText.setOrigin(0.5);
        playText.setInteractive();
        playText.setColor("#fff");

        playText.on("pointerdown", () => {
            let s:String = "abc";
            this.scene.start("NavigationScene");
        });
    }
}
