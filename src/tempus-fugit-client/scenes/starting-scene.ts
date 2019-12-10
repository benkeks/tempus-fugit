import {SpeechBubble} from "../objects/game-gui-objects/speech-bubble";
import {StoryDialog} from "../mechanics/story-dialog";
import {Mission} from "../mechanics/mission";
import {Card} from "../objects/game-objects/card";

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

    /*
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

    var text = loadFile("/assets/cards/cards.json");
    let ps = [];
    let cards:Card[] = [];
    let json = JSON.parse(text);
    for (let t of json.cards) {
      console.log(t);
      let p = Object.setPrototypeOf(t, Card.prototype);
      ps.push(p);
      cards.push(Object.create(p));

    }

    //console.log(text);
    console.log(cards);
    let c1:Card = cards[0];
    console.log(c1.getAttackPower());*/

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
