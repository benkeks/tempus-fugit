import Triangle = Phaser.GameObjects.Triangle;
import Rectangle = Phaser.GameObjects.Rectangle;
import Graphics = Phaser.GameObjects.Graphics;
import GameObject = Phaser.GameObjects.GameObject;
import {EnemyGUI} from "./enemy-gui";
import {GameInfo} from "../../game";
import EPSILON = Phaser.Math.EPSILON;

export class DecisionArrow extends Phaser.GameObjects.Container {

    public triangle:Triangle;
    public shownRectangles:Rectangle[] = [];
    public spawning:Rectangle = undefined;
    public dot:Graphics;

    public color:number = 0xFFFFFF;
    public defaultColor:number = 0xFFFFFF;
    public hoverColor:number = 0xFF0000;

    public rectangleSpeed:number;
    public rectangleWidth:number;
    public rectangleDist:number = 10;

    public draggingObject:GameObject = undefined;

    constructor(scene:Phaser.Scene,
                rectangleWidth:number = 20,
                rectangleSpeed:number = 50) {
        super(scene);
        scene.add.existing(this);
        this.setVisible(false);

        this.rectangleSpeed = rectangleSpeed;
        this.rectangleWidth = rectangleWidth;

        this.triangle = scene.add.triangle(0,400, 0, 0, 2, 0, 1, 3, this.color, 1);
        this.triangle.setScale(15,15);

        this.dot = scene.add.graphics({x:0, y:0});
        this.dot.fillStyle(this.color, 1);
        this.dot.fillCircle(0, 0, 10);

        this.add(this.triangle);
        this.add(this.dot);

        this.scene.input.on(
            "drag",
            function(
                pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.Sprite
            ) {
                if (!this.draggingObject) {
                    this.draggingObject = gameObject;
                    this.setPosition(pointer.x, pointer.y);
                }

                let px = pointer.x - this.x;
                let py = pointer.y - this.y;

                let rotation:number = Math.atan(py / px)-Math.PI/2;
                if (pointer.x < this.x) rotation = rotation-Math.PI;
                this.setRotation(rotation);
                let dist = Math.sqrt(px*px + py*py);
                this.triangle.setPosition(this.triangle.x, dist);
                this.setVisible(true);

                if (GameInfo.hovering && GameInfo.hovering[0] instanceof EnemyGUI) {
                    this.triangle.setFillStyle(this.hoverColor, 1);
                    this.color = this.hoverColor;
                    this.rectangleSpeed = 100;
                } else {
                    this.triangle.setFillStyle(this.color, 1);
                    this.color = this.defaultColor;
                    this.rectangleSpeed = 50;
                }
            }, this);

        this.scene.input.on(
            "dragend",
            function(
                pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.Sprite
            ) {
                this.draggingObject = undefined;
                this.setVisible(false);
                console.log(GameInfo.hovering);
            }, this);

        this.scene.input.on(
            "hover",
            function(
                pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.Sprite
            ) {
                console.log(gameObject);
            }, this);
    }

    update(time, delta): void {
        if (!this.draggingObject) return;
        
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
            //console.log(this.spawning.height + "      " + this.spawning.y);
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
        newRect.setSize(20, height);

        return newRect;
    }

}