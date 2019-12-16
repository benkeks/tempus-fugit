import {Enemy} from "../game-objects/enemy";
import {GameInfo} from "../../game";
import {EnemyGUI} from "./enemy-gui";

export class EnemyGuiLayout extends Phaser.GameObjects.Group {

    public enemies:EnemyGUI[] = [];

    public static enemyLayout:{[count:number]:number[][]};

    constructor(scene:Phaser.Scene, enemies:Enemy[] = []) {
        super(scene);

        EnemyGuiLayout.enemyLayout = {
            1: [[GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 70), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 45)]],

            2: [[GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 60), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 45)],
                [GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 80), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 45)]],

            3: [[GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 60), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 35)],
                [GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 60), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 55)],
                [GameInfo.convertRelativeCoordinates(GameInfo.X_AXIS, 80), GameInfo.convertRelativeCoordinates(GameInfo.Y_AXIS, 45)]],
        };

        this.setEnemies(enemies);
    }

    public setEnemies(enemies:Enemy[]) {
        while (this.enemies.length > 0) { // remove old elements
            let enemy:EnemyGUI = this.enemies.pop();
            console.log(enemy);
            enemy.disableListeners();
            this.remove(enemy, true, true);
        }

        if (enemies.length == 0) return;

        let positions:number[][] = EnemyGuiLayout.enemyLayout[enemies.length];

        if (!positions) {
            throw new Error("There is no layout defined for enemy count of " + enemies.length);
        }

        for (let i in enemies) {
            let enemyGUI:EnemyGUI = new EnemyGUI(this.scene, enemies[i], positions[i][0], positions[i][1]);

            this.add(enemyGUI);
            this.enemies.push(enemyGUI);
        }
    }

}