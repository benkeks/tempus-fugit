import {Enemy, EnemyListener} from "../game-objects/enemy";
import {GameInfo} from "../../game";
import {EnemyGUI} from "./enemy-gui";
import { Mission, MissionListener } from "../../mechanics/mission";
import { StoryDialog } from "../../mechanics/story-dialog";
import { Scene } from "phaser";
import { MissionScene } from "../../scenes/mission-scene";
import { GameState } from "../game-objects/game-state";

export class EnemyGuiLayout extends Phaser.GameObjects.Group {
    public enemies:EnemyGUI[] = [];

    public static enemyLayout:{[count:number]:number[][]};

    public mission:Mission;

    public fadeInOffset = 800;

    public scene:MissionScene;

    constructor(scene:MissionScene, mission:Mission) {
        super(scene);
        this.scene = scene;

        EnemyGuiLayout.enemyLayout = {
            1: [[GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 77), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 60)]],

            2: [[GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 65), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 60)],
                [GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 90), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 60)]],

            3: [[GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 65), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 58)],
                [GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 77), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 58)],
                [GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 90), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 58)]],
        };

        this.mission = mission;
    }

    public fadeIn(gameObject, from, to) {
            this.scene.add.tween({
            targets: gameObject,
            x: to,
            ease: "Linear",
            duration: 500,
            repeat: 0,
            yoyo: false,
            onComplete:function () {
                gameObject.setPosition(to, gameObject.y);
            }
        });
    }

    public setEnemies(enemies:Enemy[], fadeIn:boolean=false, gameState:GameState=undefined) {
        while (this.enemies.length > 0) { // remove old elements
            let enemy:EnemyGUI = this.enemies.pop();
            enemy.disableListeners();
            this.remove(enemy);
        }

        if (enemies.length == 0) return;

        let positions:number[][] = EnemyGuiLayout.enemyLayout[enemies.length];

        if (!positions) {
            throw new Error("There is no layout defined for enemy count of " + enemies.length);
        }

        for (let i in enemies) {
            let x = positions[i][0];
            let y = positions[i][1];

            let enemyGUI:EnemyGUI = new EnemyGUI(this.scene, enemies[i], x, y, enemies[i].image);
            if (fadeIn) enemyGUI.setPosition(x+this.fadeInOffset, y);
            this.mission.gameState.listener.push(enemyGUI);
            enemyGUI.updateTint(this.mission.gameState);

            this.add(enemyGUI);
            this.enemies.push(enemyGUI);

            if (fadeIn) this.fadeIn(enemyGUI, x+this.fadeInOffset, x);
        }
    }
}