import {GameInfo} from "../game";
import {SpeechBubble} from "../objects/game-gui-objects/speech-bubble";
import {StoryDialog} from "../mechanics/story-dialog";
import {Mission} from "../mechanics/mission";
import {Card} from "../objects/game-objects/card";
import {DecisionArrow} from "../objects/game-gui-objects/decision-arrow";
import Rectangle = Phaser.GameObjects.Rectangle;
import {EnemyGUI} from "../objects/game-gui-objects/enemy-gui";

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

  }

  create() {
    console.log("booting");

    const title = this.add.text(
        GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 50) ,
        GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 20),
        "Tempus Fugit",
        { fontSize: GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 5), fontFamily: "Comfortaa" }
    );
    title.setOrigin(0.5)
    .setColor("#fff");

    const tutText = this.add.text(
        GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 50),
        GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 50),
      "Tutorial",
      { fontSize: GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 5), fontFamily: "Comfortaa" }
    );
    tutText.setOrigin(0.5);
    tutText.setColor("#fff");

    const playText = this.add.text(
        GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 50),
        GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 70),
      "Play",
      { fontSize: GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 5), fontFamily: "Comfortaa" }
    );
    playText.setOrigin(0.5)
    playText.setInteractive();
    playText.setColor("#fff");

    playText.on("pointerdown", () => {
      this.scene.start("MainScene");
      console.log("started ps");
      console.log("Stopped intro", this.scene.isActive("MainScene"));
      this.scene.stop("StartingScene");
    });
  }
}
