import {Mission} from "../mechanics/mission";
import {Card} from "../objects/game-objects/card";
import {Enemy} from "../objects/game-objects/enemy";
import {Player} from "../objects/game-objects/player";
import {Deck} from "../objects/game-objects/deck";
import Image = Phaser.GameObjects.Image;
import TileSprite = Phaser.GameObjects.TileSprite;
import Container = Phaser.GameObjects.Container;
import Sprite = Phaser.GameObjects.Sprite;
import {GameInfo} from "../game";
import { MissionScene } from "./mission-scene";

export class NavigationScene extends Phaser.Scene {


    public backgroundTexture:TileSprite;
    public bulletPoint:Sprite[] = [];
    public overworld:Sprite;
    public worldContainer:Container;

    public player:Player;
    public deck:Deck;

    public created:boolean = false;

    public missionDependency:{[index:number]:number[]} = {
        0:[]
        // commented because not used for now 1:[0]
    };
    public missionKeys:{[index:number]:string} = {
        0:"tutorial"
        // commented because not used for now 1:"mission1"
    };

    constructor() {
        super({
            key: "NavigationScene"
        });
    }

    preload() {
        if (this.created) return;

        this.load.pack("preload", "assets/pack.json", "preload");

        this.load.image("water_background", "assets/navigation_scene/texture/water.png");
        this.load.spritesheet("bullet_point", "assets/navigation_scene/overworld/bulletpoint/bulletpoint-Sheet.png", 
        {frameWidth: 10, frameHeight:5});
        this.load.image("overworld", "assets/navigation_scene/overworld/islands/navigation_scene.png");
        this.load.spritesheet("operators", "assets/font/fontletter/operators/operator-Sheet.png", {frameWidth: 16, frameHeight: 32});
        this.load.spritesheet("runes", "assets/font/fontletter/runes/runes-Sheet.png", {frameWidth: 16, frameHeight: 32});



        let enemies:string = NavigationScene.loadFile("json/enemies.json");
        Enemy.createFromJSON(enemies, this);
        console.log(Enemy.enemies);

        let cards:string = NavigationScene.loadFile("json/cards.json");
        Card.createFromJSON(cards);
        console.log(Card.cards);

        let missions:string = NavigationScene.loadFile("json/mission.json");
        Mission.createFromJSON(missions);
        console.log(Mission.Missions);
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

    public getData(index:number) {
        return [this.missionKeys[index], this.player, this.deck, index];
    }

    public createBulletPoint(x,y):Sprite {
        let b:Sprite = this.add.sprite(x,y,"bullet_point");

        b.setDepth(2);

        return b;
    }

    public setActivePoints():void {
        for (let i = 0; i < this.bulletPoint.length; i++) {
            let b:Sprite = this.bulletPoint[i];
            console.log(b);
            b.play
            if (this.player.missionStates[i]) {
                b.play("blinking");
                
            } else b.play("not_blinking");
        }
    }


    create(data?) {
        if (this.created) {
            //this.setActivePoints();
            return;
        } 

        let scale:number = 4;
        
        if (data.game) {
            let game:Mission = data.game;
            this.player = game.player;
            this.player.listener = [];
            this.deck = game.deck;
            this.deck.listener = [];
        } else {
            this.player = new Player("Willy", 50, 5);
            this.player.missionStates = [true, false, false, false, false];
            this.deck = new Deck();

            for (let c_key in Card.cards) {
                let c:Card = Card.cards[c_key];
    
                for (let i=0; i < c.inDeckAtStart; i++) {
                    this.deck.addCard(c.copy());
                }
            }
    
            this.deck.shuffle();
            console.log(this.deck);
        }

        this.anims.create({
            key: "blinking",
            frames: this.anims.generateFrameNumbers("bullet_point", {start:0}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "not_blinking",
            frames: this.anims.generateFrameNumbers("bullet_point", {start:0, end:0}),
            frameRate: 10,
            repeat: -1
        });

        this.backgroundTexture = this.add.tileSprite(GameInfo.width/2,GameInfo.height/2, GameInfo.width, GameInfo.height, "water_background");
        this.backgroundTexture.setDepth(0);
        this.backgroundTexture.setScale(scale);

        this.worldContainer = this.add.container(GameInfo.width/2,GameInfo.height/2);

        this.overworld = this.add.sprite(0,0, "overworld");
        this.overworld.setDepth(1);
        this.worldContainer.add(this.overworld);

        let b1:Sprite = this.createBulletPoint(-92, 7);
        this.bulletPoint.push(b1);
        this.worldContainer.add(b1);

        let b2:Sprite = this.createBulletPoint(-61, 32);
        this.bulletPoint.push(b2);
        this.worldContainer.add(b2);

        this.worldContainer.setScale(scale);

        for (let i = 0; i < this.bulletPoint.length; i++) {
            let b:Sprite = this.bulletPoint[i];
            b.setInteractive();

            b.on("pointerdown", pointer => {
                for (let j of this.missionDependency[i]) {
                    if (!this.player.missionStates[j])  {
                        return;
                    }
                }
                
                this.scene.run("MissionScene", this.getData(i));
                this.scene.sleep();
            });

            b.play("blinking");
        }

        this.setActivePoints();

        this.created = true;

        //this.scene.start("MissionScene", this.getData("mission1"));
    }
}
