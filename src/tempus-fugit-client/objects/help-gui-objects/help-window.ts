// @ts-nocheck
const COLOR_PRIMARY = 0x81D4FA;
const COLOR_LIGHT = 0xE1F5FE;
const COLOR_DARK = 0x03A9F4;
const COLOR_SELECTED = 0x29B6F6;
const COLOR_BORDER = 0x01579B;
const COLOR_TEXT = 0x0091EA;
const COLOR_RED = 0x9e0b00;
const COLOR_BLACK = 0x000;

// GUI Colors
const GUI_BORDER = 0x0;
const GUI_BORDER_HIGHLIGHT = 0xffffff;
const GUI_TAB = 0xeeeeee;
const GUI_TAB_SELECTED = 0x444444;
const GUI_FILL_LIGHT = 0xeeeeee;
const GUI_FILL = 0xaaaaaa;
const GUI_FILL_DARK = 0x777777;
const GUI_SLIDER = 0x666666;
const GUI_LABEL_BG = 0xcccccc;
const GUI_TEXT_AREA = 0x888888;
const GUI_TEXT_AREA_BORDER = 0xdddddd;
const GUI_TEXT_AREA_TEXT = 0xffffff;
const GUI_TEXT = 0x010101;
const GUI_CLOSE = 0xdd6666;

// Table Colors
const TABLE_BACKGROUND = 0x81D4FA;
const TABLE_BACKGROUND_RUNE = 0x03A9F4;
const TABLE_BORDERS = 0x000000;
const TABLE_DOT = 0x9e0b00;

// Format constants
const HELP_WIDTH = 1500;
const HELP_HEIGHT = 800;

const CELL_WIDTH = 70;
const CELL_HEIGHT = 40;


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

        // Create Title and Toolbar
        let title = this.createLabel(scene, 10, 'Help', GUI_FILL_LIGHT);
        let toolbar = [this.createLabel(scene, 23, 'X', GUI_CLOSE)];

        let label = this.createLabel(scene, 10, 'example', GUI_LABEL_BG);
        let text = this.createTextArea(scene, 'test this component asdjkflaksjdbfsdbfklasdbfjklsadbfkl bsdlkjfbsadkljfnsadfnkljasdbfkasdbfjklasasdfbadsljfbjklasdbfanfkjlsdabfjklsdabfjklsadbfjkldasbfjklsdnkjlfndsakljfn');
        let table_data = this.help_data[0].panel[2].table;
        console.log(table_data);
        let table = this.createTable(scene, table_data);
        let panel = this.createPanel(scene, label, text, table);
        let scrollPanel = this.createScrollablePanel(scene, panel);
        // let tabsPanel = this.createTabs(scene, this.data, scrollPanel);

        let dialog = rexUI.add.dialog({
            x: 1920 / 2,
            y: 1080 / 2,
            width: HELP_WIDTH,
            height: HELP_HEIGHT,
            background: rexUI.add.roundRectangle(0, 0, 100, 100, 5, GUI_FILL).setStrokeStyle(2, GUI_BORDER),
            // title: scene.add.existing(title),
            // toolbar: scene.add.existing(toolbar),
            content: this.createTabs(scene, this.help_data, scrollPanel),
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
    }

    public createLabel(scene, round, text, bgColor) {
        return scene.rexUI.add.label({
            width: 0,
            height: 0,
            background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, round, bgColor).setStrokeStyle(3, GUI_BORDER).setDepth(50),
            text: scene.add.text(0, 0, text, {
                fontSize: '24px',
                color: GUI_TEXT
            }).setDepth(51),
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            },
        });
    }

    public createTabs(scene, data, panel) {
        let t = scene.rexUI.add.tabs({
            // topButtons: data.map(entry => this.createTab(scene, entry.frame)),
            topButtons: data.map(entry => {
                let round = 15;
                return scene.rexUI.add.label({
                    width: 50,
                    height: 50,
                    background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, {tl: round, tr: round}, GUI_TAB)
                        .setStrokeStyle(3, GUI_BORDER)
                        .setDepth(110),
                    icon: scene.add.sprite(0,0, 'operators', entry.frame).setDepth(111),
                    space: {
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 10
                    }
                })
            }),
            // panel: scene.add.existing(panel),
            panel: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 5, COLOR_RED),
            space: {
                topButton: 1,
            }
        });

        t.help_data = this.help_data;
        t.that = this;

        t.on('button.click', function(button, groupName, index) {
            console.log('event works')
        }, this);

        // t.on('button.click', function(button, groupName, index) {
        //     let fns = this.that;
        //
        //     console.log('went into tab click function');
        //     let tab_data = data[index].panel;
        //
        //     let elements = [];
        //
        //     let createField = (data) => {
        //         switch (data.type) {
        //             case 'text-area':
        //                 elements.push(fns.createTextArea(scene, data.text));
        //                 break;
        //             case 'label':
        //                 elements.push(fns.createLabel(scene, 10, data.text, data.color));
        //                 break;
        //             case 'table':
        //                 elements.push(fns.createTable(scene, data.table));
        //                 break;
        //         }
        //     };
        //
        //     tab_data.map(createField);
        //
        //     let panel = fns.createPanel(scene, ...elements);
        //     let scrollPanel = fns.createScrollablePanel(scene, panel);
        //
        //     console.log(scrollPanel);
        //
        //     t.panel = scene.add.existing(scrollPanel);
        // });

        t.emitButtonClick('top', 0);

        console.log(t);
        return t;
    }

    public createTab(scene, frame) {
        let round = 15;
        return scene.rexUI.add.label({
            width: 50,
            height: 50,
            background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, {tl: round, tr: round}, GUI_TAB)
                .setStrokeStyle(3, GUI_BORDER)
                .setDepth(110),
            icon: scene.add.sprite(0,0, 'operators', frame).setDepth(111),
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        });
    }

    public createScrollablePanel(scene, content) {
        let round = 10;
        return scene.rexUI.add.scrollablePanel({
            width: HELP_WIDTH - 20,
            height: HELP_HEIGHT,
            scrollMode: 0, //vertical scroll
            panel: {
                child: scene.add.existing(content),
                mask: {
                    padding: 1
                }
            },
            background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, {
                tl: 0,
                tr: round,
                bl: round,
                br: round
            }, GUI_FILL_DARK)
                .setStrokeStyle(3, GUI_BORDER)
                .setDepth(20),
            slider: {
                track: scene.rexUI.add.roundRectangle(0, 0, 20, 20, 10, GUI_SLIDER).setDepth(21),
                thumb: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, GUI_FILL).setDepth(22)
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
        }).addBackground(scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, GUI_FILL_DARK).setDepth(30));

        elements.reduce(function (sizer, element) {
            return sizer.add(element, 1, 'center', 5, true); // args: child, proportion, align, padding, expand
        }, sizer);

        return sizer;
    }

    public createTextArea(scene, text) {    // TODO fix this somehow
        let txt = scene.rexUI.add.textArea({
            height: 80,
            background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, GUI_TEXT_AREA)
                .setStrokeStyle(2, GUI_TEXT_AREA_BORDER)
                .setDepth(90),
            text: scene.add.text(0, 0, text, {
                fontSize: '20px',
                color: GUI_TEXT_AREA_TEXT,
                wordWrap: {
                    width: 900
                }
            }).setDepth(91),
            spacer: {
                text: 100
            }
        });
        txt.setText(text);
        return txt;
    }

    /**
     * Generates table to display setting of variables
     *
     * @param scene
     * @param data format [[...],   // would correspond to 3 rows and the amount of columns
     *                     [...],   // is equal to the length of the inner arrays
     *                     [...]]
     */
    public createTable(scene, data) {
        let rows = data.length;
        let cols = data[0].length;
        // Create the grid on which cells are placed
        let table = scene.rexUI.add.gridSizer({
            width: CELL_WIDTH * cols,
            height: CELL_HEIGHT * rows,
            column: cols,
            row: rows,
            rowProportions: 1,
            columnProportions: 1
        });
        // Cell generator function
        let createCell = (r_index, c_index, cell) => {
            let runeFrame = (index) => (index + 2) % 4;
            let bgColor = (isRune) => isRune === 0 ? TABLE_BACKGROUND_RUNE : TABLE_BACKGROUND;
            let addRune = (index) => scene.add.sprite(0, 0, "runes", runeFrame(index)).setDepth(100);
            let addDot = (hasDot) => hasDot ? scene.rexUI.add.roundRectangle(0, 0, 20, 20, 10, TABLE_DOT).setDepth(100) : undefined;

            return scene.rexUI.add.label({
                background: scene.rexUI.add.roundRectangle(0, 0, CELL_WIDTH, CELL_HEIGHT, 0, bgColor(c_index)).setDepth(99),
                icon: c_index === 0 ? addRune(r_index) : addDot(cell),
                space: {
                    left: HELP_WIDTH / (cols * 2) - 15 // center dots and runes in cell
                }
            });
        };
        // Generate cells and add to table
        data.map((row, r_index) => {
            row.map((cell, c_index) => {
                table.add(createCell(r_index, c_index, cell), c_index, r_index, 'top', 1); // 1 is padding, borders are whitespace over background
            })
        });
        // Sizer makes it display properly, idk why tho
        return scene.rexUI.add.sizer({orientation: 'x',})
            .addBackground(scene.rexUI.add.roundRectangle(0, 0, 0, 0, 5, TABLE_BORDERS).setDepth(98)) // background serves as borders
            .add(table, 1, 'center', 2, true);
    }

    public help_data = [{
        frame: 0,
        panel: [{
            type: 'text-area',
            text: 'testing this out with two tabs'
        },{
            type: 'label',
            text: 'Example',
            color: GUI_LABEL_BG
        },{
            type: 'table',
            table: [
                [0,1,0,0,0,0],
                [0,1,0,0,0,0],
                [0,0,1,1,0,0],
                [0,1,0,0,0,0],
            ]
        }]

    }, {
        frame: 1,
        panel: [{
            type: 'text-area',
            text: 'content should have switched to this on click'
        },{
            type: 'label',
            text: 'Example',
            color: GUI_LABEL_BG
        },{
            type: 'table',
            table: [
                [0,0,1,1,1,0],
                [0,1,0,0,1,0],
                [0,0,1,1,1,0],
                [0,1,1,1,1,0],
            ]
        }]
    }]
}