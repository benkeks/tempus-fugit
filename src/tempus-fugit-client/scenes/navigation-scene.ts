import {Mission} from "../mechanics/mission";
import {Card} from "../objects/game-objects/card";
import {Enemy} from "../objects/game-objects/enemy";
import {Player} from "../objects/game-objects/player";
import {Deck} from "../objects/game-objects/deck";

export class NavigationScene extends Phaser.Scene {

    constructor() {
        super({
            key: "NavigationScene"
        });
    }

    preload() {
        Mission.player = new Player("Willy", 50, 5);
        Mission.deck = new Deck();

        this.load.pack("preload", "assets/pack.json", "preload");

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
                Mission.deck.addCard(c.copy());
            }
        }

        console.log(Mission.deck);
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

    create() {
        this.scene.start("MissionScene", new String("mission1"));
    }
}
