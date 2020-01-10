import Text = Phaser.GameObjects.Text;
import Rectangle = Phaser.GameObjects.Rectangle;
import Line = Phaser.GameObjects.Line;

export class ListGUI extends Phaser.GameObjects.Container {

    public static readonly ALIGN_LEFT: string = "left";
    public static readonly ALIGN_CENTRE: string = "centre";

    protected sprite: Phaser.GameObjects.Sprite;
    protected texts: Text[] = [];

    protected separatingLines: Line[] = [];
    protected strokeRectWidth = 2;
    protected strokeRect: Rectangle = undefined;

    public yPadding: number = 10;
    public xPadding: number = 20;

    public maxTextWidth: number = 0;
    public fixedMaxTextWidth: boolean = false;

    public defaultColor: number = 0xAAAA;
    public defaultStrokeColor: number = 0xFFFF;

    protected isDestroyed = false;

    constructor(
        scene: Phaser.Scene,
        x: number = 1500,
        y: number = 500,
    ) {
        super(scene, x, y);
        this.scene.add.existing(this);

        this.setPosition(x, y);
    }

    public revalidate() {
        let dHeight: number = 0;
        if (this.sprite) dHeight = this.sprite.displayHeight;
        let y: number = dHeight;
        this.separatingLines[0].setVisible(false);

        for (let i in this.texts) {
            let t: Text = this.texts[i];
            let line: Line = this.separatingLines[i];
            let x: number = 0;
            if (t.style.align == ListGUI.ALIGN_LEFT) x = -this.maxTextWidth;

            if (this.fixedMaxTextWidth) t.style.setWordWrapWidth(this.maxTextWidth, true);

            t.setOrigin(0.5, 0);
            t.setPosition(0, y + this.yPadding);

            line.setOrigin(0, 0);
            let w: number = this.maxTextWidth + 2 * this.xPadding;
            line.setTo(0, 0, w, 0);
            line.setPosition(-w / 2, y);
            let height: number = t.displayHeight + (2 * this.yPadding);
            //rect.setDisplaySize(this.maxTextWidth + 2*this.xPadding, height);

            y += height;
        }

        this.setSize(this.maxTextWidth + 2 * this.xPadding, y);

        if (this.strokeRect) {
            this.remove(this.strokeRect);
            this.strokeRect.destroy(true);
        }
        let strokeWidth: number = this.strokeRectWidth;

        this.strokeRect = this.scene.add.rectangle(0, dHeight - strokeWidth, this.maxTextWidth + strokeWidth + 2 * this.xPadding, y + strokeWidth * 2 - dHeight, this.defaultColor, 1);

        this.strokeRect.setStrokeStyle(this.strokeRectWidth, this.defaultStrokeColor);
        this.strokeRect.setOrigin(0.5, 0);
        this.add(this.strokeRect);
        this.sendToBack(this.strokeRect);


        //this.strokeRect.setSize(this.maxTextWidth+strokeWidth, y+strokeWidth)
        //this.strokeRect.setDisplaySize(this.maxTextWidth+strokeWidth+2*this.xPadding, y+strokeWidth*2-dHeight);
    }

    public addSpriteByTexture(texture: string) {
        this.sprite = this.scene.add.sprite(0, 0, texture, 0);

        this.add(this.sprite);
    }

    public addText(text: string, alignment: string = ListGUI.ALIGN_CENTRE, font: Object = { fontSize: '18px', fontStyle: 'bold', fontFamily: 'Arial', color: '#FF0000' }): Text {
        let line: Line = this.scene.add.line(0, 0, 0, 0, 100, 0, this.defaultStrokeColor, 1);
        let t: Text = this.scene.add.text(0, 0, text, font);
        t.style.align = alignment;

        this.separatingLines.push(line);
        this.texts.push(t);
        this.add(line);
        this.add(t);

        if (this.maxTextWidth < t.displayWidth) this.maxTextWidth = t.displayWidth;

        this.revalidate();

        return t;
    }

    public setText(index: number, text: string): void {
        let t: Text = this.texts[index];
        t.setText(text);

        if (this.maxTextWidth < t.displayWidth) this.maxTextWidth = t.displayWidth;

        this.revalidate();
    }

    public isHovered(xCursor: number, yCursor: number): boolean {
        if (this.isDestroyed) return false;

        let xOffset = -this.displayWidth / 2;

        let x1: number = this.x + xOffset;
        let y1: number = this.y;
        let x2: number = x1 + this.displayWidth;
        let y2: number = y1 + this.displayHeight;

        return xCursor > x1 && xCursor < x2 && yCursor > y1 && yCursor < y2;
    }

    public fadeIn(duration = 200) {
        this.setAlpha(0);
        this.scene.add.tween({ // fade out
            targets: this,
            alpha: { from: 0, to: 1 },
            ease: "Linear",
            duration: duration,
            repeat: 0,
            yoyo: false
        });
        this.setVisible(true);
    }
    public fadeOut(duration = 200) {
        this.setAlpha(1);
        this.scene.add.tween({ // fade out
            targets: this,
            alpha: { from: 1, to: 0 },
            ease: "Linear",
            duration: duration,
            repeat: 0,
            yoyo: false,
            onComplete: function () {
                this.setVisible(false)
            },
            onCompleteScope: this
        });
    }
}
