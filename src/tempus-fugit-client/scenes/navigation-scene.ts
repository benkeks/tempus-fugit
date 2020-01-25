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
import {HelpButton} from "../objects/help-gui-objects/help-button";
import {PauseButton} from "../objects/pause-gui-objects/pause-button";

export class NavigationScene extends Phaser.Scene {


    public backgroundTexture:TileSprite;
    public bulletPoint:Sprite[] = [];
    public overworld:Sprite;
    public worldContainer:Container;

    public player:Player;
    public deck:Deck;

    public alreadyInitted:boolean = false;

    public helpButton: HelpButton;
    public pauseButton: PauseButton;

    public cheats = [
        [["ArrowUp","ArrowUp","ArrowDown","ArrowDown", "ArrowLeft","ArrowRight","ArrowLeft", "ArrowRight", "b", "a"], 0, this.enableAllLevels]
    ];

    public missionDependency:{[index:number]:number[]} = {
        0:[],
        1:[0],
        2:[1],
        3:[2],
        4:[3],
        5:[4],
        6:[5],
        7:[6],
        8:[7]
    };
    
    public missionKeys:{[index:number]:string} = {
        0:"tutorial",
        1:"mission1",
        2:"mission1",
        3:"mission1",
        4:"mission1",
        5:"mission1",
        6:"mission1",
        7:"mission1",
        8:"mission1"
    };

    public enableAllLevels(scene:NavigationScene):void {
        let allTrue = true;
        for (let i in scene.player.missionStates) {
            if (!scene.player.missionStates[i]) {
                allTrue = false;
                break;
            }
        }

        if (!allTrue) {
            scene.player.missionStates = [true, true, true, true, true, true, true, true, true];
            scene.scene.start("NavigationScene");
        }
    }

    constructor() {
        super({
            key: "NavigationScene"
        });
    }

    preload() {
        if (this.alreadyInitted) return;

        this.load.pack("preload", "assets/pack.json", "preload");

        this.load.image("water_background", "assets/navigation_scene/texture/water.png");
        this.load.spritesheet("bullet_point", "assets/navigation_scene/overworld/bulletpoint/bulletpoint-Sheet.png",
        {frameWidth: 10, frameHeight:5});
        this.load.spritesheet("bullet_point_done", "assets/navigation_scene/overworld/bulletpoint/bulletpoint_done-Sheet.png",
        {frameWidth: 10, frameHeight:5});
        this.load.image("bullet_point_inactive", "assets/navigation_scene/overworld/bulletpoint/bp_inactive.png");
        this.load.image("bullet_point_hover", "assets/navigation_scene/overworld/bulletpoint/bp_onHover.png");
        this.load.image("overworld", "assets/navigation_scene/overworld/islands/navigation_scene.png");
        this.load.spritesheet("operators", "assets/font/fontletter/operators/operator-Sheet.png", {frameWidth: 16, frameHeight: 32});
        this.load.spritesheet("runes", "assets/font/fontletter/runes/runes-Sheet.png", {frameWidth: 16, frameHeight: 32});

        this.load.spritesheet("wheel", "assets/sprites/board/Wheel-Sheet.png", {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet("fairy", "assets/sprites/fairy/fairy-spritesheet.png", {frameWidth: 80, frameHeight: 80});

        this.load.image("book", "assets/sprites/board/book.png");
        this.load.image("pause", "assets/sprites/pause-icon.png");

        let enemies:string = NavigationScene.loadFile("json/enemies.json");
        Enemy.createFromJSON(enemies, this);
        //console.log(Enemy.enemies);

        let cards:string = NavigationScene.loadFile("json/cards.json");
        Card.createFromJSON(cards);
        //console.log(Card.cards);

        let missions:string = NavigationScene.loadFile("json/mission.json");
        Mission.createFromJSON(missions);
        //console.log(Mission.Missions);


        this.player = new Player("Willy", 50, 5);
        this.player.missionStates = [false, false, false, false, false, false, false, false, false];

        this.deck = new Deck();

        for (let c_key in Card.cards) {
            let c:Card = Card.cards[c_key];
            for (let i=0; i < c.inDeckAtStart; i++) {
                this.deck.addCard(c.copy());
            }
        }

        //console.log(this.deck);

        this.alreadyInitted = true;
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

    public createBulletPoint(x:number,y:number, i:number):Sprite {
        let b:Sprite;

        let active:boolean = true;
        for (let j of this.missionDependency[i]) {
            if (!this.player.missionStates[j])  {
                active = false;
            }
        }

        if (active) {
            

            if (!this.player.missionStates[i]) {
                b = this.add.sprite(x,y,"bullet_point");
                b.play("blinking");
            } else {
                b = this.add.sprite(x,y,"bullet_point_done");
                b.play("blinking_done");
            }

            b.setInteractive({useHandCursor:true});

            let xOffset = 5;
            let yOffset = 5;
            b.input.hitArea.setTo(-xOffset,-yOffset,b.getBounds().width + 2*xOffset,b.getBounds().height + 2*yOffset);
            
            b.on("pointerdown", pointer => {
                this.scene.start("MissionScene", {
                    key: this.missionKeys[i],
                    index: i,
                    player: this.player.copy(),
                    deck: this.deck.copy()
                });
            });

            b.on("pointerover", pointer => {
                b.anims.stop();
                b.setTexture("bullet_point_hover");
            })

            b.on("pointerout", pointer => {
                b.anims.restart();
            })
        } else {
            b = this.add.sprite(x,y,"bullet_point_inactive");
        }

        b.setDepth(2);

        return b;
    }

    create(data?) {
        let scale:number = 5;

        // TODO: implement cheat code
        this.input.keyboard.on("keydown", e => {
            for (let c of this.cheats) {
                let index: number = c[1] as number;
                let cheatCodes: string[] = c[0] as string[];
                let callback: ((scene:NavigationScene) => void) = c[2] as ((scene:NavigationScene) => void);

                if (cheatCodes[index] == e.key) {
                    index++;
                    c[1] = index;

                    this.time.delayedCall(1000, () => {
                       if (index == c[1]) {
                            c[1] = 0;
                        }
                    }, [], this)
                } else {
                    if (cheatCodes[0] == e.key) {
                        c[1] = 1;
                    } else {
                        c[1] = 0;
                    }
                }

                if (index >= cheatCodes.length) {
                    callback(this);
                    c[1] = 0;
                }
            }
        });

        if (data.mission !== undefined && data.index !== undefined) {
            if (data.mission.isGameOver() && data.mission.gameWon) {
                this.player.missionStates[data.index] = true;
            }
        }

        this.anims.create({
            key: "blinking",
            frames: this.anims.generateFrameNumbers("bullet_point", {start:0}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "blinking_done",
            frames: this.anims.generateFrameNumbers("bullet_point_done", {start:0}),
            frameRate: 10,
            repeat: -1
        });

        this.backgroundTexture = this.add.tileSprite(GameInfo.width/2,GameInfo.height/2, GameInfo.width, GameInfo.height, "water_background");
        this.backgroundTexture.setDepth(0);
        this.backgroundTexture.setScale(scale);

        this.worldContainer = this.add.container(0,0);
        this.worldContainer.setScale(scale);

        this.overworld = this.add.sprite(0,0, "overworld");
        this.overworld.setDepth(1);
        this.overworld.setOrigin(0);
        this.worldContainer.add(this.overworld);

        this.bulletPoint = [];
        let coordinates = [[52,151],
                            [83,176],
                        [125,167],
                        [153,170],
                        [267,138],
                        [309,140],
                        [348, 142],
                        [174, 71],
                        [121, 75]];


        
        for (let i=0; i < coordinates.length; i++) {
            let b = this.createBulletPoint(coordinates[i][0], coordinates[i][1], i);
            b.setOrigin(0.5);
            this.bulletPoint.push(b);
            this.worldContainer.add(b);
        }

        this.helpButton = new HelpButton(this, false);
        this.pauseButton = new PauseButton(this, false);

    }
}
