import Triangle = Phaser.GameObjects.Triangle;
import Rectangle = Phaser.GameObjects.Rectangle;
import Graphics = Phaser.GameObjects.Graphics;
import {EnemyGUI} from "./enemy-gui";
import {CardGUI} from "./card-gui";
import {MissionScene} from "../../scenes/mission-scene";
import ParticleEmitter = Phaser.GameObjects.Particles.ParticleEmitter;

export class DecisionArrow extends Phaser.GameObjects.Container {

    public triangle:Triangle;
    public shownRectangles:Rectangle[] = [];
    public spawning:Rectangle = undefined;
    public dot:Graphics;
    public dotParticles:ParticleEmitter;

    public color:number = 0xFFFFFF;
    public defaultColor:number = 0xFFFFFF;
    public hoverColor:number = 0xFF0000;

    public rectangleSpeed:number;
    public rectangleWidth:number;
    public rectangleDist:number = 10;

    public missionScene:MissionScene;

    public particleContainer;
    public emitter;
    public dZone:Phaser.Geom.Rectangle;

    constructor(scene:MissionScene,
                rectangleWidth:number = 20,
                rectangleSpeed:number = 50) {
        super(scene);
        scene.add.existing(this);
        this.setVisible(false);
        this.missionScene = scene;

        this.rectangleSpeed = rectangleSpeed;
        this.rectangleWidth = rectangleWidth;

        this.triangle = scene.add.triangle(0,400, 0, 0, 2, 0, 1, 3, this.color, 1);
        this.triangle.setScale(15,15);

        this.dZone = new DeathZone(this.triangle);

        this.add(this.triangle);
    }

    public dragend(pointer:Phaser.Input.Pointer, gameObject:CardGUI) {
        this.setVisible(false);

        this.emitter.killAll();
        this.scene.input.activePointer.smoothFactor = 0;
        this.scene.sys.canvas.style.cursor = "default";
    }

    public updateDrag(pointer:Phaser.Input.Pointer):void {
        this.setVisible(true);

        let px = pointer.x - this.x;
        let py = pointer.y - this.y;

        let rotation:number = Math.atan(py / px)-Math.PI/2;
        if (pointer.x < this.x) rotation = rotation-Math.PI;
        this.setRotation(rotation);
        let dist = Math.sqrt(px*px + py*py);
        this.triangle.setPosition(this.triangle.x, dist);

        //this.emitter.moveToY.propertyValue = dist;
        this.setVisible(true);

        if (this.cursorHoversEnemy(pointer.x, pointer.y)) {
            this.triangle.setFillStyle(this.hoverColor, 1);
            this.color = this.hoverColor;
            this.rectangleSpeed = 100;
        } else {
            this.triangle.setFillStyle(this.color, 1);
            this.color = this.defaultColor;
            this.rectangleSpeed = 50;
        }
    }

    public cursorHoversEnemy(xCursor:number, yCursor:number):EnemyGUI {
        for (let e of this.missionScene.enemyGUI.enemies) {
            if (e.isHovered(xCursor, yCursor)) {
                return e;
            }
        }
        return undefined;
    }

    update(time, delta): void {
        if (!this.visible) return;
        for (let rect of this.shownRectangles) {
            if (this.color != rect.fillColor) {
                rect.setFillStyle(this.color);
            }

            rect.setPosition(rect.x, rect.y+(this.rectangleSpeed* (1/delta)));
        }


        let head: Rectangle;
        let endPoint:number;

        if (this.shownRectangles.length > 0) {
            head = this.shownRectangles[0];
            endPoint = head.y + head.height;
        } else {
            head = undefined;
            endPoint = this.rectangleDist;
        }

        while(endPoint+this.rectangleDist < this.triangle.y) {
            head = this.createRect(endPoint+this.rectangleDist, this.rectangleWidth);

            this.shownRectangles.unshift(head);
            endPoint = head.y + head.height;
        }

        while (head && head.y + head.height > this.triangle.y) {
            this.shownRectangles.shift();

            if (this.spawning == head) {
                this.spawning.setPosition(this.spawning.x, this.rectangleDist+1);
            }

            head.setVisible(false);
            head.destroy(true);

            head = (this.shownRectangles.length > 0) ? this.shownRectangles[0] : undefined;
        }

        if (this.spawning!==undefined &&  this.spawning.y < this.rectangleDist) {
            if (this.spawning.height < this.rectangleWidth) {
                this.spawning.setSize(this.spawning.width, this.spawning.height + this.rectangleSpeed* (1/delta));

                if (this.spawning.height >= this.rectangleWidth) {
                    this.spawning.setSize(this.spawning.width, this.rectangleWidth);
                    this.shownRectangles.push(this.spawning);
                }
            }
        } else {
            this.spawning = this.createRect(0, 0);
        }
    }

    private createRect(y:number, height:number):Rectangle {
        let newRect:Rectangle = this.scene.add.rectangle(0, y, 20, 100, this.color, 1);
        newRect.setOrigin(0.5,0);
        this.add(newRect);
        this.sendToBack(newRect);
        newRect.setSize(20, height);
        newRect.setDepth(0);

        return newRect;
    }

}

class DeathZone extends Phaser.Geom.Rectangle{
    public triangle;
    constructor(triangle) {
        super();
        this.triangle = triangle;
    }

    public contains(x:number, y:number):boolean {
        return y >= this.triangle.y;
    }
}