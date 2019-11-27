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
