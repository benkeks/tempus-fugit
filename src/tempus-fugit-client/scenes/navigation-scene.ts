import { Mission } from "../mechanics/mission";
import { Card } from "../objects/game-objects/card";
import { Enemy } from "../objects/game-objects/enemy";
import { Player } from "../objects/game-objects/player";
import { Deck } from "../objects/game-objects/deck";
import Image = Phaser.GameObjects.Image;
import TileSprite = Phaser.GameObjects.TileSprite;
import Container = Phaser.GameObjects.Container;
import Sprite = Phaser.GameObjects.Sprite;
import { GameInfo } from "../game";
import { NewCardsViewer } from "../objects/navigation-scene-objects/new-cards-viewer";
import { HelpButton } from "../objects/help-gui-objects/help-button";
import { PauseButton } from "../objects/pause-gui-objects/pause-button";
import { MissionNameGui } from "../objects/navigation-scene-objects/mission-name-gui";
import { DeathScene } from "./death-scene";
import { PauseWindow } from "../objects/pause-gui-objects/pause-window";
import { NewCardsScene } from "./new-cards-scene";
import { TutorialWindow } from "../objects/tutorial-objects/tutorial-window";
import { TutorialButton } from "../objects/tutorial-objects/tutorial-button";
import { MusicScene } from "./music-scene";
import { SoundButton } from "../objects/sound-button";
import { Sound } from "phaser";
import { DeckBuilder } from "../objects/navigation-scene-objects/deck-builder";
import { DescritptionDialog } from "../objects/navigation-scene-objects/description-dialog";
import { DeckBuilderButton } from "../objects/navigation-scene-objects/deck-builder-button";
import { HelpWindow } from "../objects/help-gui-objects/help-window";
import { ProgressStore } from "../progress/progress-store";
import { op_and,
    op_or,
    op_not,
    op_impl,
    op_biImpl,
    op_evPast,
    op_evFuture,
    op_glPast,
    op_glFuture,
    op_nextPast,
    op_nextFuture,
    op_until,
    op_klammer } from "../objects/help-gui-objects/help-data";

export class NavigationScene extends Phaser.Scene {

    public backgroundTexture: TileSprite;
    public bulletPoint: Sprite[] = [];
    public overworld: Sprite;
    public worldContainer: Container;
    public levelText: MissionNameGui;

    public cloudContainer: Container[] = [];
    public levelCoordinates:number[][] = [];
    public mage: Sprite;
    public currentMageLevelIndex:number = 0;
    public missionTransitionInProgress:boolean = false;

    public player: Player;
    public deck: Deck;

    public alreadyInitted: boolean = false;

    public helpButton: HelpButton;
    public pauseButton: PauseButton;
    public tutorialButton: TutorialButton;
    public soundButton: SoundButton;
    public deckBuilderButton: DeckBuilderButton;

    public activeDialog;

    public static instance:NavigationScene;
    public useCustomDeck:boolean = false;

    public cheats = [
        [["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"], 0, this.enableAllLevels, this]
    ];

    public cloudDependency: { [index: number]: number[] } = {
        0: [4, 5, 6],
        1: [7, 8]
    }

    public missionDependency: { [index: number]: number[] } = {
        0: [],
        1: [0],
        2: [1],
        3: [2],
        4: [3],
        5: [4],
        6: [5],
        7: [6],
        8: [7]
    };

    public missionKeys: string[] = [
        "tutorial",
        "mission1",
        "mission2",
        "mission3",
        "mission4",
        "mission5",
        "mission6",
        "mission7",
        "mission8"
    ];

    public enableAllLevels(scene: NavigationScene): void {
        let allTrue = true;
        for (let i in scene.player.missionStates) {
            if (!scene.player.missionStates[i]) {
                allTrue = false;
                break;
            }
        }

        if (!allTrue) {
            scene.player.missionStates = [true, true, true, true, true, true, true, true, true];

            let cards = Object.keys(Card.cards).map(function(key){
                return Card.cards[key];
            });
            scene.player.currentHP = 125 + 25*Object.keys(scene.missionKeys).length;
            scene.player.maxHP = scene.player.currentHP;
            scene.player.baseAttack = 2+Object.keys(scene.missionKeys).length;
            cards.forEach(c => DeckBuilderButton.newCards.add(c.name));
            scene.player.addCardType(cards);
            scene.persistProgress();
            HelpWindow.help_data = [op_and,
                op_or,
                op_not,
                op_impl,
                op_biImpl,
                op_evPast,
                op_evFuture,
                op_glPast,
                op_glFuture,
                op_nextPast,
                op_nextFuture,
                op_until,
                op_klammer]
            scene.scene.start("NavigationScene", {tutorial:false});
            HelpButton.newInfo = true;
        }
    }

    constructor() {
        super({
            key: "NavigationScene"
        });
        NavigationScene.instance = this;
    }

    preload() {
        if (this.alreadyInitted) return;

        this.load.pack("preload", "assets/pack.json", "preload");

        this.load.image("water_background", "assets/navigation_scene/texture/water.png");
        this.load.spritesheet("bullet_point", "assets/navigation_scene/overworld/bulletpoint/bulletpoint-Sheet.png",
            { frameWidth: 10, frameHeight: 5 });
        this.load.spritesheet("bullet_point_done", "assets/navigation_scene/overworld/bulletpoint/bulletpoint_done-Sheet.png",
            { frameWidth: 10, frameHeight: 5 });
        this.load.image("bullet_point_inactive", "assets/navigation_scene/overworld/bulletpoint/bp_inactive.png");
        this.load.image("bullet_point_hover", "assets/navigation_scene/overworld/bulletpoint/bp_onHover.png");
        this.load.image("bullet_point_hover_done", "assets/navigation_scene/overworld/bulletpoint/bp_done_onHover.png");
        this.load.image("bullet_arrow", "assets/navigation_scene/overworld/bulletpoint/arrow.png");
        this.load.image("overworld", "assets/navigation_scene/overworld/islands/navigation_scene.png");
        this.load.spritesheet("clouds", "assets/navigation_scene/overworld/islands/clouds-Sheet.png", { frameWidth: 64, frameHeight: 32 });
        this.load.spritesheet("operators", "assets/font/fontletter/operators/operator-Sheet.png", { frameWidth: 16, frameHeight: 32 });
        this.load.spritesheet("runes", "assets/font/fontletter/runes/runes-Sheet.png", { frameWidth: 18, frameHeight: 34 });

        this.load.spritesheet("wheel", "assets/sprites/board/Wheel-Sheet.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("fairy", "assets/sprites/fairy/fairy-spritesheet.png", { frameWidth: 80, frameHeight: 80 });

        this.load.image("book", "assets/sprites/board/book.png");
        this.load.image("questionMark", "assets/sprites/questionmark.png");
        this.load.image("pause", "assets/sprites/pause-icon.png");
        this.load.image("notification", "assets/sprites/notification.png");

        let enemies: string = NavigationScene.loadFile("json/enemies.json");
        Enemy.createFromJSON(enemies, this);
        //console.log(Enemy.enemies);

        let cards: string = NavigationScene.loadFile("json/cards.json");
        Card.createFromJSON(cards);
        //console.log(Card.cards);

        let missions: string = NavigationScene.loadFile("json/mission.json");
        Mission.createFromJSON(missions);
        //console.log(Mission.Missions);

        this.initGame();

        //console.log(Deck.Decks);

        this.alreadyInitted = true;
    }

    public static loadFile(filePath): string {
        let fd = null;
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", filePath, false);
        xmlhttp.send();
        if (xmlhttp.status == 200) {
            fd = xmlhttp.responseText;
        }
        return fd;
    }

    public createBulletPoint(x: number, y: number, i: number): Sprite {
        let b: Sprite;
        let done: boolean = true;
        let active: boolean = true;
        for (let j of this.missionDependency[i]) {
            if (!this.player.missionStates[j]) {
                active = false;
            }
        }

        if (active) {
            if (!this.player.missionStates[i]) {
                b = this.add.sprite(x, y, "bullet_point");
                b.play("blinking");
                done = false;
            } else {
                b = this.add.sprite(x, y, "bullet_point_done");
                b.play("blinking_done");
                done = true;
            }

            b.setInteractive({ useHandCursor: true });

            b.on("pointerdown", pointer => {
                this.startMission(i, (this.useCustomDeck) ? "custom" : this.missionKeys[i]);
            });

            b.on("pointerover", pointer => {
                if(!done){
                    b.anims.stop();
                    this.levelText.fadeInText(Mission.Missions[this.missionKeys[i]].name);
                    b.setTexture("bullet_point_hover");
                } else {
                    b.anims.stop();
                    this.levelText.fadeInText(Mission.Missions[this.missionKeys[i]].name);
                    b.setTexture("bullet_point_hover_done");
                }

            
            })

            b.on("pointerout", pointer => {
                b.anims.restart();
                this.levelText.fadeOut();
            })
        } else {
            b = this.add.sprite(x, y, "bullet_point_inactive");
        }

        b.setDepth(2);

        return b;
    }

    public getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    public startMission(index:number, deckName:string) {
        if (this.missionTransitionInProgress) return;

        let startScene = () => {
            this.currentMageLevelIndex = index;
            ProgressStore.save(this.player, Deck.Decks["custom"], DeckBuilderButton.newCards, this.missionKeys.length,
                { lastPlayedLevelIndex: index });

            this.scene.start("MissionScene", {
                key: this.missionKeys[index],
                index: index,
                player: this.player.copy(),
                deck: Deck.Decks[deckName].copy(),
                showCredits:this.missionKeys.length-1==index
            });
        }

        if (!this.mage || this.currentMageLevelIndex === index) {
            this.currentMageLevelIndex = index;
            startScene();
            return;
        }

        this.missionTransitionInProgress = true;
        this.animateMageToLevel(index, () => {
            this.missionTransitionInProgress = false;
            startScene();
        });
    }

    public getInitialMageLevelIndex(): number {
        let lastPlayedLevelIndex = ProgressStore.getLastPlayedLevelIndex(this.missionKeys.length);
        if (lastPlayedLevelIndex === undefined || lastPlayedLevelIndex < 0) return -1;

        return Math.min(lastPlayedLevelIndex, this.missionKeys.length - 1);
    }

    public getMagePositionForLevel(levelIndex:number): {x:number, y:number} {
        if (levelIndex < 0) {
            return {
                x: 35,
                y: 145
            };
        }

        return {
            x: this.levelCoordinates[levelIndex][0],
            y: this.levelCoordinates[levelIndex][1] - 10
        };
    }

    public animateMageToLevel(targetIndex:number, onComplete:() => void): void {
        if (!this.mage || this.currentMageLevelIndex === targetIndex) {
            onComplete();
            return;
        }

        let step = targetIndex > this.currentMageLevelIndex ? 1 : -1;
        let path:number[] = [];

        for (let i = this.currentMageLevelIndex + step; ; i += step) {
            path.push(i);
            if (i === targetIndex) break;
        }

        let move = (pathIndex:number) => {
            if (pathIndex >= path.length) {
                onComplete();
                return;
            }

            let pos = this.getMagePositionForLevel(path[pathIndex]);
            this.tweens.add({
                targets: this.mage,
                x: pos.x,
                y: pos.y,
                ease: "Sine.Out",
                duration: 220,
                onComplete: () => move(pathIndex + 1)
            });
        }

        move(0);
    }

    public createDialog(index:number) {
        let actions = [["default", function () {
            this.activeDialog.returnToScene = false;
            this.activeDialog.hide();
            this.startMission(index, this.missionKeys[index]);
        }, this], ["custom", function() {
            this.activeDialog.returnToScene = false;
            this.activeDialog.hide();
            this.startMission(index, "custom");
        }, this]];
        this.scene.run("DialogScene", {scene:this, parent:"NavigationScene", description:"You can customise the custom deck in the Deck builder on the top right corner on the map. The default deck is predefined for each level.",
        buttons:actions, title:"Choose Your Deck"});
    }

    public createCloudContainer(x: number, y: number, width: number, height: number, index: number): Container {
        let c = this.add.container(x, y);

        let rect = new Phaser.Geom.Rectangle(x, y, width, height);

        for (let i = 0; i < 50; i++) {
            let p = rect.getRandomPoint();
            let cloud = this.add.sprite(p.x, p.y, "clouds", this.getRandomInt(5));
            cloud.setOrigin(0.5);
            c.add(cloud);

            let baseX = cloud.x;
            let baseY = cloud.y;
            let driftX = this.getRandomInt(11) - 5;
            let driftY = this.getRandomInt(5) - 2;

            this.tweens.add({
                targets: cloud,
                x: { from: baseX - driftX, to: baseX + driftX },
                y: { from: baseY - driftY, to: baseY + driftY },
                ease: "Sine.InOut",
                duration: 6000 + this.getRandomInt(5000),
                repeat: -1,
                yoyo: true
            });
        }

        let fadeOut = false;
        let contNeeded = true;
        for (let i of this.cloudDependency[index]) {
            if (this.player.missionStates[i]) {
                contNeeded = false;
                break;
            }
            let active: boolean = true;
            for (let j of this.missionDependency[i]) {
                if (!this.player.missionStates[j]) {
                    active = false;
                }
            }

            if (active && !this.player.missionStates[i]) fadeOut = true;
        }

        if (contNeeded) {
            if (fadeOut) {
                this.add.tween({ // fade out
                    targets: c,
                    alpha: { from: 1, to: 0 },
                    ease: "Linear",
                    duration: 500,
                    repeat: 0,
                    yoyo: false,
                    onComplete: function () {
                        c.setVisible(false)
                    },
                    callbackScope: this
                });
            }
        } else {
            c.setVisible(false);
        }

        return c;
    }

    create(data?) {
        let scale: number = GameInfo.scale;
        MusicScene.instance.play("navigationscene");

        // TODO: implement cheat code
        this.input.keyboard.on("keydown", e => {
            for (let c of this.cheats) {
                let index: number = c[1] as number;
                let cheatCodes: string[] = c[0] as string[];
                let callback: ((scene: NavigationScene) => void) = c[2] as ((scene: NavigationScene) => void);

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

        // create new cards viewer
        let gamewon = false;
        let progressUpdated = false;
        if (data.mission !== undefined && data.index !== undefined) {
            if (data.mission.isGameWon() && !this.player.missionStates[data.index]) {
                this.player.missionStates[data.index] = true;
                this.player.maxHP += 25;
                this.player.baseAttack += 1;
                this.player.currentHP = this.player.maxHP;
                gamewon = true;
                progressUpdated = true;
            }
        }

        if (DeathScene.deathQuit || PauseWindow.pauseQuit) {
            DeathScene.deathQuit = false;
            PauseWindow.pauseQuit = false;
        }

        this.anims.create({
            key: "blinking",
            frames: this.anims.generateFrameNumbers("bullet_point", { start: 0 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "blinking_done",
            frames: this.anims.generateFrameNumbers("bullet_point_done", { start: 0 }),
            frameRate: 10,
            repeat: -1
        });

        this.backgroundTexture = this.add.tileSprite(GameInfo.width / 2, GameInfo.height / 2, GameInfo.width, GameInfo.height, "water_background");
        this.backgroundTexture.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        this.backgroundTexture.setDepth(0);
        //this.backgroundTexture.setScale(scale * .125);

        this.worldContainer = this.add.container(0, 0);
        this.worldContainer.setScale(scale);

        this.overworld = this.add.sprite(0, 0, "overworld");
        this.overworld.setDepth(1);
        this.overworld.setOrigin(0);
        this.worldContainer.add(this.overworld);

        this.bulletPoint = [];
        this.levelCoordinates = [[52, 151],
        [83, 176],
        [125, 167],
        [153, 170],
        [267, 138],
        [309, 140],
        [347, 142],
        [174, 71],
        [121, 75]];

        for (let i = 0; i < this.levelCoordinates.length; i++) {
            let b = this.createBulletPoint(this.levelCoordinates[i][0], this.levelCoordinates[i][1], i);
            b.setOrigin(0.5);
            this.bulletPoint.push(b);
            this.worldContainer.add(b);

            if (b.texture.key == "bullet_point") {
                let offset = 7;
                let arrowBaseY = this.levelCoordinates[i][1] - offset;
                let arr = this.add.sprite(this.levelCoordinates[i][0], arrowBaseY, "bullet_arrow");
                arr.setScale(0.2);
                arr.setOrigin(0, 0.5);
                arr.setRotation(-Math.PI / 2)

                this.tweens.add({
                    targets: arr,
                    y: { from: arrowBaseY - 2, to: arrowBaseY + 2 },
                    ease: "Sine.InOut",
                    duration: 800,
                    repeat: -1,
                    yoyo: true
                });

                this.worldContainer.add(arr);
            }
        }

        this.currentMageLevelIndex = this.getInitialMageLevelIndex();
        let initialMagePosition = this.getMagePositionForLevel(this.currentMageLevelIndex);

        this.mage = this.add.sprite(
            initialMagePosition.x,
            initialMagePosition.y,
            "player",
            0
        );
        this.mage.setScale(0.3);
        this.mage.setDepth(4);
        this.worldContainer.add(this.mage);

        // clouds
        let cloudCoordinates = [[200, 80, 330, 150],
        [80, 15, 180, 100]];
        this.cloudContainer = [];

        for (let i = 0; i < cloudCoordinates.length; i++) {
            let x = cloudCoordinates[i][0];
            let y = cloudCoordinates[i][1];

            let cc = this.createCloudContainer(x, y, cloudCoordinates[i][2] - x, cloudCoordinates[i][3] - y, i);
            this.cloudContainer.push(cc);
            cc.setScale(scale);
        }


        this.levelText = new MissionNameGui(this, GameInfo.width / 2, GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 5));

        this.helpButton = new HelpButton(this, false);
        this.pauseButton = new PauseButton(this, false);
        this.deckBuilderButton = new DeckBuilderButton(this, 1780, 50, this.player);
        this.soundButton = new SoundButton(this, 1690, 50);
        this.tutorialButton = new TutorialButton(this, 1600, 50);

        if (data.mission && gamewon && data.mission.loot.length > 0) {
            let loot = data.mission.loot;
            let final = false;
            if (this.player.missionStates[this.player.missionStates.length-1]) final = true;
            loot.forEach(e => {
                DeckBuilderButton.newCards.add(e.name);
            });

            this.player.addCardType(loot);
            this.scene.run("NewCardScene", { loot: loot, final:final});

            this.deckBuilderButton.createNotification();
            progressUpdated = true;
        }

        if (progressUpdated) this.persistProgress();

        if (data.tutorial) {
            let tutorialFlags = ProgressStore.getTutorialFlags(this.missionKeys.length);
            if (!tutorialFlags.tutorialShown) {
                let s = this.scene;
                s.run('TutorialScene', {backScene:s.key, guided:false});
                ProgressStore.save(this.player, Deck.Decks["custom"], DeckBuilderButton.newCards, this.missionKeys.length,
                    { tutorialShown: true });
            }
        }
        
        //this.scene.run('DeckBuilderScene', {parent:this.scene.key, player:this.player});
    }

    public initGame() {

        this.player = new Player("Willy", 125, 2);
        this.player.missionStates = [false, false, false, false, false, false, false, false, false];
        let d = new Deck();
        
        d.deck = {...Deck.Decks[this.missionKeys[0]].deck};
        Deck.Decks["custom"] = d;
        this.player.addCardType(Deck.Decks["custom"].deck);

        DeckBuilderButton.newCards = ProgressStore.applyToPlayerAndDeck(this.player, Deck.Decks["custom"], this.missionKeys.length);

        HelpWindow.restoreFromMissionStates(this.player.missionStates);

        if (Object.keys(this.player.cardTypes).length === 0) {
            this.player.addCardType(Deck.Decks["custom"].deck);
        }

        if (Object.keys(Deck.Decks["custom"].deck).length === 0) {
            Deck.Decks["custom"].deck = {...Deck.Decks[this.missionKeys[0]].deck};
        }

        this.deck = new Deck();
    }

    public persistProgress(): void {
        ProgressStore.save(this.player, Deck.Decks["custom"], DeckBuilderButton.newCards, this.missionKeys.length);
    }
}
