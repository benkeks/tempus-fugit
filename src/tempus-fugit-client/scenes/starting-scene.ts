import {SpeechBubble} from "../objects/game-gui-objects/speech-bubble";
import {StoryDialog} from "../mechanics/story-dialog";
import {Mission} from "../mechanics/mission";

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

    function loadFile(filePath) {
      var result = null;
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.open("GET", filePath, false);
      xmlhttp.send();
      if (xmlhttp.status==200) {
        result = xmlhttp.responseText;
      }
      return result;
    }

    var text = loadFile("/test.json");
    var text2 = loadFile("/test2.json");
    var json = JSON.parse(text);
    var json2 = JSON.parse(text2);
    console.log(text);

    let p = Object.setPrototypeOf(json, StoryDialog.prototype);
    let p1 = Object.setPrototypeOf(json2, StoryDialog.prototype);

    let sd1:StoryDialog = Object.create(p);
    let sd2:StoryDialog = Object.create(p1);
    let sd3:StoryDialog = Object.create(p1);
    sd3.triggerFunction = function(mission) {return false};

    console.log(sd1.text);
    console.log(sd2.text);
    let m:Mission = new Mission();
    console.log(sd1.isTriggered(m));
    console.log(sd2.isTriggered(m));
    console.log(sd3.isTriggered(m));
    console.log("nextphase");
    m.nextPhase();
    console.log(sd1.isTriggered(m));
    console.log(sd2.isTriggered(m));
    console.log(sd3.isTriggered(m));

    const title = this.add.text(
        window.innerWidth / 2 ,
        window.innerHeight / 2 - 300,
        "Tempus Fugit",
        { fontSize: 120, fontFamily: "Comfortaa" }
    );
    title.setOrigin(0.5)
    .setColor("#fff");

    const tutText = this.add.text(
      window.innerWidth / 2 ,
      window.innerHeight / 2,
      "Tutorial",
      { fontSize: 100, fontFamily: "Comfortaa" }
    );
    tutText.setOrigin(0.5)
    tutText.setColor("#fff");

    const playText = this.add.text(
        window.innerWidth / 2 ,
        window.innerHeight / 2 + 200,
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
