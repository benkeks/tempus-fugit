import {Enemy, EnemyListener} from "../game-objects/enemy";
import {GameInfo} from "../../game";
import {EnemyGUI} from "./enemy-gui";
import { Mission, MissionListener } from "../../mechanics/mission";
import { StoryDialog } from "../../mechanics/story-dialog";
import { Scene } from "phaser";

export class EnemyGuiLayout extends Phaser.GameObjects.Group {
    public enemies:EnemyGUI[] = [];

    public static enemyLayout:{[count:number]:number[][]};

    public mission:Mission;

    public fadeInOffset = 500;

    public scene:Scene;

    constructor(scene:Phaser.Scene, mission:Mission) {
        super(scene);
        this.scene = scene;

        EnemyGuiLayout.enemyLayout = {
            1: [[GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 77), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 50)]],

            2: [[GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 65), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 50)],
                [GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 90), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 50)]],

            3: [[GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 65), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 50)],
                [GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 77), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 50)],
                [GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 90), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 50)]],
        };

        this.mission = mission;
    }

    public fadeIn(gameObject, from, to) {
            this.scene.add.tween({
            targets: gameObject,
            x: {from:from, to:to},
            ease: "Linear",
            duration: 500,
            repeat: 0,
            yoyo: false,
            onComplete: function () {
            },
            onCompleteScope: this
        });
    }

    public setEnemies(enemies:Enemy[], fadeIn:boolean=false) {
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

            this.add(enemyGUI);
            this.enemies.push(enemyGUI);

            if (fadeIn) this.fadeIn(enemyGUI, x+this.fadeInOffset, x);
        }
    }
}