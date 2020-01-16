// @ts-nocheck
const COLOR_PRIMARY = 0x81D4FA;
const COLOR_LIGHT = 0xE1F5FE;
const COLOR_DARK = 0x03A9F4;
const COLOR_SELECTED = 0x29B6F6;
const COLOR_BORDER = 0x01579B;
const COLOR_TEXT = 0x0091EA;
const COLOR_RED = 0x9e0b00;
const COLOR_BLACK = 0x000;

// Table Colors
const TABLE_BACKGROUND = 0x03A9F4;
const TABLE_BACKGROUND_RUNE = 0x0091EA;
const TABLE_BORDERS = 0x000;
const TABLE_DOT = 0x9e0b00;

// Format constants
const HELP_WIDTH = 1500;

const CELL_WIDTH = 70;
const CELL_HEIGHT = 20;




export class HelpWindow {
    private scene: Phaser.Scene;
    private helpConfig: Object;


    public rectangle(scene, color, round) {
        return scene.rexUI.add.roundRectangle(0, 0, 10, 10, round, color);
    }

    constructor(scene: Phaser.Scene, config?: Object) {
        this.scene = scene;
        this.helpConfig = config;
    }

    public createWindow(): void {
        let scene = this.scene;
        let {game: {config: {width, height}}, rexUI} = this.scene;

        let dialog = rexUI.add.dialog({
            x: 500,
            y: 500,
            width: HELP_WIDTH,

            // background: this.rectangle(scene, COLOR_PRIMARY, 5),
            background: rexUI.add.roundRectangle(0, 0, 100, 100, 5, COLOR_PRIMARY).setStrokeStyle(3, 0x000000),

            // title: title,
            title: this.createLabel(scene, 10, 'Help', COLOR_LIGHT),


            toolbar: [this.createLabel(scene, 10, 'X', COLOR_LIGHT)],


            // TODO THIS IS TABS
            content: this.createTable(scene, this.data),

            align: {
                title: 'center',
                toolbar: 'right'
            },

            space: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20,

                title: 20,
                titleLeft: 100,
                titleRight: 100,
                toolbarLeft: 10
            }

        })
            .setDraggable('background')
            .layout()
            .popUp(300);

        console.log(dialog);

        // @ts-ignore
        // this.scene.rexUI.add.roundRectangle(100, 150, 100, 100, 0, 0x008888);
    }

    public createLabel(scene, round, text, bgColor) {
        return scene.rexUI.add.label({
            width: 50,
            height: 50,

            background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, round, bgColor).setStrokeStyle(3, COLOR_BORDER),

            text: scene.add.text(0, 0, text, {
                fontSize: '24px',
                color: COLOR_TEXT
            }),

            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        })
    }

    public createTabs(scene, tabs, panel) {
        let that = this;
        return scene.rexUI.add.tabs({
            topButtons: tabs.map(tab => this.createTab(scene, tab, COLOR_LIGHT)),

            panel: panel,

            space: {
                left: 20,
                right: 20,
                top: 0,
                bottom: 20,

                topButtonsOffset: 0,

                topButton: 10,
            }
        });
    }

    public createTab(scene, key, bgColor) {
        return scene.rexUI.add.label({
            width: 50,
            height: 50,

            background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, bgColor).setStrokeStyle(3, COLOR_BORDER),

            text: scene.add.text(0, 0, key, {
                fontSize: '24px',
                color: COLOR_TEXT
            }),

            // icon: scene.add.sprite(0,0, key);    // TODO uncomment when turned into sprite

            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        })
    }

    public createScrollablePanel(scene, content) {
        return scene.rexUI.add.scrollablePanel({
            scrollMode: 0, //vertical scroll
            panel: {
                child: content,
                mask: {
                    padding: 1
                }
            },
            background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, COLOR_PRIMARY),

            slider: {
                track: scene.rexUI.add.roundRectangle(0, 0, 20, 20, 10, COLOR_DARK),
                thumb: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_PRIMARY)
            },
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        });
    }

    public createPanel(scene, ...elements) {
        let sizer = scene.rexUI.add.sizer({
            orientation: 'y'
        })
            .addBackground(scene.rexUI.add.roundRectangle(0, 0,));

        elements.reduce(function (sizer, element) {
            return sizer.add(element);
        }, sizer);

        return sizer;
    }

    public createTextArea(scene, text) {
        return scene.rexUI.add.textArea({
            background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 10, COLOR_PRIMARY),
            text: scene.add.text(0, 0, text, {
                fontSize: '16px',
                color: COLOR_TEXT
            })
        })
    }

    public createTable(scene, data) {
        let rows = data.length;
        let cols = data[0].length;

        let table = scene.rexUI.add.gridSizer({
            width: CELL_WIDTH * cols,
            height: CELL_HEIGHT * rows,
            column: cols,
            row: rows,
            rowProportions: 1,
            columnProportions: 1
        });

        let createCell = (r_index, c_index, cell) => {
            let runeFrame = (index) => (index + 2) % 4;
            let bgColor = (isRune) => isRune === 0 ? TABLE_BACKGROUND_RUNE : TABLE_BACKGROUND;
            let addRune = (index) => scene.add.sprite(0, 0, "runes", runeFrame(index));
            let addDot = (hasDot) => hasDot ? scene.rexUI.add.roundRectangle(0, 0, 20, 20, 10, TABLE_DOT).setDepth(2) : undefined;

            let label = scene.rexUI.add.label({
                background: scene.rexUI.add.roundRectangle(0, 0, CELL_WIDTH, CELL_HEIGHT, 0, bgColor(c_index)).setStrokeStyle(2, TABLE_BORDERS),
                icon: c_index === 0 ? addRune(r_index) : addDot(cell),
                space: {
                    // icon: 5,
                    left: HELP_WIDTH / (cols * 2) - 15   //TODO align this properly
                }
            });
            return label;
        };

        data.map((row, r_index) => {
            row.map((cell, c_index) => {
                table.add(createCell(r_index, c_index, cell), c_index, r_index, 'top');
            })
        });
        console.log(table);
        return table;
    }


    public data = [
        [0, 1, 0, 0, 0, 0],
        [0, 1, 0, 1, 0, 0],
        [0, 1, 0, 0, 1, 0],
        [0, 1, 1, 0, 0, 0],
    ]


}