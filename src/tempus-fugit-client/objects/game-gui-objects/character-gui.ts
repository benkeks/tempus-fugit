import Text = Phaser.GameObjects.Text;
import Rectangle = Phaser.GameObjects.Rectangle;

export class CharacterGui extends Phaser.GameObjects.Container {

    protected sprite:Phaser.GameObjects.Sprite;
    protected texts:Text[] = [];
    protected rectangles:Rectangle[] = [];
    protected strokeRectWidth = 2;
    protected strokeRect:Rectangle = undefined;

    public yPadding:number = 10;
    public xPadding:number = 20;

    public maxTextWidth:number = 0;
    public heights:number[] = [];

    public defaultColor:number = 0xAAAA;
    public defaultStrokeColor:number = 0xFFFF;

    constructor(
        scene: Phaser.Scene,
        x: number = 1500,
        y: number = 500,
    ) {
        super(scene, x, y);
        this.scene.add.existing(this);

        this.setPosition(x,y);

        this.scene.input.keyboard.addKey("D").on("down", e => {
            this.setPosition(this.x+10, this.y);
        })
    }

    public revalidate() {
        let y:number = this.sprite.displayHeight;

        for (let i in this.texts) {
            let t:Text = this.texts[i];
            let rect:Rectangle = this.rectangles[i];

            t.setOrigin(0.5,0);
            t.setPosition(0, y+this.yPadding);
            rect.setOrigin(0.5,0);
            rect.setPosition(0, y);
            let height:number = t.displayHeight + (2* this.yPadding);
            rect.setDisplaySize(this.maxTextWidth + 2*this.xPadding, height);

            y += height;
        }

        this.setSize(this.maxTextWidth + 2*this.xPadding, y);

        //let strokeWidth:number = this.strokeRect.lineWidth;

        //this.strokeRect.setOrigin(0.5,0);
        //this.strokeRect.setPosition(-strokeWidth, this.sprite.displayHeight - strokeWidth);
        //this.strokeRect.setSize(this.rectWidth+strokeWidth*2, y+strokeWidth)
        //this.strokeRect.setDisplaySize(this.rectWidth+strokeWidth*2, y+strokeWidth);
    }

    public addSpriteByTexture(texture:string) {
        this.sprite = this.scene.add.sprite(0,0,texture, 0);

        this.scene.anims.create({
            key: "standing",
            frames: this.scene.anims.generateFrameNumbers(texture, {start:0}),
            frameRate: 10,
            repeat: -1
        });

        this.sprite.anims.play("standing");

        this.add(this.sprite);
    }

    public addText(text:string, font:Object, height:number=50):Text {
        /*if (!this.strokeRect) {
            this.strokeRect = this.scene.add.rectangle(0,0,100,100, 0,0);
            this.strokeRect.setStrokeStyle(this.strokeRectWidth, this.defaultStrokeColor);
            this.add(this.strokeRect);
        }*/

        let rect:Rectangle = this.scene.add.rectangle(0,0,100,100);
        let t:Text = this.scene.add.text(0,0, text, font);
        this.heights.push(height);

        rect.setStrokeStyle(1, this.defaultStrokeColor, 1);
        rect.setFillStyle(this.defaultColor, 1);

        this.rectangles.push(rect);
        this.texts.push(t);
        this.add(rect);
        this.add(t);

        if (this.maxTextWidth < t.displayWidth) this.maxTextWidth = t.displayWidth;

        this.revalidate();

        return t;
    }

    public setText(index:number, text:string):void {
        let t:Text = this.texts[index];
        t.setText(text);

        if (this.maxTextWidth < t.displayWidth) this.maxTextWidth = t.displayWidth;

        this.revalidate();
    }

    public isHovered(xCursor:number, yCursor:number):boolean {
        let x1:number = this.sprite.x;
        let y1:number = this.sprite.y;
        let x2:number = x1 + this.sprite.displayWidth;
        let y2:number = y1 + this.sprite.displayHeight;

        return xCursor > x1 && xCursor < x2 && yCursor > y1  && yCursor < y2;
    }
}
