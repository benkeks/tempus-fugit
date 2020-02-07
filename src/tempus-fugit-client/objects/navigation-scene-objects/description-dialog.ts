import { Scene } from 'phaser';
import { GameInfo } from '../../game';

const BUTTON_BACKGROUND_COLOR = 0x666666;
const BUTTON_BACKGROUND_LINE = 0x000;
const BUTTON_BACKGROUND_LINE_HOVER = 0xFFFFFF;
const RECT_LINE_WIDTH = 3;

const BACKGROUND_COLOR_FILL = 0x607d8b
const BACKGROUND_COLOR_LINE = 0x000

const GUI_TEXT_AREA_BORDER = 0x000000;
const GUI_TEXT_AREA = 0xf2f1e7;

const RED = 0xdd6666;

export class DescritptionDialog {

    public scene:Scene;

    public textArea;

    public dialog;

    public returnToScene:boolean = true;

    public textWidth:number=500;
    public margin:number = 15;

    constructor(scene:Scene, description:string, buttons?, title:string="Tutorial") {
        this.scene = scene;
        let actions = [];
        this.returnToScene = true;

        //@ts-ignore
        let background = this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, BACKGROUND_COLOR_FILL)
        .setStrokeStyle(RECT_LINE_WIDTH, BACKGROUND_COLOR_LINE)

        //@ts-ignore
        let sizer = scene.rexUI.add.sizer({
            orientation:"v",
            space: {
                top:this.margin,
                bottom:this.margin
            }
        })
        //@ts-ignore
        sizer.addBackground(this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, 0xFFFFFF)
        .setStrokeStyle(RECT_LINE_WIDTH, BACKGROUND_COLOR_LINE));
        
        let text = scene.add.text(0,0,description, { fontSize: '16px', fontStyle: 'bold', fontFamily: 'pressStart', color: '#000000' }).setWordWrapWidth(this.textWidth,true)
        sizer.add(text, 0, "center", {
            top:5, 
            bottom:5,
            left:5,
            right:5
        });
        sizer.layout();

        //@ts-ignore
        let outerSizer = scene.rexUI.add.sizer({
            orientation:"v",
        })
        outerSizer.add(sizer, 0, "center", {
            top:this.margin,
            bottom:this.margin
        });
        outerSizer.layout();

        let tooltips = [];
        tooltips.push(this.createButton("X", function(pointer) {
            this.hide();
        }, this, {backgroundColor:RED,
        left:5,
        right:5,
        top:5,
        bottom:5}))

        //@ts-ignore
        let header = this.scene.rexUI.add.dialog({
            //@ts-ignore
            background:this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, GUI_TEXT_AREA)
            .setStrokeStyle(RECT_LINE_WIDTH, GUI_TEXT_AREA_BORDER),
            title:this.scene.add.text(0,0,title, { fontSize: '16px', fontStyle: 'bold', fontFamily: 'pressStart', color: '#000000' }),
            space: {
                top:10,
                bottom:10
            },
            expand:{title:false}
        });
        header.layout();
        
        if (buttons) {
            buttons.forEach(e => {
                actions.push(this.createButton(e[0], e[1], e[2]));
            });
        } else {
            actions.push(this.createButton("OK", function(pointer) {this.hide()}, this));
        }

        //@ts-ignore
        this.dialog = scene.rexUI.add.dialog({
            x:GameInfo.width/2,
            y:GameInfo.height/2,
            background:background,

            title:header,
            content:outerSizer,
            leftToolbar:[],
            toolbar:tooltips,
            actions:actions,
            space: {
                left:this.margin,
                right:this.margin,
                bottom:this.margin,
                top:this.margin,
                titleLeft: 105,
                titleRight: 70,
                choice: 5,
                action:10
            }
        }).layout();

        this.dialog.setDepth(1000);
        this.show();
    }

    public show(delay:number=500) {
        this.dialog.popUp(delay);
    }

    public hide(delay:number=500) {
        this.dialog.scaleDownDestroy(delay);
    }

    public createButton(text, callback, callbackScope, config?) {
        let marginX = 25;
        let marginY = 5;

        let backgroundColor = BUTTON_BACKGROUND_COLOR;
        let left = marginX
        let right = marginX
        let top = marginY
        let bottom = marginY
        if (config) {
            if (config.backgroundColor) backgroundColor = config.backgroundColor;
            if (config.left) left = config.left;
            if (config.right) right = config.right;
            if (config.top) top = config.top;
            if (config.bottom) bottom = config.bottom;
        }

        //@ts-ignore
        let background = this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, backgroundColor)
        .setStrokeStyle(RECT_LINE_WIDTH, BUTTON_BACKGROUND_LINE)

        if (typeof text === 'string' || text instanceof String) {
            text = this.scene.add.text(0,0, text as string, { fontSize: '16px', fontStyle: 'bold', fontFamily: 'pressStart', color: '#000000' });
        }
        //@ts-ignore
        let button = this.scene.rexUI.add.dialog( {
            orientation:"h",
            background:background,
            content: text,
            space:{left:left,
                    right:right,
                    top:top,
                    bottom:bottom},
        });
        button.layout();

        button.setInteractive({useHandCursor:true}).on("pointerdown", callback, callbackScope).on("pointerover",
        function(pointer) {
            background.setStrokeStyle(RECT_LINE_WIDTH, BUTTON_BACKGROUND_LINE_HOVER);
        }).on("pointerout",
        function(pointer) {
            background.setStrokeStyle(RECT_LINE_WIDTH, BUTTON_BACKGROUND_LINE);
        })

        return button;
    }

    public addButton(text:string, callback, callbackScope) {
        //@ts-ignore
        let button = this.createButton(text, callback, callbackScope);

        if (this.dialog.childrenMap.actions) {
            this.dialog.childrenMap.actions.push(button);
        } else this.dialog.childrenMap.actions = [button]
        this.dialog.layout();
        return button;
    }
}