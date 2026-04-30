import { GameState, GameStateListener } from "../game-objects/game-state";
import { Variable } from "../../temporal-logic/variable";
import { Mission } from "../../mechanics/mission";
import { ToolTip } from "./tool-tip";
import { ListGUI } from "./list-gui";

/**
 * @author Mustafa
 */
export class TableGUI implements GameStateListener {
    private scene: Phaser.Scene;
    public energyTable;
    private _gameState: GameState;
    private game: Mission;

    public variableTable; // game state table
    private variableTableCellWidth = 90.4; // width of a cell
    private variableTableCellHeight = 60; // height of a cell
    private initialColumnCount = 20; // number of visible columns
    private tableColumnCount = 20; // number of total columns
    private variables: { [name: string]: number } = {}; // mapping from variable name to index
    private mapping: { [char: string]: { frame: number } } = {}; // mapping from rune name to frame in sprite sheet
    private tableItems: {
        id: number,
        iconAlpha: number,
        backgroundColor: number,
        backgroundAlpha: number

    }[]; // Array of cell data
    private overlay: Phaser.GameObjects.Rectangle; // dark rectangle to fade table out
    private outline: Phaser.GameObjects.Graphics; // light outline surrounding table
    private scrollCount = 0; // offset for number of columsn scrolled 
    private energyTexture: string; // texture for energy icons

    private colorPrimary: number; // default background color of cells
    private colorHighlight: number; // background color of cells when highlighted
    private colorCellOver: number; // color of cell edge when hovered
    private colorCellEdge: number; // default color of cell edge
    private colorArrow: number; // color of scrolling arrows

    private isDestroyed = false;

    constructor(
        scene: Phaser.Scene,
        game: Mission,

        colorPrimary: number = 0x5C4D4D,
        colorHighlight: number = 0xc9c7c5,
        colorArrow: number = 0x376A8E,
        colorCellOver: number = 0xff0000,
        colorCellEdge: number = 0x260e05,
        energyTexture: string = "energyFont"
    ) {
        this.scene = scene;
        this.gameState = game.gameState;
        this.game = game;
        this.energyTexture = energyTexture;
        this.colorPrimary = colorPrimary;
        this.colorCellOver = colorCellOver;
        this.colorCellEdge = colorCellEdge;
        this.colorHighlight = colorHighlight;
        this.colorArrow = colorArrow;

        let i = 0;
        for (let key in this.gameState.variables)
            this.variables[key] = i++;

        // this.variables = {
        //     n: 0,
        //     t: 1,
        // }

        // mapping of rune names fo frame in sprite
        this.mapping.n = { frame: 0 };
        this.mapping.s = { frame: 1 };
        this.mapping.l = { frame: 2 };
        this.mapping.t = { frame: 3 };

        this.createVariableTable();
        this.createEnergyTable(this.gameState.energy);

        this.roundChanged(this.gameState, -1, this.gameState.activeState);
        this.setUpScrollingArrows();

        this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.destroy();
        });
    }

    private isVariableTableReady(): boolean {
        return !this.isDestroyed && !!this.variableTable && !!this.variableTable.scene && !!this.variableTable.getElement('table');
    }

    private isEnergyTableReady(): boolean {
        return !this.isDestroyed && !!this.energyTable && !!this.energyTable.scene && !!this.energyTable.getElement('table');
    }

    public destroy(): void {
        if (this.isDestroyed) return;
        this.isDestroyed = true;

        if (this.overlay) {
            this.overlay.destroy();
        }
        if (this.outline) {
            this.outline.destroy();
        }
        if (this.energyTable) {
            this.energyTable.removeAllListeners();
            this.energyTable.destroy();
        }
        if (this.variableTable) {
            this.variableTable.removeAllListeners();
            this.variableTable.destroy();
        }
    }

    /**
     * creates a new game state table 
     * @param paddingLeft : distance from left side of table to left edge of screen 
     * @param paddingTop : distance from top side of table to top edge of screen 
     */

    private createVariableTable(paddingLeft: number = 10, paddingTop: number = 10): void {
        let numVar = Object.keys(this.variables).length;
        let itemCount = this.initialColumnCount * numVar;
        let self = this;
        // items in table
        this.tableItems = [];
        for (let i = 0; i < itemCount; i++) {
            this.tableItems.push({
                id: i,
                iconAlpha: 0,
                backgroundColor: this.colorPrimary,
                backgroundAlpha: 0
            });
        }

        // table for variable boolean values
        // @ts-ignore
        this.variableTable = this.scene.rexUI.add
            .gridTable({
                x: paddingLeft + this.variableTableCellWidth + this.initialColumnCount * this.variableTableCellWidth * 0.5,
                y: paddingTop + numVar * this.variableTableCellHeight * 0.5,
                // @ts-ignore
                background: this.scene.rexUI.add.roundRectangle(
                    0,
                    0,
                    20,
                    10,
                    10,
                    this.colorPrimary,
                    0.3
                ),
                scroller: false,
                scrollMode: 1,
                table: {
                    width: this.variableTableCellWidth * 20,
                    height: this.variableTableCellHeight * numVar,
                    cellWidth: this.variableTableCellWidth,
                    cellHeight: this.variableTableCellHeight,
                    columns: numVar,
                    mask: {
                        padding: 2
                    }
                },
                createCellContainerCallback: function (cell) {
                    const scene = cell.scene,
                        width = cell.width,
                        height = cell.height,
                        item = cell.item;
                    return scene.rexUI.add.label({
                        width: width,
                        height: height,
                        background: scene.rexUI.add
                            .roundRectangle(0, 0, 20, 20, 0, item.backgroundColor, item.backgroundAlpha)
                            .setStrokeStyle(2, self.colorCellEdge),
                        icon: scene.add.image(0, 0, self.energyTexture).setAlpha(item.iconAlpha).setDepth(5),
                        space: {
                            left: 30
                        }
                    });
                }
            })
            .layout();

        // add items to table
        this.variableTable.setItems(this.tableItems);

        // configure events
        this.variableTable
            .on(
                "cell.click",
                function (cellContainer, cellIndex) {
                    if (this.isDestroyed) return;
                    const column = Math.floor(cellIndex / numVar);
                    const row = cellIndex % numVar;
                    const variableName = Object.keys(this.variables).find(key => this.variables[key] === row);
                    this.scene.time.delayedCall(0, () => {
                        if (this.isDestroyed || !variableName) return;
                        this._gameState.invertVariableUser(variableName, column);
                    });
                }, this)
            .on("cell.over", function (cellContainer, cellIndex) {
                // focus current cell when hovering over it
                cellContainer
                    .getElement("background")
                    .setStrokeStyle(2, this.colorCellOver)
                    .setDepth(1);
            }, this)
            .on("cell.out", function (cellContainer, cellIndex) {
                cellContainer
                    .getElement("background")
                    .setStrokeStyle(2, this.colorCellEdge)
                    .setDepth(0);
            }, this);


        // table for variable names
        // @ts-ignore
        let variableNameTable = this.scene.rexUI.add
            .gridTable({
                x: paddingLeft + this.variableTableCellWidth * 0.5,
                y: paddingTop + numVar * this.variableTableCellHeight * 0.5,
                // @ts-ignore
                background: this.scene.rexUI.add.roundRectangle(
                    0,
                    0,
                    20,
                    10,
                    10,
                    this.colorPrimary
                ),
                scroller: false,
                table: {
                    width: this.variableTableCellWidth,
                    height: this.variableTableCellHeight * numVar,
                    cellWidth: this.variableTableCellWidth,
                    cellHeight: this.variableTableCellHeight,
                    columns: 1,
                    mask: {
                        padding: 2
                    }
                },
                createCellContainerCallback: function (cell) {
                    const scene = cell.scene,
                        width = cell.width,
                        height = cell.height,
                        variable = cell.item.variable;
                    let label = scene.rexUI.add.label({
                        width: width,
                        height: height,
                        background: scene.rexUI.add
                            .roundRectangle(0, 0, 20, 20, 0)
                            .setStrokeStyle(2, self.colorCellEdge),
                        icon: scene.add.sprite(0, 0, "runes", self.mapping[variable].frame),
                        space: {
                            left: 30
                        }
                    });
                    /*
                                        let text = variable;
                                        if (variable == "l") text = "light";
                                        if (variable == "t") text = "transform";
                                        if (variable == "n") text = "nature";
                                        if (variable == "s") text = "strength";
                                        let tooltip:ToolTip = new ToolTip(this.scene, variableNameTable.x+30, variableNameTable.y+20*i);
                                        tooltip.addText(text);*/

                    return label;
                }
            })
            .layout();

        // add items to table
        let tooltips: ListGUI[] = [];
        let items = [];
        for (let i = 0; i < numVar; i++) {
            let key = Object.keys(this.variables).find(key => this.variables[key] === i)
            items.push({
                id: i,
                variable: key
            });

            let text = "";
            if (key == "l") text = "light";
            if (key == "t") text = "transform";
            if (key == "n") text = "nature";
            if (key == "s") text = "strength";
            let tooltip: ListGUI = new ListGUI(this.scene, 475, 250);
            tooltip.addText(text, ListGUI.ALIGN_CENTRE, { fontSize: '18px', fontStyle: 'bold', fontFamily: 'pressStart', color: '#FFFFFF' });
            tooltip.setVisible(false);
            tooltip.fixedMaxTextWidth = true;
            tooltip.maxTextWidth = 175;
            tooltip.revalidate();

            tooltips.push(tooltip);
        }
        variableNameTable.setItems(items);


        variableNameTable.on("cell.over", function (cellContainer, cellIndex) {
            tooltips[cellIndex].fadeIn()
        }).on("cell.out", function (cellContainer, cellIndex) {
            tooltips[cellIndex].fadeOut()
        })

        this.paddVariableStates(this.tableColumnCount-1)
    }

    paddVariableStates(n: number) {
        const variableValues:any = {}
        for (let key in this.gameState.variables) {
            const variable = this.gameState.variables[key]
            if (n >= variable.values.length) {
                variableValues[key] = { [ n ]: variable.getValue(n) };
            }
        }

        this.gameState.setVariableValues(
            variableValues, false
        )
    }

    /**
     * creates a new energy table
     * @param energyCount: number of energy dots
     * @param paddingLeft :  distance from left side of energy table to left edge of screen
     */
    createEnergyTable(
        energyCount: number,
        paddingLeft: number = 230,
    ): void {
        if (this.isDestroyed || !this.isVariableTableReady()) return;

        // destroy old table if available
        if (this.energyTable) {
            this.energyTable.removeAllListeners();
            this.energyTable.destroy();
        }

        let cellWidth = 40;
        let cellHeight = 30;
        let bottom = this.variableTable.bottom + 35;
        let self = this;
        // items in table
        let items = [];
        for (let i = 0; i < energyCount; i++) {
            items.push({
                id: i
            });
        }

        // @ts-ignore
        this.energyTable = this.scene.rexUI.add
            .gridTable({
                x: paddingLeft + energyCount * cellWidth * 0.5,
                y: bottom,
                // table config
                table: {
                    width: cellWidth * energyCount,
                    height: cellHeight,
                    cellWidth: cellWidth,
                    cellHeight: cellHeight,
                    columns: energyCount,
                    mask: {
                        padding: 2
                    }
                },
                createCellContainerCallback: function (cell) {
                    const scene = cell.scene,
                        width = cell.width,
                        height = cell.height;

                    return scene.rexUI.add.label({
                        width: width,
                        height: height,
                        icon: scene.add.image(0, 0, self.energyTexture)
                    });
                }
            })
            .layout();

        // add items to table
        this.energyTable.setItems(items);
    }

    /**
     * change background color of table cell
     * @param color: color to change background to
     * @param column: position of cell
     * @param row: position of cell
     */
    private setCellColor(color: number, column: number, row: number): void {
    if (!this.isVariableTableReady()) return;
        let cell = this.tableItems[column * Object.keys(this.variables).length + row];
        cell.backgroundColor = color;
        cell.backgroundAlpha = 0.25;
        this.variableTable.getElement('table').updateTable(true);
    }

    /**
     * adds rune to cell with given column and row if visible is true, else clears cell
     * @param visible: true if rune in cell should be set
     * @param column: position of cell
     * @param row: position of cell
     */
    private toggleRune(visible: boolean, column: number, row: number): void {
        if (!this.isVariableTableReady()) return;
        let index = column * Object.keys(this.variables).length + row;
        while (this.tableItems.length <= index) this.addColumns(1);
        this.tableItems[index].iconAlpha = Number(visible);
        this.variableTable.getElement('table').updateTable(true);
    }

    /**
     * change color of energy table at index
     * @param color: color to change energy cell to
     * @param index: position of cell
     * @param visible: energy icon shows if visible is true
     */
    private setEnergyIconColor(visible: boolean, index: number) {
        if (!this.isEnergyTableReady()) return;
        this.energyTable
            .getElement("table")
            .getCell(index)
            .getContainer()
            .getElement("icon")
            .setVisible(visible);
    }

    get gameState(): GameState {
        return this._gameState;
    }

    set gameState(value: GameState) {
        this._gameState = value;
        value.listener.push(this);
    }

    async roundChanged(gameSate: GameState, lastRound: number, activeRound: number) {
        // add 30 more columns if end of table is reached
        if (activeRound >= this.tableColumnCount - 3) {
            this.addColumns(3);
        }

        // change color of coloumn
        let nextRound = activeRound;
        //const variables = Object.keys(this._gameState.variables);
        let variables = Object.keys(this.variables);
        for (let index in variables) {
            this.setCellColor(this.colorHighlight, nextRound, parseInt(index));
            if (lastRound >= 0) this.setCellColor(this.colorPrimary, lastRound, parseInt(index));
        }

        this.createEnergyTable(this.gameState.maxEnergy);

        // move table to the right if last visible column is reached
        this.scrollTable(true)
    }

    addColumns(n: number) {
        if (!this.isVariableTableReady()) return;
        let numVar = Object.keys(this.variables).length;
        let itemCount = n * numVar;
        for (let i = 0; i < itemCount; i++) {
            this.tableItems.push({
                id: this.tableColumnCount * numVar + i,
                iconAlpha: 0,
                backgroundColor: this.colorPrimary,
                backgroundAlpha: 0
            });
        }
        this.tableColumnCount += n;
        this.variableTable.setItems(this.tableItems);
        this.paddVariableStates(this.tableColumnCount-1);
    }

    async variableChanged(gameState: GameState, oldVariable: Variable, variable: Variable, valueChanges: { [p: number]: boolean }) {
        const column = this.variables[variable.representation];
        if (oldVariable.defaultValueFuture !== variable.defaultValueFuture) {
            // defaultValueFuture changed: repaint every visible cell so the
            // whole trace reflects the new open-ended value.
            for (let row = 0; row < this.tableColumnCount; row++) {
                this.toggleRune(variable.getValue(row), row, column);
            }
        } else {
            for (let key in valueChanges) {
                let row = parseInt(key);
                let newValue = valueChanges[key];
                this.toggleRune(newValue, row, column);
            }
        }
    }

    async energyChanged(gameState: GameState, oldEnergy: number, newEnergy: number, oldMaxEnergy: number, newMaxEnergy: number) {
        // only changes one energy
        if (oldEnergy > newEnergy) {
            this.setEnergyIconColor(false, newEnergy);
        } else {
            this.setEnergyIconColor(true, newEnergy - 1);
        }
    }

    async activated(gameState: GameState) {
        if (!this.isVariableTableReady()) return;
        if (gameState.active) {
            if (this.overlay)
                this.overlay.destroy();
            this.toggleOutline(true);
        } else {
            this.toggleOutline(false);
            let left = this.variableTable.left - this.variableTableCellWidth;
            let top = this.variableTable.top;
            let width = this.variableTable.width + this.variableTableCellWidth;
            let height = this.variableTable.height;
            this.overlay = this.scene.add.rectangle(left, top, width, height, 0x000000, 0.5)
                .setDepth(100).setOrigin(0, 0);
        }
    }

    /**
     * toggles golden outline of game state table
     * @param visible: true if outline should be shown 
     */
    toggleOutline(visible: boolean) {
        if (!this.isVariableTableReady()) return;
        if (!this.outline) {
            let left = this.variableTable.left - this.variableTableCellWidth;
            let right = this.variableTable.right;
            let top = this.variableTable.top;
            let bottom = this.variableTable.bottom;
            let graphics = this.scene.add.graphics();
            graphics.lineGradientStyle(5, 0xF2F1E7, 0xF2F1E7, 0xF2F1E7, 0xF2F1E7, 1);
            this.outline = graphics.strokeRoundedRect(left, top, right - left, bottom - top, 5).setDepth(10);
        }
        this.outline.setVisible(visible);
    }

    /**
     * moves tables columns one to the right if toRight is true, else to left (only if space is available)
     * @param toRight
     * @returns true if scoll was successfull
     */
    scrollTable(toRight: boolean): boolean {
        if (!this.isVariableTableReady()) return false;
        let scrollFactor = this.variableTableCellWidth;
        if (toRight) {
            if (this.scrollCount + 20 < this.tableColumnCount) {
                this.variableTable.getElement('table').addTableOY(-scrollFactor).updateTable();
                this.scrollCount++;
                return true;
            }
        } else {
            if (this.scrollCount > 0) {
                this.variableTable.getElement('table').addTableOY(scrollFactor).updateTable();
                this.scrollCount--;
                return true;
            }
        }
    }


    /**
     * creates two arrows for scrolling columns to the left / right
     */
    setUpScrollingArrows() {
        let bottom = this.variableTable.bottom + 35;

        // arrows for scrolling, 
        let rightTweenSucc;
        let rightTweenFail;
        let rightArrow = this.scene.add.image(150, bottom, 'arrow')
            .setAngle(180)
            .setTint(this.colorArrow);

        rightArrow.setInteractive()
            .on('pointerdown', function () {

                if (
                    (typeof rightTweenSucc === 'undefined' || !rightTweenSucc.isPlaying()) &&
                    (typeof rightTweenFail === 'undefined' || !rightTweenFail.isPlaying())
                ) {

                    // color arrow red
                    rightArrow.setTint(0xff0000);

                    if (this.scrollTable(true)) {

                        // successful click
                        rightTweenSucc = this.scene.tweens.add({
                            targets: rightArrow,
                            x: '+=20',
                            ease: 'power2',
                            duration: 100,
                            yoyo: true,
                            onComplete: () => rightArrow.setTint(this.colorArrow)
                        });

                    } else {

                        // unsuccessful click
                        rightTweenFail = this.scene.tweens.add({
                            targets: rightArrow,
                            angle: '+=20',
                            ease: 'power1',
                            duration: 30,
                            yoyo: true,
                            onComplete: () => {
                                rightTweenFail = this.scene.tweens.add({
                                    targets: rightArrow,
                                    angle: '-=20',
                                    ease: 'power1',
                                    duration: 30,
                                    yoyo: true,
                                    onComplete: () => {
                                        rightTweenFail = this.scene.tweens.add({
                                            targets: rightArrow,
                                            angle: '+=10',
                                            ease: 'power1',
                                            duration: 30,
                                            yoyo: true,
                                            onComplete: () => {
                                                rightTweenFail = this.scene.tweens.add({
                                                    targets: rightArrow,
                                                    angle: '-=10',
                                                    ease: 'power1',
                                                    duration: 30,
                                                    yoyo: true,
                                                    onComplete: () => rightArrow.setTint(this.colorArrow)
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            }, this);


        let leftTweenSucc;
        let leftTweenFail;
        let leftArrow = this.scene.add.image(70, bottom, 'arrow')
            .setInteractive()
            .setTint(this.colorArrow);

        leftArrow.on('pointerdown', function () {
            if (
                (typeof leftTweenSucc === 'undefined' || !leftTweenSucc.isPlaying()) &&
                (typeof leftTweenFail === 'undefined' || !leftTweenFail.isPlaying())
            ) {

                // color arrow red
                leftArrow.setTint(0xff0000);

                if (this.scrollTable(false)) {

                    // successful click
                    leftTweenSucc = this.scene.tweens.add({
                        targets: leftArrow,
                        x: '-=20',
                        ease: 'power2',
                        duration: 100,
                        yoyo: true,
                        onComplete: () => leftArrow.setTint(this.colorArrow)
                    });

                } else {

                    // unsuccessful click
                    leftTweenFail = this.scene.tweens.add({
                        targets: leftArrow,
                        angle: '+=20',
                        ease: 'power1',
                        duration: 30,
                        yoyo: true,
                        onComplete: () => {
                            leftTweenFail = this.scene.tweens.add({
                                targets: leftArrow,
                                angle: '-=20',
                                ease: 'power1',
                                duration: 30,
                                yoyo: true,
                                onComplete: () => {
                                    leftTweenFail = this.scene.tweens.add({
                                        targets: leftArrow,
                                        angle: '+=10',
                                        ease: 'power1',
                                        duration: 30,
                                        yoyo: true,
                                        onComplete: () => {
                                            leftTweenFail = this.scene.tweens.add({
                                                targets: leftArrow,
                                                angle: '-=10',
                                                ease: 'power1',
                                                duration: 30,
                                                yoyo: true,
                                                onComplete: () => leftArrow.setTint(this.colorArrow)
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }


        }, this);
    }
}


