import {Mission} from "../mechanics/mission";
import {Card} from "../objects/game-objects/card";
import {Enemy} from "../objects/game-objects/enemy";
import {Player} from "../objects/game-objects/player";
import {Deck} from "../objects/game-objects/deck";
import Image = Phaser.GameObjects.Image;
import TileSprite = Phaser.GameObjects.TileSprite;
import {GameInfo} from "../game";

export class NavigationScene extends Phaser.Scene {

    public backgroundTexture:TileSprite;

    public player:Player;
    public deck:Deck;

    constructor() {
        super({
            key: "NavigationScene"
        });
    }

    preload() {
        this.player = new Player("Willy", 50, 5);
        this.deck = new Deck();

        this.load.pack("preload", "assets/pack.json", "preload");

        // loading player sprite
        this.load.spritesheet("player", "assets/sprites/player/player_sheet.png",
            { frameWidth: 32, frameHeight: 64 });

        this.load.image("water_background", "assets/navigation_scene/texture/water.png");

        let enemies:string = NavigationScene.loadFile("json/enemies.json");
        Enemy.createFromJSON(enemies, this);
        console.log(Enemy.enemies);

        let cards:string = NavigationScene.loadFile("json/cards.json");
        Card.createFromJSON(cards);
        console.log(Card.cards);

        let missions:string = NavigationScene.loadFile("json/mission.json");
        Mission.createFromJSON(missions);
        console.log(Mission.Missions);

        for (let c_key in Card.cards) {
            let c:Card = Card.cards[c_key];

            for (let i=0; i < c.inDeckAtStart; i++) {
                this.deck.addCard(c.copy());
            }
        }

        this.deck.shuffle();
        console.log(this.deck);
    }

    public static loadFile(filePath): string{
        let fd = null;
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", filePath, false);
        xmlhttp.send();
        if (xmlhttp.status==200) {
            fd = xmlhttp.responseText;
        }
        return fd;
    }

    public getData(key:string) {
        return [key, this.player, this.deck];
    }

    create() {
        //this.backgroundTexture = this.add.tileSprite(GameInfo.width/2,GameInfo.height/2, GameInfo.width, GameInfo.height, "water_background");

        this.scene.start("MissionScene", this.getData("mission1"));
    }
}
