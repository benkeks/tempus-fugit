import { GameState, GameStateListener } from "../game-objects/game-state";
import { Variable } from "../../temporal-logic/variable";

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
  private gameState: GameState;

  private variableTable; // table object
  private readonly tableOffsetX: number; // x-position of table
  private readonly tableOffsetY: number; // y-position of table
  private readonly variableTableCellWidth = 90;
  private readonly variableTableCellHeight = 60;
  private readonly tableColumnCount = 15;

  constructor(
    scene: Phaser.Scene,
    gameState: GameState,
    tableOffsetX: number = 1000,
    tableOffsetY: number = 140
  ) {
    this.scene = scene;
    this.tableOffsetX = tableOffsetX;
    this.tableOffsetY = tableOffsetY;
    this.gameState = gameState;
    this.createEnergyTable(0); // TODO: use energy count form gameState
    this.createVariableTable([]); // TODO: use variables names from gameState
    this.createButton();
  }

  /**
   * creates a new table at position (x,y)
   * @param variables: list of variables in table
   */
  private createVariableTable(
    variables: Variable[]
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
          // TODO: alert gameState that cell was clicked
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
              //TODO: change variables[cell.index] to variables[cell.index].representation ? ask gameState person where variable names are
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
        y: offsetY + 290, // TODO: replace with offsetY + this.gameState.variables.length * this.variableTableCellHeight * 0.5 + this.tableOffsetY ? ask gameState person how variables are stored
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
        y: offsetY + 260, // TODO: replace with offsetY + this.gameState.variables.length * this.variableTableCellHeight * 0.5 + this.tableOffsetY ? ask gameState person how variables are stored
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
            text: this.scene.add.text(0, 0, "Auswertung", {
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

  roundChanged(gameSate: GameState, lastRound: number): void {
    // change color of coloumn
    const nextRound = 0;  // TODO: The new Round Value can be accessed in gameState ??
    const variables  = []; /// TODO: need function to get variable names
    for (let index in variables) {
      this.setCellColor(COLOR_PRIMARY_LIGHT, nextRound , parseInt(index));
      this.setCellColor(COLOR_PRIMARY, lastRound , parseInt(index));
    }
  }

  variableChanged(
    gameState: GameState,
    oldVariable: Variable,
    variable: Variable,
    valueChanges: { [p: number]: [boolean, boolean] }
  ): void {

    const row = 0; //TODO: gameState.round ??
    const column = 0; //TODO: gameState.variables.indexOf(variable) ??
    const energy = 0; //TODO: gameState.energy ??
    const newValue = true; // TODO: if value of varialbe changes to true
    if (newValue) {
      this.setCellIconColor(COLOR_RED, row, column);
      this.setEnergyIconColor( 0x000000, energy);
    } else {
      this.setCellIconColor(COLOR_PRIMARY, row, column);
      this.setEnergyIconColor( COLOR_RED,energy-1);
    }
  }
}

