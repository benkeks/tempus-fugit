import { GameState, GameStateListener } from "../game-objects/game-state";
import { Variable } from "../../temporal-logic/variable";
import { Mission } from "../../mechanics/mission";
import { thisExpression } from "@babel/types";

const COLOR_PRIMARY = 0x2a4f16;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e05;
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
    private readonly variableTableCellWidth = 90;
    private readonly variableTableCellHeight = 60;
    private readonly initialColumnCount = 20; // number of visible columns
    private tableColumnCount = 20; // total number of columns
    private variables: { [name: string]: number } = {}; // dic for mapping variable names an their index
    private mapping: { [char: string]: { frame: number } } = {}; // mapping from rune name to frame in sprite sheet
    private tableItems;
    private overlay: Phaser.GameObjects.Rectangle;
    private outline: Phaser.GameObjects.Graphics;
    private scrollCount = 0;
    private energyTexture: string;

    constructor(
        scene: Phaser.Scene,
        game: Mission,
        energyTexture: string = "energyFont"
    ) {
        this.scene = scene;
        this.gameState = game.gameState;
        this.game = game;
        this.energyTexture = energyTexture;

        // let i = 0;
        // for (let key in this.gameState.variables)
        //     this.variables[key] = i++;

        this.variables = {
            n: 0,
            t: 1,
        }

        // mapping of rune names fo frame in sprite
        this.mapping.n = { frame: 0 };
        this.mapping.s = { frame: 1 };
        this.mapping.l = { frame: 2 };
        this.mapping.t = { frame: 3 };

        this.createVariableTable();
        this.createEnergyTable(this.gameState.energy);
        this.createButton();
        this.roundChanged(this.gameState, -1, this.gameState.activeState);
        this.setUpScrollingArrows();
    }

    /**
     * creates a new game state table 
     * @param paddingLeft : distance from left side of table to left edge of screen 
     * @param paddingTop : distance from top side of table to top edge of screen 
     */

    private createVariableTable(paddingLeft: number = 10, paddingTop: number = 10, ): void {
        const numVar = Object.keys(this.variables).length;
        const itemCount = this.initialColumnCount * numVar;
        const energyTexture = this.energyTexture;
        // items in table
        this.tableItems = [];
        for (let i = 0; i < itemCount; i++) {
            this.tableItems.push({
                id: i,
                iconAlpha: 0,
                backgroundColor: COLOR_PRIMARY,
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
                    COLOR_PRIMARY,
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
                            .setStrokeStyle(2, COLOR_DARK),
                        icon: scene.add.image(0, 0, energyTexture).setAlpha(item.iconAlpha).setDepth(5),
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
                    const column = Math.floor(cellIndex / numVar);
                    const row = cellIndex % numVar;
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


        // table for variable names
        const self = this;
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
                    COLOR_PRIMARY
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
                    return scene.rexUI.add.label({
                        width: width,
                        height: height,
                        background: scene.rexUI.add
                            .roundRectangle(0, 0, 20, 20, 0)
                            .setStrokeStyle(2, COLOR_DARK),
                        icon: scene.add.sprite(0, 0, "runes", self.mapping[variable].frame),
                        space: {
                            left: 30
                        }
                    });
                }
            })
            .layout();

        // add items to table
        let items = [];
        for (let i = 0; i < numVar; i++) {
            items.push({
                id: i,
                variable: Object.keys(this.variables).find(key => this.variables[key] === i)
            });
        }
        variableNameTable.setItems(items);
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
        // destroy old table if available
        if (this.energyTable) {
            this.energyTable.destroy();
        }

        const cellWidth = 40;
        const cellHeight = 30;
        const bottom = this.variableTable.bottom + 30;
        const energyTexture = this.energyTexture;
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
                        icon: scene.add.image(0, 0, energyTexture)
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

    private createButton(x: number = 1800, y: number = 670): void {
        // @ts-ignore
        let buttons = this.scene.rexUI.add
            .buttons({
                x: x,
                y: y,
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
        let cell = this.tableItems[column * Object.keys(this.variables).length + row];
        cell.backgroundColor = color;
        cell.backgroundAlpha = 0.25;
        if (cell.iconColor == COLOR_PRIMARY) {
            cell.iconColor = color;
            cell.iconAlpha = 0;
        }
        this.variableTable.getElement('table').updateTable(true);
    }

    /**
     * adds rune to cell with given column and row if visible is true, else clears cell
     * @param visible: true if rune in cell should be set
     * @param column: position of cell
     * @param row: position of cell
     */
    private toggleRune(visible: boolean, column: number, row: number): void {
        const index = column * Object.keys(this.variables).length + row;
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
        if (activeRound >= this.tableColumnCount - 1) {
            this.addColumns(30);
        }

        // change color of coloumn
        const nextRound = activeRound;
        //const variables = Object.keys(this._gameState.variables);
        const variables = Object.keys(this.variables);
        for (let index in variables) {
            this.setCellColor(COLOR_PRIMARY_LIGHT, nextRound, parseInt(index));
            if (lastRound >= 0) this.setCellColor(COLOR_PRIMARY, lastRound, parseInt(index));
        }

        this.createEnergyTable(this.gameState.maxEnergy);

        // move table to the right if last visible column is reached
        if (activeRound >= 20)
            this.scrollTable(true);
    }

    addColumns(n: number) {
        const numVar = Object.keys(this.variables).length;
        const itemCount = n * numVar;
        for (let i = 0; i < itemCount; i++) {
            this.tableItems.push({
                id: this.tableColumnCount * numVar + i,
                iconAlpha: 0,
                backgroundColor: COLOR_PRIMARY,
                backgroundAlpha: 0
            });
        }
        this.tableColumnCount += n;
        this.variableTable.setItems(this.tableItems);
    }

    async variableChanged(gameState: GameState, oldVariable: Variable, variable: Variable, valueChanges: { [p: number]: boolean }) {
        for (let key in valueChanges) {
            const row = parseInt(key);
            const column = this.variables[variable.representation];
            const newValue = valueChanges[key];
            this.toggleRune(newValue, row, column);
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
        if (gameState.active) {
            if (this.overlay)
                this.overlay.destroy();
            this.toggleOutline(true);
        } else {
            this.toggleOutline(false);
            const left = this.variableTable.left - this.variableTableCellWidth;
            const top = this.variableTable.top;
            const width = this.variableTable.width + this.variableTableCellWidth;
            const height = this.variableTable.height;
            this.overlay = this.scene.add.rectangle(left, top, width, height, 0x000000, 0.5)
                .setDepth(100).setOrigin(0, 0);
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
        let bottom = this.variableTable.bottom + 30;

        // arrows for scrolling, 
        let rightTweenSucc;
        let rightTweenFail;
        let rightArrow = this.scene.add.image(150, bottom, 'arrow').setAngle(180);
        rightArrow.setTint(0x00008b);
        // TODO ARROW COLORS

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
        let leftArrow = this.scene.add.image(70, bottom, 'arrow');
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
                            duration: 100,
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


