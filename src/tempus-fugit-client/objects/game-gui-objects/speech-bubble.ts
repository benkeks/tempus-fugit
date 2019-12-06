import Scene = Phaser.Scene;

export class SpeechBubble {

    private bubbleText:Phaser.GameObjects.Text;
    private bubbleGraphics:Phaser.GameObjects.Graphics;

    private bubbleWidth;
    private bubbleHeight;
    private bubblePadding:number = 10;

    private scene:Scene;

    constructor(scene, x, y, width, height, quote=undefined) {
        this.scene = scene;

        let t:string = quote as string;

        this.createSpeechBubble(scene, x,y, width,height,t);
        if (!quote) {
            this.hide();
        }
    }

    public isShown() {
        return this.bubbleGraphics.visible;
    }

    public hide():void {
        this.bubbleGraphics.visible = false;
        this.bubbleText.visible = false;
    }

    public show(text:string=undefined):void {
        if (text) {
            this.setText(text);
        }

        this.bubbleGraphics.visible = true;
        this.bubbleText.visible = true;
    }

    public setText(text:string) {
        this.bubbleText.setText(text);
        var b = this.bubbleText.getBounds();

        this.bubbleText.setPosition(this.bubbleGraphics.x + (this.bubbleWidth / 2) - (b.width / 2), this.bubbleGraphics.y + (this.bubbleHeight / 2) - (b.height / 2));
    }

    public setPosition(x,y):void {
        let x_offset = x - this.bubbleGraphics.x;
        let y_offset = y - this.bubbleGraphics.y;

        this.bubbleGraphics.x = x;
        this.bubbleGraphics.y = y;
        this.bubbleText.x += x_offset;
        this.bubbleText.y += y_offset;
    }

    public setWidth() {

    }

    createSpeechBubble (scene, x, y, width, height, quote)
    {
        this.bubbleWidth = width;
        this.bubbleHeight = height;
        let arrowHeight = this.bubbleHeight / 4;

        this.bubbleGraphics = this.scene.add.graphics({ x: x, y: y });

        //  Bubble shadow
        this.bubbleGraphics.fillStyle(0x222222, 0.5);
        this.bubbleGraphics.strokeRoundedRect(6, 6, this.bubbleWidth, this.bubbleHeight, 16);

        //  Bubble color
        this.bubbleGraphics.fillStyle(0xffffff, 1);

        //  Bubble outline line style
        this.bubbleGraphics.lineStyle(4, 0x565656, 1);

        //  Bubble shape and outline
        this.bubbleGraphics.strokeRoundedRect(0, 0, this.bubbleWidth, this.bubbleHeight, 16);
        this.bubbleGraphics.fillRoundedRect(0, 0, this.bubbleWidth, this.bubbleHeight, 16);

        //  Calculate arrow coordinates
        var point1X = Math.floor(this.bubbleWidth / 7);
        var point1Y = this.bubbleHeight;
        var point2X = Math.floor((this.bubbleWidth / 7) * 2);
        var point2Y = this.bubbleHeight;
        var point3X = Math.floor(this.bubbleWidth / 7);
        var point3Y = Math.floor(this.bubbleHeight + arrowHeight);

        //  Bubble arrow shadow
        this.bubbleGraphics.lineStyle(4, 0x222222, 0.5);
        this.bubbleGraphics.lineBetween(point2X - 1, point2Y + 6, point3X + 2, point3Y);

        //  Bubble arrow fill
        this.bubbleGraphics.fillTriangle(point1X, point1Y, point2X, point2Y, point3X, point3Y);
        this.bubbleGraphics.lineStyle(2, 0x565656, 1);
        this.bubbleGraphics.lineBetween(point2X, point2Y, point3X, point3Y);
        this.bubbleGraphics.lineBetween(point1X, point1Y, point3X, point3Y);

        this.bubbleText = this.scene.add.text(0, 0, quote, { fontFamily: 'Arial', fontSize: 20, color: '#000000', align: 'center', wordWrap: { width: this.bubbleWidth - (this.bubblePadding * 2) } });
        this.setText(quote);
        }

}