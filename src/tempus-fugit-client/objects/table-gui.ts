// For some reason i can load the plugin (rexUI; loaded in game config) but not reference it without a ts-ignore.
// This may be the case because the plugin doesn't have type definitions, but i set noImplicitAny to false in the tsconfig file,
// so there really should'nt be a problem here.
// Other ways of loading the plugin have the same problem.
// console.log(this) will show the plugin is installed, but this.rexUI yields an error; weird !

const COLOR_PRIMARY = 0x0f3491;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e05;
const COLOR_RED = 0x9e0b00;
const COLOR_BUTTON = 0x008888;

export class TableGUI {
  private readonly x: number; // x-position of table
  private readonly y: number; // y-position of table
  private readonly scene: Phaser.Scene;
  private _booleanValues: boolean[]; // boolean values of variables, initially false
  private table;    // table object
  private energy: number; // number of energy for current round
  private energyTable; // table for red dots representing energy
  private round: number; // current round

  constructor(scene: Phaser.Scene, energy: number, x: number = 1000, y: number = 140) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.setEnergy(energy);
    this.createTable();
    this.createButton();
    this.round = 1;
  }

    /**
     * creates a new table at position (x,y) with 60 cells
     */
  private createTable():void {
    // cell width, height, and number
    let itemCount = 60;
    let cellWidth = 90;
    let cellHeight = 60;

    // boolean values of variables
    this._booleanValues = new Array(itemCount).fill(false);

    // items in table
    let items = [];
    for (let i = 0; i < itemCount; i++) {
      items.push({
        id: i,
        text: "false"
      });
    }

    // table for boolean values of variables
    // @ts-ignore
    this.table = this.scene.rexUI.add
      .gridTable({
        x: this.x,
        y: this.y,
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
          width: cellWidth * 15,
          height: cellHeight * 4,
          cellWidth: cellWidth,
          cellHeight: cellHeight,
          columns: 15,
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
            icon: scene.rexUI.add.roundRectangle(
              0,
              0,
              30,
              30,
              15,
              COLOR_PRIMARY
            ),
            space: {
              left: 30
            }
          });
        }
      })
      .layout();

    // add items to table
      this.table.setItems(items);

    // configure events
      this.table
      .on(
        "cell.click",
        function(cellContainer, cellIndex) {
          // change boolean value, icon color of cell and available energy when clicked
          // check if energy is available and round is correct
              if (cellIndex == this.round -1 || cellIndex == this.round + 14  || cellIndex == this.round + 29  || cellIndex == this.round + 44) {
                  if (this._booleanValues[cellIndex]) {
                      this._booleanValues[cellIndex] = false;
                      cellContainer.getElement("icon").setFillStyle(COLOR_PRIMARY, 1);
                      this.energyTable.getElement('table').getCell(this.energy).getContainer().getElement("icon").setFillStyle(COLOR_RED, 1);
                      this.energy++;

                  } else if (this.energy > 0) {
                      this._booleanValues[cellIndex] = true;
                      cellContainer.getElement("icon").setFillStyle(COLOR_RED, 1);
                      this.energy--;
                      this.energyTable.getElement('table').getCell(this.energy).getContainer().getElement("icon").setFillStyle(0x000000, 1);
                  }
              }
        },
        this
      )
      .on("cell.over", function(cellContainer, cellIndex) { // focus current cell when hovering over it
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



      // Table for variable names;
        // @ts-ignore
        let variableTable = this.scene.rexUI.add
            .gridTable({
                x: 280,
                y: this.y,
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
                    width: cellWidth,
                    height: cellHeight * 4,
                    cellWidth: cellWidth,
                    cellHeight: cellHeight,
                    columns: 1,
                    mask: {
                        padding: 2
                    }
                },
                createCellContainerCallback: function(cell) {
                    const scene = cell.scene,
                        width = cell.width,
                        height = cell.height;
                    let names =  ['A', 'B', 'C', 'D'];
                    return scene.rexUI.add.label({
                        width: width,
                        height: height,
                        background: scene.rexUI.add
                            .roundRectangle(0, 0, 20, 20, 0)
                            .setStrokeStyle(2, COLOR_DARK),
                        text: scene.add.text(0, 0, '  ' + names[cell.index], {
                            fontSize: 24
                        }),
                    });
                }
            })
            .layout();

        // add items to table
        let variableNames = [{id: 1, text: "A"},  {id: 2, text: "B"}, {id: 3, text: "C"}, {id: 4, text: "D"}];
        variableTable.setItems(variableNames);


  }

    /**
     * creates a new energy table
     * @param itemCount: energy count; number of red-dots
     */
  setEnergy(itemCount: number): void {
      // destroy old table if available
      if (this.energyTable) {
          this.energyTable.destroy();
      }

      let cellWidth = 40;
      let cellHeight = 30;
      this.energy = itemCount;

      // items in table
        let items = [];
        for (let i = 0; i < itemCount; i++) {
            items.push({
                id: i
            });
        }

        // @ts-ignore
        this.energyTable = this.scene.rexUI.add
            .gridTable({
                x: 550,
                y: 300,
                // table config
                table: {
                    width: cellWidth * itemCount ,
                    height: cellHeight,
                    cellWidth: cellWidth,
                    cellHeight: cellHeight,
                    columns: itemCount,
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
                        icon: scene.rexUI.add.roundRectangle(
                            0,
                            0,
                            30,
                            30,
                            15,
                            COLOR_RED
                        )
                    });
                }
            })
            .layout();

        // add items to table
        this.energyTable.setItems(items);
    }


    /**
     * creates for button for ending selection of boolean values
     */
    private createButton(): void {
        // @ts-ignore
        let buttons = this.scene.rexUI.add.buttons({
            x: 400,
            y: 300,
            orientation: 'y',
            buttons: [
                // @ts-ignore
                this.scene.rexUI.add.label({
                    width: 100,
                    height: 40,
                    // @ts-ignore
                    background: this.scene.rexUI.add.roundRectangle(0, 0, 120, 60, 10, COLOR_BUTTON),
                    text: this.scene.add.text(0, 0, 'Auswertung', {
                        fontSize: 18
                    }),
                    space: {
                        left: 10,
                        right: 10,
                    }
                })
            ],

        })
            .layout()

        buttons
            .on('button.click', function (button, index, pointer, event) {
                this.round ++;
                // TODO: button was clicked, begin next phase ??
                console.log('Belegungen: ', this._booleanValues);
            }, this);
    }

  get booleanValues(): boolean[] {
    return this._booleanValues;
  }

}
