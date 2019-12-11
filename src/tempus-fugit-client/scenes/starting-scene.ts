import {SpeechBubble} from "../objects/game-gui-objects/speech-bubble";
import {StoryDialog} from "../mechanics/story-dialog";
import {Mission} from "../mechanics/mission";
import {Card} from "../objects/game-objects/card";

export class StartingScene extends Phaser.Scene {

  public static readonly X_AXIS = 0;
  public static readonly Y_AXIS = 0;

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

  public static convertRelativeCoordinates(scene:Phaser.Scene, axis:number, coordinate:number):number {
    if (axis == this.X_AXIS) {
      return (coordinate/100) * scene.scale.width;
    } else if (this.Y_AXIS) {
      return (coordinate/100) * scene.scale.height;
    } else {
      throw new TypeError("Axis has to be 0 or 1!");
    }

  }

  create() {
    console.log("booting");



    const title = this.add.text(
        StartingScene.convertRelativeCoordinates(this, StartingScene.X_AXIS, 50) ,
        StartingScene.convertRelativeCoordinates(this, StartingScene.Y_AXIS, 10),
        "Tempus Fugit",
        { fontSize: 120, fontFamily: "Comfortaa" }
    );
    title.setOrigin(0.5)
    .setColor("#fff");

    const tutText = this.add.text(
        StartingScene.convertRelativeCoordinates(this, StartingScene.X_AXIS, 50),
        StartingScene.convertRelativeCoordinates(this, StartingScene.Y_AXIS, 25),
      "Tutorial",
      { fontSize: 100, fontFamily: "Comfortaa" }
    );
    tutText.setOrigin(0.5);
    tutText.setColor("#fff");

    const playText = this.add.text(
        StartingScene.convertRelativeCoordinates(this, StartingScene.X_AXIS, 50),
        StartingScene.convertRelativeCoordinates(this, StartingScene.Y_AXIS, 35),
      "Play",
      { fontSize: 100, fontFamily: "Comfortaa" }
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
