// @ts-nocheck

// GUI Colors
const GUI_BORDER = 0x0;
const GUI_BORDER_HIGHLIGHT = 0xdddddd;
const GUI_TAB = 0xeeeeee;
const GUI_TAB_SELECTED = 0x999999;
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

const CELL_WIDTH = 150;
const CELL_HEIGHT = 40;


export class HelpWindow {
    private scene: Phaser.Scene;

    public helpGUI;
    public _prevTab;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public createWindow(): void {
        let scene = this.scene;
        let {game: {config: {width, height}}, rexUI} = this.scene;

        // Create Title and Toolbar
        let title = this.createLabel(scene, 10, 'Help', GUI_FILL_LIGHT).setDraggable();
        let toolbar = [this.createLabel(scene, 23, 'X', GUI_CLOSE)];

        // Create Tabs with structure
        let panel = this.createPanel(undefined, scene);
        let scrollPanel = this.createScrollablePanel(scene, panel);
        let tabsPanel = this.createTabs(scene, HelpWindow.help_data, scrollPanel);

        let dialog = rexUI.add.dialog({
            x: 1920 / 2,
            y: 1080 / 2,
            width: HELP_WIDTH,
            height: HELP_HEIGHT,
            background: rexUI.add.roundRectangle(0, 0, 100, 100, 5, GUI_FILL).setStrokeStyle(2, GUI_BORDER),
            title: scene.add.existing(title),
            toolbar: scene.add.existing(toolbar),
            content: scene.add.existing(tabsPanel),
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
        // .setDraggable()
            .layout()
            .popUp(300);

        // Close button events
        dialog.on('button.click', function () {
            scene.scene.sleep('HelpScene');
        }).on('button.over', function (button) {
            button.getElement('background').setStrokeStyle(3, GUI_BORDER_HIGHLIGHT);
        }).on('button.out', function (button) {
            button.getElement('background').setStrokeStyle(3, GUI_BORDER);
        });

        this.helpGUI = dialog;
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
            }
        });
    }

    public createTabs(scene, data, panel) {
        const tabs = scene.rexUI.add.tabs({
            topButtons: data.map(entry => this.createTab(scene, entry.frame)),
            panel: scene.add.existing(panel),
            space: {
                topButton: 1,
            }
        });

        this.tabs_obj = tabs;

        tabs.on('button.click', function (button, groupName, index) {
            let selectTab = (button) => button.getElement('background').setFillStyle(GUI_TAB_SELECTED);
            let deselectTab = (button) => button.getElement('background').setFillStyle(GUI_TAB);

            // Color selected tab and deselected tab
            selectTab(button);
            this._prevTab ? deselectTab(this._prevTab) : undefined;
            this._prevTab = button;

            let tab_data = data[index].panel;
            let elements = [];
            let createField = (data) => {
                switch (data.type) {
                    case 'text-area':
                        elements.push(this.createTextArea(scene, data.text));
                        break;
                    case 'label':
                        elements.push(this.createLabel(scene, 10, data.text, data.color));
                        break;
                    case 'table':
                        elements.push(this.createTable(scene, data.table));
                        break;
                    case 'formula':
                        elements.push(this.createFormula(scene, data.string));
                        break;
                }
            };

            tab_data.map(createField);

            let scroll = tabs.getElement('panel');
            let panel = scroll.getElement('panel');
            let [DontRemove, ...toRemove] = panel.sizerChildren;

            // delete all children but first invisible roundRectangle (needed for formatting)
            toRemove.map(child => {
                panel.remove(child);
                child.destroy();
            });

            // with panel arg, adds to panel
            this.createPanel(panel, scene, ...elements);
            panel.layout();
            scroll.layout();
        }, this);

        tabs.on('button.over', function highlightBorder(button) {
            button.getElement('background').setStrokeStyle(3, GUI_BORDER_HIGHLIGHT)
        });
        tabs.on('button.out', function restoreBorder(button) {
            button.getElement('background').setStrokeStyle(3, GUI_BORDER)
        });

        // Preselect first tab
        tabs.emitButtonClick('top', 0);

        return tabs;
    }

    public createTab(scene, frame) {
        let round = 15;
        return scene.rexUI.add.label({
            width: 50,
            height: 50,
            background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, {tl: round, tr: round}, GUI_TAB)
                .setStrokeStyle(3, GUI_BORDER)
                .setDepth(19),
            icon: scene.add.sprite(0, 0, 'operators', frame).setDepth(111),
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

    /**
     * Creates a panel, by adding the elements passed in the order they are passed
     * @param oldPanel if a panel (type sizer) is passed elements will be added to it, otherwise create a new one
     * @param scene
     * @param elements collects args to array, are elements that will be added to the panel
     */
    public createPanel(oldPanel, scene, ...elements) {
        let sizer = oldPanel ? oldPanel : scene.rexUI.add.sizer({
            orientation: 'y'
        }).addBackground(scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, GUI_FILL_DARK).setDepth(30));

        // add first invisible round rectangle which 'saves' formatting of panel when switching between tabs, NOT to be removed
        if (!oldPanel) sizer.add(scene.rexUI.add.roundRectangle(0, 0, 1, 1, 0, undefined), 1, 'center', 5, true);

        elements.reduce(function (sizer, element) {
            return element.dontExpand ? sizer.add(element, 1, 'center', 5, false) : sizer.add(element, 1, 'center', 5, true); // args: child, proportion, align, padding, expand
        }, sizer);

        return sizer;
    }

    public createTextArea(scene, text) {
        let textArea = scene.rexUI.add.textArea({
            height: 80,
            background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, GUI_TEXT_AREA)
                .setStrokeStyle(2, GUI_TEXT_AREA_BORDER)
                .setDepth(90),
            text: scene.add.text(0, 0, text, {
                fontSize: '20px',
                // color: GUI_TEXT_AREA_TEXT,   // if uncommented text turns black although color white????
                wordWrap: {
                    // width: 900
                },
                scroller: false
            }).setDepth(91)
        });
        textArea.setText(text);
        return textArea;
    }

    public createFormula(scene, formulaString) {
        let sizer = scene.rexUI.add.sizer({
            orientation: 'x'
        });
        console.log(`creating formula ${formulaString}`);

        formulaString.split('').reduce(function (sizer, character) {
            let icon_info = HelpWindow.toFormulaSprite[character];
            console.log(icon_info);
            let icon = scene.add.sprite(0, 0, icon_info.type, icon_info.frame);
            return sizer.add(icon, 1, 'center', 2, false);
        }, sizer);

        sizer.setDepth(100);
        sizer.dontExpand = true;

        return sizer;
    }

    /**
     * Generates table to display setting of variables
     *
     * @param scene
     * @param data format [[...],   // would correspond to 3 rows and the amount of columns
     *                     [...],   // is equal to the length of the inner arrays
     *                     [...]]   // 0 -> empty cell, 1 -> dot
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
            let addRune = (index) => scene.add.sprite(0, 0, "runes", runeFrame(index)).setDepth(100);
            let addDot = (hasDot) => hasDot ? scene.rexUI.add.roundRectangle(0, 0, 20, 20, 10, TABLE_DOT).setDepth(100) : undefined;
            let bgColor = (isRune) => isRune === 0 ? TABLE_BACKGROUND_RUNE : TABLE_BACKGROUND;

            return scene.rexUI.add.label({
                background: scene.rexUI.add.roundRectangle(0, 0, CELL_WIDTH, CELL_HEIGHT, 0, bgColor(c_index)).setDepth(99),
                icon: c_index === 0 ? addRune(r_index) : addDot(cell),
                space: {
                    left: CELL_WIDTH / 2 - 10 // center dots and runes in cell
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
        let sizer = scene.rexUI.add.sizer({orientation: 'x',})
            .addBackground(scene.rexUI.add.roundRectangle(0, 0, 0, 0, 5, TABLE_BORDERS).setDepth(98)) // background serves as borders
            .add(table, 1, 'center', 2, true);

        sizer.dontExpand = true;   // don't expand tables
        return sizer;
    }

    static toFormulaSprite = {
        ["n"]: {type: "runes", frame: 0},
        ["s"]: {type: "runes", frame: 1},
        ["l"]: {type: "runes", frame: 2},
        ["t"]: {type: "runes", frame: 3},
        ["&"]: {type: "operators", frame: 0},
        ["|"]: {type: "operators", frame: 1},
        ["-"]: {type: "operators", frame: 2},
        ["="]: {type: "operators", frame: 3},
        ["!"]: {type: "operators", frame: 4},
        ["F"]: {type: "operators", frame: 5},
        ["E"]: {type: "operators", frame: 6},
        ["H"]: {type: "operators", frame: 7},
        ["G"]: {type: "operators", frame: 8},
        ["Y"]: {type: "operators", frame: 9},
        ["X"]: {type: "operators", frame: 10},
        ["R"]: {type: "operators", frame: 11},
        ["U"]: {type: "operators", frame: 12},
        ["("]: {type: "operators", frame: 13},
        [")"]: {type: "operators", frame: 14}
    };

// TODO make content for help
    static help_data = [{
        frame: 0,
        panel: [
            {
                type: 'label',
                text: 'Example',
                color: GUI_LABEL_BG
            },
            {
                type: 'formula',
                string: 'l&n'
            },
            {
                type: 'text-area',
                text: 'testing this out with two tabs'
            },
            {
                type: 'table',
                table: [
                    [0, 1, 0, 0, 0, 0],
                    [0, 1, 0, 0, 0, 0],
                    [0, 0, 1, 1, 0, 0],
                    [0, 1, 0, 0, 0, 0],
                ]
            }]

    },
        {
            frame: 1,
            panel: [
                {
                    type: 'label',
                    text: 'Example',
                    color: GUI_LABEL_BG
                },
                {
                    type: 'text-area',
                    text: 'content should have switched to this on click'
                },
                {
                    type: 'table',
                    table: [
                        [0, 0, 1, 1, 1, 0],
                        [0, 1, 0, 0, 1, 0],
                        [0, 0, 1, 1, 1, 0],
                        [0, 1, 1, 1, 1, 0],
                    ]
                }]
        }]
}