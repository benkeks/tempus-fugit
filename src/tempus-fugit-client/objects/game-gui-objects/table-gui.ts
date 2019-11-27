import { GameState, GameStateListener } from "../game-objects/game-state";
import { Variable } from "../../temporal-logic/variable";
import {Game} from "../../mechanics/game";

const COLOR_PRIMARY = 0x0f3491;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e05;
const COLOR_RED = 0x9e0b00;
const COLOR_BUTTON = 0x008888;
const COLOR_PRIMARY_LIGHT = 0x00ff77;

/**
 * @author Mustafa
 */
export class TableGUI implements GameStateListener {
  private readonly scene: Phaser.Scene;
  private energyTable; // table for red dots representing energy
  private _gameState: GameState;
  private game:Game;

  private variableTable; // table object
  private readonly tableOffsetX: number; // x-position of table
  private readonly tableOffsetY: number; // y-position of table
  private readonly variableTableCellWidth = 90;
  private readonly variableTableCellHeight = 60;
  private readonly tableColumnCount = 15;
  private variables: { [name: string] : number} = {}; // dic for mapping variable names an their index

  constructor(
    scene: Phaser.Scene,
    game: Game,
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
    let items = [];
    for (let i = 0; i < itemCount; i++) {
      items.push({
        id: i
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
          COLOR_PRIMARY
        ),
        // table config
        table: {
          width: this.variableTableCellWidth * this.tableColumnCount,
          height: this.variableTableCellHeight * variables.length,
          cellWidth: this.variableTableCellWidth,
          cellHeight: this.variableTableCellHeight,
          columns: this.tableColumnCount,
          mask: {
            padding: 2
          }
        },
        createCellContainerCallback: function(cell) {
          const scene = cell.scene,
            width = cell.width,
            height = cell.height;

          return scene.rexUI.add.label({
            width: width,
            height: height,
            background: scene.rexUI.add
              .roundRectangle(0, 0, 20, 20, 0)
              .setStrokeStyle(2, COLOR_DARK),
            icon: scene.rexUI.add
              .roundRectangle(0, 0, 30, 30, 15, COLOR_PRIMARY)
              .setDepth(3),
            space: {
              left: 30
            }
          });
        }
      })
      .layout();

    // add items to table
    this.variableTable.setItems(items);

    // configure events
    this.variableTable
      .on(
        "cell.click",
        function(cellContainer, cellIndex) {
          const column = cellIndex % this.tableColumnCount
          const row =  Math.floor(cellIndex / this.tableColumnCount);
          const variableName  = Object.keys(this.variables).find(key => this.variables[key] === row);
          this._gameState.invertVariableUser(variableName, column);
        },
        this
      )
      .on("cell.over", function(cellContainer, cellIndex) {
        // focus current cell when hovering over it
        cellContainer
          .getElement("background")
          .setStrokeStyle(2, COLOR_LIGHT)
          .setDepth(1);
      })
      .on("cell.out", function(cellContainer, cellIndex) {
        cellContainer
          .getElement("background")
          .setStrokeStyle(2, COLOR_DARK)
          .setDepth(0);
      });

    // table for variable names;
    // @ts-ignore
    let variableNameTable = this.scene.rexUI.add
      .gridTable({
        x: 280,
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
        createCellContainerCallback: function(cell) {
          const scene = cell.scene,
            width = cell.width,
            height = cell.height;
          return scene.rexUI.add.label({
            width: width,
            height: height,
            background: scene.rexUI.add
              .roundRectangle(0, 0, 20, 20, 0)
              .setStrokeStyle(2, COLOR_DARK),
            text: scene.add.text(0, 0, "  " + variables[cell.index], {
              fontSize: 24
            })
          });
        }
      })
      .layout();

    // add items to table
    items = [];
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
    offsetX: number = 490,
    offsetY: number = 40
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
        createCellContainerCallback: function(cell) {
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
  private createButton(offsetX: number = 400, offsetY: number = 40): void {
    // @ts-ignore
    let buttons = this.scene.rexUI.add
      .buttons({
        x: offsetX,
        y: offsetY + Object.keys(this._gameState.variables).length * this.variableTableCellHeight * 0.5 + this.tableOffsetY,
        orientation: "y",
        buttons: [
          // @ts-ignore
          this.scene.rexUI.add.label({
            width: 100,
            height: 40,
            // @ts-ignore
            background: this.scene.rexUI.add.roundRectangle(
              0,
              0,
              120,
              60,
              10,
              COLOR_BUTTON
            ),
            text: this.scene.add.text(0, 0, "next", {
              fontSize: 18
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
      function(button, index, pointer, event) {
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
    const tableIndex = column + row * this.tableColumnCount;
    const icon = this.variableTable
      .getElement("table")
      .getCell(tableIndex)
      .getContainer()
      .getElement("icon");
    const background = this.variableTable
      .getElement("table")
      .getCell(tableIndex)
      .getContainer()
      .getElement("background");

    background.setFillStyle(color, 0.25);
    if (icon.fillColor == COLOR_PRIMARY) icon.setFillStyle(color, 0);
  }

  /**
   * change icon color of table cell
   * @param color: color to change icon to
   * @param column: position of cell
   * @param row: position of cell
   */
  private setCellIconColor(color: number, column: number, row: number): void {
    const tableIndex = column + row * this.tableColumnCount;
    const icon = this.variableTable
      .getElement("table")
      .getCell(tableIndex)
      .getContainer()
      .getElement("icon");
    if (color == COLOR_PRIMARY) {
      icon.setFillStyle(color, 0);
    } else {
      icon.setFillStyle(color, 1);
    }
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

  roundChanged(gameSate: GameState, lastRound: number, activeRound:number): void {
    // change color of coloumn
    const nextRound = activeRound;
    const variables  = Object.keys(this._gameState.variables);
    for (let index in variables) {
      this.setCellColor(COLOR_PRIMARY_LIGHT, nextRound , parseInt(index));
      if (lastRound >= 0) this.setCellColor(COLOR_PRIMARY, lastRound , parseInt(index));
    }

    this.createEnergyTable(this.gameState.maxEnergy);
  }

  variableChanged(gameState: GameState, oldVariable: Variable, variable: Variable, valueChanges: { [p: number]: boolean }): void {

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

  energyChanged(gameState: GameState, oldEnergy: number, newEnergy: number, oldMaxEnergy: number, newMaxEnergy: number): void {
    // only changes one energy
   if (oldEnergy > newEnergy) {
     this.setEnergyIconColor( 0x000000, newEnergy);
   }else {
     this.setEnergyIconColor( COLOR_RED, newEnergy-1);
   }
  }
}

