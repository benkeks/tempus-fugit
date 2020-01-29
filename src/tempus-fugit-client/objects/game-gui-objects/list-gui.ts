import Text = Phaser.GameObjects.Text;
import Rectangle = Phaser.GameObjects.Rectangle;
import Line = Phaser.GameObjects.Line;
import { GameObjects, Tweens } from "phaser";

export class ListGUI extends Phaser.GameObjects.Container {

    public static readonly ALIGN_LEFT: string = "left";
    public static readonly ALIGN_CENTRE: string = "centre";

    protected sprite: Phaser.GameObjects.Sprite;
    protected texts: Text[] = [];

    protected elements = [];

    protected separatingLines: Line[] = [];
    protected strokeRectWidth = 2;
    protected backgroundGraphics: Phaser.GameObjects.Graphics = undefined;

    public yPadding: number = 10;
    public xPadding: number = 20;

    public maxY: number;

    public maxTextWidth: number = 0;
    public fixedMaxTextWidth: boolean = false;

    public defaultColor: number = 0x404040;
    public defaultStrokeColor: number = 0xFFFFFF;

    protected isDestroyed = false;

    public tween: Tweens.Tween;

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
        if (this.sprite) dHeight = this.sprite.displayHeight / 2 + 2 * this.yPadding;
        let y: number = dHeight
        this.separatingLines[0].setVisible(false);

        for (let i in this.elements) {
            let line: Line = this.separatingLines[i];
            let x: number = 0;
            let element = this.elements[i];

            if (element instanceof Text) {
                let t: Text = element as Text;
                if (t.style.align == ListGUI.ALIGN_LEFT) x = -this.maxTextWidth;

                if (this.fixedMaxTextWidth) t.style.setWordWrapWidth(this.maxTextWidth, true);
            }

            element.setPosition(-element.getBounds().width / 2, y + this.yPadding);

            line.setOrigin(0, 0);
            let w: number = this.maxTextWidth + 2 * this.xPadding;
            line.setTo(0, 0, w, 0);
            line.setPosition(-w / 2, y);

            let height: number = element.getBounds().height + (2 * this.yPadding);
            //rect.setDisplaySize(this.maxTextWidth + 2*this.xPadding, height);

            y += height;
        }

        this.setSize(this.maxTextWidth + 2 * this.xPadding, y);

        if (this.backgroundGraphics) {
            this.remove(this.backgroundGraphics);
            this.backgroundGraphics.destroy(true);
        }
        let strokeWidth: number = this.strokeRectWidth;

        this.backgroundGraphics = this.scene.add.graphics({
            x: -(this.maxTextWidth + strokeWidth + 2 * this.xPadding) / 2,
            y: dHeight - strokeWidth,
            fillStyle: { color: this.defaultColor },
            lineStyle: { width: this.strokeRectWidth, color: this.defaultStrokeColor }
        });

        //this.maxTextWidth + strokeWidth + 2 * this.xPadding, y + strokeWidth * 2 - dHeight
        this.backgroundGraphics.fillRoundedRect(0, 0, this.maxTextWidth + strokeWidth + 2 * this.xPadding, y + strokeWidth * 2 - dHeight);
        this.backgroundGraphics.strokeRoundedRect(0, 0, this.maxTextWidth + strokeWidth + 2 * this.xPadding, y + strokeWidth * 2 - dHeight);

        this.add(this.backgroundGraphics);
        this.sendToBack(this.backgroundGraphics);

        this.maxY = y;
    }

    public addSpriteByTexture(texture: string) {
        this.sprite = this.scene.add.sprite(0, 0, texture, 0);

        this.add(this.sprite);
    }

    public addText(text: string, alignment: string = ListGUI.ALIGN_CENTRE, font: Object = { fontSize: '18px', fontStyle: 'bold', fontFamily: 'pressStart', color: '#FF0000' }, lineVisible: boolean = true): Text {
        let line: Line = this.scene.add.line(0, 0, 0, 0, 100, 0, this.defaultStrokeColor, 1);
        let t: Text = this.scene.add.text(0, 0, text, font);
        t.style.align = alignment;

        this.separatingLines.push(line);
        this.elements.push(t);
        this.add(line);
        this.add(t);

        if (this.maxTextWidth < t.displayWidth) this.maxTextWidth = t.displayWidth;

        this.revalidate();

        if (!lineVisible) line.setVisible(false);

        return t;
    }
    public addContainter(cont: Phaser.GameObjects.Container, alignment: string = ListGUI.ALIGN_CENTRE): Phaser.GameObjects.Container {
        let line: Line = this.scene.add.line(0, 0, 0, 0, 100, 0, this.defaultStrokeColor, 1);

        this.separatingLines.push(line);
        this.elements.push(cont);
        this.add(line);
        this.add(cont);

        let w = cont.getBounds().width;
        if (this.maxTextWidth < w) this.maxTextWidth = w;

        this.revalidate();

        return cont;
    }

    public setText(index: number, text: string): void {
        let t: Text = this.elements[index] as Text;
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
        if (this.tween) this.tween.stop(0);

        this.setAlpha(0);
        this.tween = this.scene.add.tween({ // fade out
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
        if (this.tween) this.tween.stop(1);

        this.setAlpha(1);
        this.tween = this.scene.add.tween({ // fade out
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
