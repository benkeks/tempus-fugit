import { GameState, GameStateListener } from "../game-objects/game-state";
import { Variable } from "../../temporal-logic/variable";
import { Mission } from "../../mechanics/mission";
import { thisExpression } from "@babel/types";

const COLOR_PRIMARY = 0x2a4f16;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e05;
const COLOR_RED = 0x9e0b00;
const COLOR_BUTTON = 0x666666;
const COLOR_PRIMARY_LIGHT = 0x00ff77;

/**
 * @author Mustafa
 */
export class TableGUI implements GameStateListener {
    private readonly scene: Phaser.Scene;
    private energyTable; // table for red dots representing energy
    private _gameState: GameState;
    private game: Mission;

    private variableTable; // table object
    private readonly tableOffsetX: number; // x-position of table
    private readonly tableOffsetY: number; // y-position of table
    private readonly variableTableCellWidth = 90;
    private readonly variableTableCellHeight = 60;
    private tableColumnCount = 30;
    private variables: { [name: string]: number } = {}; // dic for mapping variable names an their index
    //private mapping: { [char: string]: { frame: number } } = {}; // mapping from rune name to frame in sprite sheet
    private tableItems;
    private overlay: Phaser.GameObjects.Rectangle;
    private outline: Phaser.GameObjects.Graphics;
    private scrollCount = 0;

    constructor(
        scene: Phaser.Scene,
        game: Mission,
        tableOffsetX: number = 1000,
        tableOffsetY: number = 140
    ) {
        this.scene = scene;
        this.tableOffsetX = tableOffsetX;
        this.tableOffsetY = tableOffsetY;
        this.gameState = game.gameState;
        this.game = game;

        this.createEnergyTable(this.gameState.energy);
        let i = 0;
        for (let key in this.gameState.variables)
            this.variables[key] = i++;

        this.createVariableTable(Object.keys(this.variables));
        this.createButton();
        this.roundChanged(this.gameState, -1, this.gameState.activeState);

        // this.mapping["n"] = { frame: 0 };
        // this.mapping["s"] = { frame: 1 };
        // this.mapping["l"] = { frame: 2 };
        // this.mapping["t"] = { frame: 3 };

        this.setUpScrollingArrows();
    }

    /**
     * creates a new table at position (x,y)
     * @param variables: list of variables in table
     */
    private createVariableTable(
        variables: string[]
    ): void {
        // items in table
        const itemCount = this.tableColumnCount * variables.length;
        this.tableItems = [];
        for (let i = 0; i < itemCount; i++) {
            this.tableItems.push({
                id: i,
                iconColor: COLOR_PRIMARY,
                iconAlpha: 0,
                backgroundColor: COLOR_PRIMARY,
                backgroundAlpha: 0
            });
        }

        // table for variable boolean values
        // @ts-ignore
        this.variableTable = this.scene.rexUI.add
            .gridTable({
                x: this.tableOffsetX,
                y: this.tableOffsetY,
                // @ts-ignore
                background: this.scene.rexUI.add.roundRectangle(
                    0,
                    0,
                    20,
                    10,
                    10,
                    COLOR_PRIMARY,
                    0.3
                ),
                scroller: false,
                scrollMode: 1,
                // table config
                table: {
                    width: this.variableTableCellWidth * 20,//this.tableColumnCount,
                    height: this.variableTableCellHeight * variables.length,
                    cellWidth: this.variableTableCellWidth,
                    cellHeight: this.variableTableCellHeight,
                    //columns: this.tableColumnCount,
                    columns: 4,
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
                            .setStrokeStyle(2, COLOR_DARK),
                        icon: scene.rexUI.add
                            .roundRectangle(0, 0, 30, 30, 15, item.iconColor, item.iconAlpha)
                            .setDepth(3),
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
                    const column = Math.floor(cellIndex / 4);
                    const row = cellIndex % 4;
                    const variableName = Object.keys(this.variables).find(key => this.variables[key] === row);
                    this._gameState.invertVariableUser(variableName, column);
                },
                this
            )
            .on("cell.over", function (cellContainer, cellIndex) {
                // focus current cell when hovering over it
                cellContainer
                    .getElement("background")
                    .setStrokeStyle(2, COLOR_LIGHT)
                    .setDepth(1);
            })
            .on("cell.out", function (cellContainer, cellIndex) {
                cellContainer
                    .getElement("background")
                    .setStrokeStyle(2, COLOR_DARK)
                    .setDepth(0);
            });

        // table for variable names;
        // @ts-ignore
        let variableNameTable = this.scene.rexUI.add
            .gridTable({
                x: 55,
                y: this.tableOffsetY,
                // @ts-ignore
                background: this.scene.rexUI.add.roundRectangle(
                    0,
                    0,
                    20,
                    10,
                    10,
                    COLOR_PRIMARY
                ),
                scroller: false,
                // table config
                table: {
                    width: this.variableTableCellWidth,
                    height: this.variableTableCellHeight * variables.length,
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
                        height = cell.height;
                    return scene.rexUI.add.label({
                        width: width,
                        height: height,
                        background: scene.rexUI.add
                            .roundRectangle(0, 0, 20, 20, 0)
                            .setStrokeStyle(2, COLOR_DARK),
                        // text: scene.add.text(0, 0, "  " + variables[cell.index], {
                        //     fontSize: 24
                        // })
                    });
                }
            })
            .layout();

        // n -> frame 0
        // s -> frame 1
        // l -> frame 2
        // t -> frame3
        // show rune picture depending on variable names
        let x = 50;
        let y = 50;
        let frame = 0;
        for (let v of variables) {
            switch (v) {
                case "n":
                    frame = 0;
                    break;
                case "s":
                    frame = 1;
                    break;
                case "l":
                    frame = 2;
                    break;
                case "t":
                    frame = 3;
                    break;
            }
            this.scene.add.sprite(x, y, "runes", frame);
            y += 60;

        }
        // add items to table
        let items = [];
        for (let i = 0; i < variables.length; i++) {
            items.push({
                id: i
            });
        }
        variableNameTable.setItems(items);
    }

    /**
     * creates a new energy table
     * @param energyCount: number of energy dots
     * @param offsetX : (optional with a default value) x position of table
     * @param offsetY: (optional with a default value) y position of table
     */
    createEnergyTable(
        energyCount: number,
        offsetX: number = 230,
        offsetY: number = 55
    ): void {
        // destroy old table if available
        if (this.energyTable) {
            this.energyTable.destroy();
        }

        const cellWidth = 40;
        const cellHeight = 30;

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
                x: offsetX + energyCount * cellWidth * 0.5,
                y: offsetY + Object.keys(this._gameState.variables).length * this.variableTableCellHeight * 0.5 + this.tableOffsetY,
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
                        icon: scene.rexUI.add.roundRectangle(0, 0, 30, 30, 15, COLOR_RED)
                    });
                }
            })
            .layout();

        // add items to table
        this.energyTable.setItems(items);
    }

    /**
     *  creates for button for ending selection of boolean values
     */
    private createButton(offsetX: number = 1800, offsetY: number = 670): void {
        // @ts-ignore
        let buttons = this.scene.rexUI.add
            .buttons({
                x: offsetX,
                y: offsetY + Object.keys(this._gameState.variables).length * this.variableTableCellHeight * 0.5 + this.tableOffsetY,
                orientation: "y",
                buttons: [
                    // @ts-ignore
                    this.scene.rexUI.add.label({
                        width: 150,
                        height: 280,
                        // @ts-ignore
                        background: this.scene.rexUI.add.roundRectangle(
                            0,
                            0,
                            120,
                            60,
                            10,
                            COLOR_BUTTON
                        ),
                        text: this.scene.add.text(80, 0, "  Next", {
                            fontSize: 30,
                            fontStyle: 'bold',
                            fontFamily: 'appleKid',
                            color: '#FFFFFF'
                        }),
                        space: {
                            left: 10,
                            right: 10
                        }
                    })
                ]
            })
            .layout();

        buttons.on(
            "button.click",
            function (button, index, pointer, event) {
                // TODO: alert game State that button was clicked
                //this._gameState.changeRound();
                console.log('changes round after click');
                this.game.nextPhase();
            },
            this
        );
    }

    /**
     * change background color of table cell
     * @param color: color to change background to
     * @param column: position of cell
     * @param row: position of cell
     */
    private setCellColor(color: number, column: number, row: number): void {
        let cell = this.tableItems[column * 4 + row];
        cell.backgroundColor = color;
        cell.backgroundAlpha = 0.25;
        if (cell.iconColor == COLOR_PRIMARY) {
            cell.iconColor = color;
            cell.iconAlpha = 0;
        }
        this.variableTable.getElement('table').updateTable(true);
    }

    /**
     * change icon color of table cell
     * @param color: color to change icon to
     * @param column: position of cell
     * @param row: position of cell
     */
    private setCellIconColor(color: number, column: number, row: number): void {
        let cell = this.tableItems[column * 4 + row];
        cell.iconColor = color;
        if (color == COLOR_PRIMARY) {
            cell.iconAlpha = 0;
        } else {
            cell.iconAlpha = 1;
        }
        this.variableTable.getElement('table').updateTable(true);
    }

    /**
     * change color of energy table at index
     * @param color: color to change energy cell to
     * @param index: position of cell
     */
    private setEnergyIconColor(color: number, index: number) {
        this.energyTable
            .getElement("table")
            .getCell(index)
            .getContainer()
            .getElement("icon")
            .setFillStyle(color, 1);
    }

    get gameState(): GameState {
        return this._gameState;
    }

    set gameState(value: GameState) {
        this._gameState = value;
        value.listener.push(this);
    }

    async roundChanged(gameSate: GameState, lastRound: number, activeRound: number) {
        // change color of coloumn
        const nextRound = activeRound;
        const variables = Object.keys(this._gameState.variables);
        for (let index in variables) {
            this.setCellColor(COLOR_PRIMARY_LIGHT, nextRound, parseInt(index));
            if (lastRound >= 0) this.setCellColor(COLOR_PRIMARY, lastRound, parseInt(index));
        }

        this.createEnergyTable(this.gameState.maxEnergy);

        // move table to the right if last visible column is reached
        if (activeRound >= 20)
            this.scrollTable(true);

        // add 30 more columns if end of table is reached
        if (activeRound == this.tableColumnCount - 1) {
            let itemCount = 30 * variables.length;
            for (let i = 0; i < itemCount; i++) {
                this.tableItems.push({
                    id: this.tableColumnCount * variables.length + i,
                    iconColor: COLOR_PRIMARY,
                    iconAlpha: 0,
                    backgroundColor: COLOR_PRIMARY,
                    backgroundAlpha: 0
                });
            }
            this.tableColumnCount += 30;
            this.variableTable.setItems(this.tableItems);
        }
    }

    async variableChanged(gameState: GameState, oldVariable: Variable, variable: Variable, valueChanges: { [p: number]: boolean }) {
        for (let key in valueChanges) {
            const row = parseInt(key);
            const column = this.variables[variable.representation];
            const newValue = valueChanges[key]
            if (newValue) {
                this.setCellIconColor(COLOR_RED, row, column);
            } else {
                this.setCellIconColor(COLOR_PRIMARY, row, column);
            }
        }
    }

    async energyChanged(gameState: GameState, oldEnergy: number, newEnergy: number, oldMaxEnergy: number, newMaxEnergy: number) {
        // only changes one energy
        if (oldEnergy > newEnergy) {
            this.setEnergyIconColor(0x000000, newEnergy);
        } else {
            this.setEnergyIconColor(COLOR_RED, newEnergy - 1);
        }
    }

    async activated(gameState: GameState) {
        if (gameState.active) {
            if (this.overlay)
                this.overlay.destroy();
            this.toggleOutline(true);
        } else {
            this.toggleOutline(false);
            this.overlay = this.scene.add.rectangle(this.tableOffsetX - 45, this.tableOffsetY, this.variableTableCellWidth * 21, this.variableTableCellHeight * 4, 0x000000, 0.5).setDepth(100);
        }
    }

    /**
     * toggles golden outline of game state table
     * @param visible: true if outline should be shown 
     */
    toggleOutline(visible: boolean) {
        if (!this.outline) {
            let left = this.variableTable.left - this.variableTableCellWidth;
            let right = this.variableTable.right;
            let top = this.variableTable.top;
            let bottom = this.variableTable.bottom;
            let graphics = this.scene.add.graphics();
            graphics.lineGradientStyle(5, 0xffff00, 0xffea00, 0xffff1a, 0xffff00, 1);
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


    setUpScrollingArrows() {
        // arrows for scrolling, 
        let rightTweenSucc;
        let rightTweenFail;
        let rightArrow = this.scene.add.image(1600, 290, 'arrow-right');
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
                            duration: 150,
                            yoyo: true,
                            onComplete: () => rightArrow.clearTint()
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
                                                    onComplete: () => rightArrow.clearTint()
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
        let leftArrow = this.scene.add.image(1500, 290, 'arrow-left');
        leftArrow.setInteractive()
            .on('pointerdown', function () {
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
                            duration: 150,
                            yoyo: true,
                            onComplete: () => leftArrow.clearTint()
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
                                                    onComplete: () => leftArrow.clearTint()
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


