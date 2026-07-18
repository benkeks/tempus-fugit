import { GameState, GameStateListener } from "../game-objects/game-state";
import { Variable } from "../../temporal-logic/variable";
import { Mission } from "../../mechanics/mission";
import { ListGUI } from "./list-gui";

type PendingEnergyKind = "none" | "spend" | "refund";

type PendingEnergyLink = {
    kind: PendingEnergyKind;
    index: number | null;
};

type RuneAnimationSource = {
    x: number;
    y: number;
};

const NO_PENDING_ENERGY: PendingEnergyLink = { kind: "none", index: null };

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
    private get variableByIndex(): {[ index: number ] : string } {
        const dict = {}
        for (const [varName, index] of Object.entries(this.variables)) {
            dict[index] = varName
        }
        return dict
    }
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

    private leftArrow!: Phaser.GameObjects.Image;
    private rightArrow!: Phaser.GameObjects.Image;
    private isScrolling = false;
    private activeCellAnimations: Map<string, () => void> = new Map();
    private activeEnergyAnimations: Map<number, () => void> = new Map();
    private pendingSpendEnergyIndex: number | null = null;
    private pendingRefundEnergyIndex: number | null = null;
    private pendingEnergyLinkClearTimer: Phaser.Time.TimerEvent | null = null;
    private pendingCardRuneSource: RuneAnimationSource | null = null;
    private pendingCardRuneSourceClearTimer: Phaser.Time.TimerEvent | null = null;
    private hoveredVariableCellIndex: number | null = null;

    private isDestroyed = false;

    private getVariableCount(): number {
        return Object.keys(this.variables).length;
    }

    private getVariableNameForRow(row: number): string | null {
        return this.variableByIndex[row] ?? null;
    }

    private isCellChangeableNow(column: number, row: number): boolean {
        if (this.isDestroyed) return false;
        if (!this.gameState.active) return false;
        if (column !== this.gameState.activeState) return false;

        const variableName = this.getVariableNameForRow(row);
        if (!variableName) return false;

        const variableStatus = this.gameState.getVariableStatus(variableName);
        if (variableStatus.isBlocked(column)) return false;

        const hasUserChanged = Boolean(variableStatus.userChanged[column]);
        if (!hasUserChanged) return this.gameState.energy > 0;
        return this.gameState.energy < this.gameState.maxEnergy;
    }

    private applyVariableCellHoverVisual(cellContainer: any, cellIndex: number): void {
        const numVar = this.getVariableCount();
        if (numVar <= 0) return;

        const column = Math.floor(cellIndex / numVar);
        const row = cellIndex % numVar;
        const canChange = this.isCellChangeableNow(column, row);

        cellContainer
            .getElement("background")
            .setStrokeStyle(4, canChange ? this.colorCellOver : this.colorCellEdge)
            .setDepth(canChange ? 2 : 0);
    }

    private refreshHoveredVariableCellVisual(): void {
        if (this.hoveredVariableCellIndex === null) return;
        if (!this.isVariableTableReady()) return;

        const cell = this.variableTable.getElement("table").getCell(this.hoveredVariableCellIndex);
        if (!cell) return;

        const cellContainer = cell.getContainer();
        if (!cellContainer) return;

        this.applyVariableCellHoverVisual(cellContainer, this.hoveredVariableCellIndex);
    }

    private getCellAnimationKey(row: number, variableIndex: number): string {
        return `${row}:${variableIndex}`;
    }

    private abortConflictingAnimations(row: number, variableIndex: number, energyIndex: number | null): void {
        const cancels: Array<() => void> = [];
        const cellCancel = this.activeCellAnimations.get(this.getCellAnimationKey(row, variableIndex));
        if (cellCancel) cancels.push(cellCancel);
        if (energyIndex !== null) {
            const energyCancel = this.activeEnergyAnimations.get(energyIndex);
            if (energyCancel && energyCancel !== cellCancel) cancels.push(energyCancel);
        }

        cancels.forEach(cancel => cancel());
    }

    private startConflictAwareAnimation(
        row: number,
        variableIndex: number,
        energyIndex: number | null,
        run: (done: () => void) => () => void,
        onDone: () => void,
    ): void {
        this.abortConflictingAnimations(row, variableIndex, energyIndex);

        const cellKey = this.getCellAnimationKey(row, variableIndex);
        let finished = false;
        let internalCancel: (() => void) | null = null;

        const done = () => {
            if (finished) return;
            finished = true;
            if (this.activeCellAnimations.get(cellKey) === wrappedCancel) this.activeCellAnimations.delete(cellKey);
            if (energyIndex !== null && this.activeEnergyAnimations.get(energyIndex) === wrappedCancel) this.activeEnergyAnimations.delete(energyIndex);
            onDone();
        };

        const wrappedCancel = () => {
            if (finished) return;
            finished = true;
            if (internalCancel) internalCancel();
            if (this.activeCellAnimations.get(cellKey) === wrappedCancel) this.activeCellAnimations.delete(cellKey);
            if (energyIndex !== null && this.activeEnergyAnimations.get(energyIndex) === wrappedCancel) this.activeEnergyAnimations.delete(energyIndex);
        };

        internalCancel = run(done);
        this.activeCellAnimations.set(cellKey, wrappedCancel);
        if (energyIndex !== null) this.activeEnergyAnimations.set(energyIndex, wrappedCancel);
    }

    private getTableIconCenter(icon: Phaser.GameObjects.GameObject): { x: number; y: number } | null {
        if (!icon || !(icon as any).scene) return null;
        const bounds = (icon as any).getBounds?.();
        if (!bounds) return null;
        return { x: bounds.centerX, y: bounds.centerY };
    }

    private getEnergyIcon(index: number): Phaser.GameObjects.GameObject | null {
        if (!this.isEnergyTableReady() || index < 0) return null;
        const cell = this.energyTable.getElement("table").getCell(index);
        if (!cell) return null;
        return cell.getContainer().getElement("icon") || null;
    }

    private getVariableIcon(state: number, variableIndex: number): Phaser.GameObjects.GameObject | null {
        if (!this.isVariableTableReady()) return null;
        const cellIndex = state * this.getVariableCount() + variableIndex;
        const cell = this.variableTable.getElement("table").getCell(cellIndex);
        if (!cell) return null;
        return cell.getContainer().getElement("icon") || null;
    }

    private animateEnergyBallTransfer(from: Phaser.GameObjects.GameObject | null, to: Phaser.GameObjects.GameObject | null, onDone: () => void): () => void {
        const fromPos = from ? this.getTableIconCenter(from) : null;
        const toPos = to ? this.getTableIconCenter(to) : null;

        return this.animateEnergyBallTransferBetweenPositions(fromPos, toPos, onDone);
    }

    private animateEnergyBallTransferBetweenPositions(fromPos: { x: number; y: number } | null, toPos: { x: number; y: number } | null, onDone: () => void): () => void {

        if (!fromPos || !toPos) {
            onDone();
            return () => {};
        }

        const ball = this.scene.add.image(fromPos.x, fromPos.y, this.energyTexture).setDepth(1000);
        let finished = false;
        let tween: Phaser.Tweens.Tween | null = null;
        let timeout: Phaser.Time.TimerEvent | null = null;
        const finish = () => {
            if (finished) return;
            finished = true;
            if (ball && ball.scene) ball.destroy();
            onDone();
        };

        tween = this.scene.tweens.add({
            targets: ball,
            x: toPos.x,
            y: toPos.y,
            duration: 220,
            ease: "Cubic.easeInOut",
            onComplete: finish,
            onStop: finish
        });

        timeout = this.scene.time.delayedCall(280, finish);

        return () => {
            if (finished) return;
            finished = true;
            if (tween) tween.stop();
            if (timeout) timeout.remove(false);
            if (ball.scene) ball.destroy();
        };
    }

    private animateSpendIntoOccupiedCellBetweenPositions(
        fromPos: RuneAnimationSource | null,
        toPos: RuneAnimationSource | null,
        onKickStart: () => void,
        onDone: () => void,
    ): () => void {

        if (!fromPos || !toPos) {
            // Keep visual state in sync when tween endpoints are unavailable.
            onKickStart();
            onDone();
            return () => {};
        }

        const incoming = this.scene.add.image(fromPos.x, fromPos.y, this.energyTexture).setDepth(1000);
        let stationary: Phaser.GameObjects.Image | null = null;
        let incomingTween: Phaser.Tweens.Tween | null = null;
        let kickIncomingTween: Phaser.Tweens.Tween | null = null;
        let kickStationaryTween: Phaser.Tweens.Tween | null = null;
        let timeout: Phaser.Time.TimerEvent | null = null;
        let finished = false;
        const finish = () => {
            if (finished) return;
            finished = true;
            if (incoming.scene) incoming.destroy();
            if (stationary && stationary.scene) stationary.destroy();
            onDone();
        };

        incomingTween = this.scene.tweens.add({
            targets: incoming,
            x: toPos.x,
            y: toPos.y,
            duration: 220,
            ease: "Cubic.easeInOut",
            onComplete: () => {
                onKickStart();
                stationary = this.scene.add.image(toPos.x, toPos.y, this.energyTexture).setDepth(1000);
                let doneCount = 0;
                const doneKick = () => {
                    doneCount++;
                    if (doneCount < 2) return;
                    finish();
                };

                kickIncomingTween = this.scene.tweens.add({
                    targets: incoming,
                    x: toPos.x - 18,
                    y: toPos.y - 170,
                    alpha: 0,
                    duration: 180,
                    ease: "Cubic.easeOut",
                    onComplete: doneKick,
                    onStop: doneKick
                });

                kickStationaryTween = this.scene.tweens.add({
                    targets: stationary,
                    x: toPos.x + 18,
                    y: toPos.y - 170,
                    alpha: 0,
                    duration: 180,
                    ease: "Cubic.easeOut",
                    onComplete: doneKick,
                    onStop: doneKick
                });
            },
            onStop: finish
        });

        timeout = this.scene.time.delayedCall(520, finish);

        return () => {
            if (finished) return;
            finished = true;
            if (incomingTween) incomingTween.stop();
            if (kickIncomingTween) kickIncomingTween.stop();
            if (kickStationaryTween) kickStationaryTween.stop();
            if (timeout) timeout.remove(false);
            if (incoming.scene) incoming.destroy();
            if (stationary && stationary.scene) stationary.destroy();
        };
    }

    private animateRefundFromOccupiedSpend(cellIcon: Phaser.GameObjects.GameObject | null, energyIcon: Phaser.GameObjects.GameObject | null, onDone: () => void): () => void {
        const cellPos = cellIcon ? this.getTableIconCenter(cellIcon) : null;
        const energyPos = energyIcon ? this.getTableIconCenter(energyIcon) : null;

        if (!cellPos || !energyPos) {
            onDone();
            return () => {};
        }

        const topY = cellPos.y - 170;
        const ballToEnergy = this.scene.add.image(cellPos.x - 18, topY, this.energyTexture).setDepth(1000);
        const ballToCell = this.scene.add.image(cellPos.x + 18, topY, this.energyTexture).setDepth(1000);
        let convergeTween: Phaser.Tweens.Tween | null = null;
        let toEnergyTween: Phaser.Tweens.Tween | null = null;
        let timeout: Phaser.Time.TimerEvent | null = null;

        let finished = false;
        const finish = () => {
            if (finished) return;
            finished = true;
            if (ballToEnergy.scene) ballToEnergy.destroy();
            if (ballToCell.scene) ballToCell.destroy();
            onDone();
        };

        convergeTween = this.scene.tweens.add({
            targets: [ballToEnergy, ballToCell],
            x: cellPos.x,
            y: cellPos.y,
            duration: 180,
            ease: "Cubic.easeIn",
            onComplete: () => {
                toEnergyTween = this.scene.tweens.add({
                    targets: ballToEnergy,
                    x: energyPos.x,
                    y: energyPos.y,
                    duration: 220,
                    ease: "Cubic.easeInOut",
                    onComplete: () => {
                        if (ballToEnergy.scene) ballToEnergy.destroy();
                        if (ballToCell.scene) ballToCell.destroy();
                        finish();
                    },
                    onStop: finish
                });
            },
            onStop: finish
        });

        timeout = this.scene.time.delayedCall(520, finish);

        return () => {
            if (finished) return;
            finished = true;
            if (convergeTween) convergeTween.stop();
            if (toEnergyTween) toEnergyTween.stop();
            if (timeout) timeout.remove(false);
            if (ballToEnergy.scene) ballToEnergy.destroy();
            if (ballToCell.scene) ballToCell.destroy();
        };
    }

    private stagePendingEnergyLink(spendIndex: number | null, refundIndex: number | null): void {
        this.pendingSpendEnergyIndex = spendIndex;
        this.pendingRefundEnergyIndex = refundIndex;

        if (this.pendingEnergyLinkClearTimer) {
            this.pendingEnergyLinkClearTimer.remove(false);
        }

        this.pendingEnergyLinkClearTimer = this.scene.time.delayedCall(0, () => {
            this.pendingSpendEnergyIndex = null;
            this.pendingRefundEnergyIndex = null;
            this.pendingEnergyLinkClearTimer = null;
        });
    }

    private finalizeRefundAnimation(row: number, variableIndex: number, energyIndex: number, runeVisible: boolean): void {
        this.toggleRune(runeVisible, row, variableIndex);
        this.setEnergyIconColor(true, energyIndex);
    }

    public stagePendingCardRuneSource(x: number, y: number): void {
        this.pendingCardRuneSource = { x, y };

        if (this.pendingCardRuneSourceClearTimer) {
            this.pendingCardRuneSourceClearTimer.remove(false);
        }

        this.pendingCardRuneSourceClearTimer = this.scene.time.delayedCall(0, () => {
            this.pendingCardRuneSource = null;
            this.pendingCardRuneSourceClearTimer = null;
        });
    }

    private consumePendingEnergyLink(): PendingEnergyLink {
        if (this.pendingSpendEnergyIndex !== null) {
            const index = this.pendingSpendEnergyIndex;
            this.pendingSpendEnergyIndex = null;
            return { kind: "spend", index };
        }

        if (this.pendingRefundEnergyIndex !== null) {
            const index = this.pendingRefundEnergyIndex;
            this.pendingRefundEnergyIndex = null;
            return { kind: "refund", index };
        }

        return { kind: "none", index: null };
    }

    private resolveIncomingRuneSource(
        energy: PendingEnergyLink,
        cardSource: RuneAnimationSource | null,
    ): { fromPos: RuneAnimationSource | null; conflictEnergyIndex: number | null } {
        if (energy.kind === "spend" && energy.index !== null) {
            const energyIcon = this.getEnergyIcon(energy.index);
            return {
                fromPos: this.getTableIconCenter(energyIcon as Phaser.GameObjects.GameObject),
                conflictEnergyIndex: energy.index,
            };
        }

        if (cardSource) {
            return {
                fromPos: cardSource,
                conflictEnergyIndex: null,
            };
        }

        return {
            fromPos: null,
            conflictEnergyIndex: null,
        };
    }

    private applyRuneTransition(
        row: number,
        variableIndex: number,
        oldValue: boolean,
        newValue: boolean,
        energy: PendingEnergyLink,
        cardSource: RuneAnimationSource | null,
    ): void {
        const withConflict = (energyIndex: number, animate: (done: () => void) => (() => void)): void => {
            this.startConflictAwareAnimation(row, variableIndex, energyIndex, animate, () => {});
        };
        const withCellConflict = (animate: (done: () => void) => (() => void)): void => {
            this.startConflictAwareAnimation(row, variableIndex, null, animate, () => {});
        };
        const finalize = (energyIndex: number, runeVisible: boolean, done: () => void): void => {
            this.finalizeRefundAnimation(row, variableIndex, energyIndex, runeVisible);
            done();
        };

        const energyIndex = energy.index;
        const incoming = this.resolveIncomingRuneSource(energy, cardSource);

        if (oldValue !== newValue && incoming.fromPos) {
            if (!oldValue && newValue) {
                this.toggleRune(false, row, variableIndex);
                const run = (
                    done => this.animateEnergyBallTransferBetweenPositions(
                        incoming.fromPos,
                        this.getTableIconCenter(this.getVariableIcon(row, variableIndex) as Phaser.GameObjects.GameObject),
                        () => {
                            this.toggleRune(true, row, variableIndex);
                            done();
                        }
                    )
                );

                if (incoming.conflictEnergyIndex !== null) withConflict(incoming.conflictEnergyIndex, run);
                else withCellConflict(run);
                return;
            }

            this.toggleRune(true, row, variableIndex);
            const run = (
                done => this.animateSpendIntoOccupiedCellBetweenPositions(
                    incoming.fromPos,
                    this.getTableIconCenter(this.getVariableIcon(row, variableIndex) as Phaser.GameObjects.GameObject),
                    () => this.toggleRune(false, row, variableIndex),
                    done
                )
            );

            if (incoming.conflictEnergyIndex !== null) withConflict(incoming.conflictEnergyIndex, run);
            else withCellConflict(run);
            return;
        }

        if (energy.kind === "refund" && energyIndex !== null) {
            if (oldValue && !newValue) {
                const cellIcon = this.getVariableIcon(row, variableIndex);
                const energyIcon = this.getEnergyIcon(energyIndex);
                const fromPos = this.getTableIconCenter(cellIcon as Phaser.GameObjects.GameObject);
                const toPos = this.getTableIconCenter(energyIcon as Phaser.GameObjects.GameObject);
                this.toggleRune(false, row, variableIndex);
                this.setEnergyIconColor(false, energyIndex);
                withConflict(
                    energyIndex,
                    done => this.animateEnergyBallTransferBetweenPositions(
                        fromPos,
                        toPos,
                        () => finalize(energyIndex, false, done)
                    )
                );
                return;
            }

            if (!oldValue && newValue) {
                this.toggleRune(false, row, variableIndex);
                this.setEnergyIconColor(false, energyIndex);
                withConflict(
                    energyIndex,
                    done => this.animateRefundFromOccupiedSpend(
                        this.getVariableIcon(row, variableIndex),
                        this.getEnergyIcon(energyIndex),
                        () => finalize(energyIndex, true, done)
                    )
                );
                return;
            }

            this.toggleRune(newValue, row, variableIndex);
            this.setEnergyIconColor(true, energyIndex);
            return;
        }

        this.toggleRune(newValue, row, variableIndex);
    }

    constructor(
        scene: Phaser.Scene,
        game: Mission,

        colorPrimary: number = 0x5C4D4D,
        colorHighlight: number = 0xc9c7c5,
        colorArrow: number = 0x376A8E,
        colorCellOver: number = 0xffffff,
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

        if (this.pendingEnergyLinkClearTimer) {
            this.pendingEnergyLinkClearTimer.remove(false);
            this.pendingEnergyLinkClearTimer = null;
        }

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
                (cellContainer, cellIndex) => {
                    if (this.isDestroyed) return;
                    const column = Math.floor(cellIndex / numVar);
                    const row = cellIndex % numVar;
                    if (!this.isCellChangeableNow(column, row)) return;
                    const variableName = this.getVariableNameForRow(row);
                    this.scene.time.delayedCall(0, () => {
                        if (this.isDestroyed || !variableName) return;
                        if (!this.isCellChangeableNow(column, row)) return;
                        this._gameState.invertVariableUser(variableName, column);
                    });
                })
            .on("cell.over", (cellContainer, cellIndex) => {
                this.hoveredVariableCellIndex = cellIndex;
                this.applyVariableCellHoverVisual(cellContainer, cellIndex);
            })
            .on("cell.out", (cellContainer, cellIndex) => {
                if (this.hoveredVariableCellIndex === cellIndex) this.hoveredVariableCellIndex = null;
                cellContainer
                    .getElement("background")
                    .setStrokeStyle(2, this.colorCellEdge)
                    .setDepth(0);
            });


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
        this.refreshHoveredVariableCellVisual();
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
        this.refreshHoveredVariableCellVisual();
    }

    /**
     * change color of energy table at index
     * @param color: color to change energy cell to
     * @param index: position of cell
     * @param visible: energy icon shows if visible is true
     */
    private setEnergyIconColor(visible: boolean, index: number) {
        if (!this.isEnergyTableReady()) return;
        if (index < 0) return;
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
        this.updateArrowStates();
        this.refreshHoveredVariableCellVisual();
    }

    addColumns(n: number) {
        if (!this.isVariableTableReady()) return;
        let numVar = Object.keys(this.variables).length;
        let itemCount = n * numVar;
        this.paddVariableStates(this.tableColumnCount-1);
        
        for (let i = 0; i < itemCount; i++) {
            const state = this.tableColumnCount + Number(i / 4)
            const variable = this.gameState.variables[this.variableByIndex[i%4]]
            const value = variable.getValue(state)
            this.tableItems.push({
                id: this.tableColumnCount * numVar + i,
                iconAlpha: Number(value),
                backgroundColor: this.colorPrimary,
                backgroundAlpha: 0
            });
        }
        this.tableColumnCount += n;
        this.variableTable.setItems(this.tableItems);
    }

    async variableChanged(gameState: GameState, oldVariable: Variable, variable: Variable, valueChanges: { [p: number]: boolean }) {
        const variableIndex = this.variables[variable.representation];
        if (oldVariable.defaultValueFuture !== variable.defaultValueFuture) {
            // defaultValueFuture changed: repaint every visible cell so the
            // whole trace reflects the new open-ended value.
            for (let row = 0; row < this.tableColumnCount; row++) {
                this.toggleRune(variable.getValue(row), row, variableIndex);
            }
        } else {
            for (let key in valueChanges) {
                let row = parseInt(key);
                let newValue = valueChanges[key];
                const isCurrentState = row === this.gameState.activeState;
                const oldValue = oldVariable.getValue(row);

                const pendingEnergy = isCurrentState
                    ? this.consumePendingEnergyLink()
                    : NO_PENDING_ENERGY;

                const cardSource = this.pendingCardRuneSource;

                this.applyRuneTransition(row, variableIndex, oldValue, newValue, pendingEnergy, cardSource);
            }
        }
    }

    async energyChanged(gameState: GameState, oldEnergy: number, newEnergy: number, oldMaxEnergy: number, newMaxEnergy: number) {
        // only changes one energy
        if (oldEnergy > newEnergy) {
            this.stagePendingEnergyLink(newEnergy, null);
            this.setEnergyIconColor(false, newEnergy);
        } else {
            this.stagePendingEnergyLink(null, newEnergy - 1);
            this.setEnergyIconColor(true, newEnergy - 1);
        }
        this.refreshHoveredVariableCellVisual();
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
        this.refreshHoveredVariableCellVisual();
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
        if (!this.isVariableTableReady() || this.isScrolling) return false;
        if (toRight && this.scrollCount + 20 >= this.tableColumnCount) return false;
        if (!toRight && this.scrollCount <= 0) return false;

        // Update logical state immediately to block any re-entrant calls
        this.isScrolling = true;
        if (toRight) this.scrollCount++; else this.scrollCount--;
        this.updateArrowStates();

        const sign = toRight ? -1 : 1;
        const total = this.variableTableCellWidth;
        let scrolled = 0;
        this.scene.tweens.addCounter({
            from: 0,
            to: total,
            duration: 120,
            ease: 'Cubic.easeOut',
            onUpdate: (tween) => {
                const current = tween.getValue() ?? total;
                const delta = current - scrolled;
                scrolled = current;
                this.variableTable.getElement('table').addTableOY(sign * delta).updateTable();
            },
            onComplete: () => {
                this.isScrolling = false;
                this.updateArrowStates();
            }
        });
        return true;
    }

    /**
     * fades out and disables arrows that cannot scroll in their direction,
     * fades in and enables arrows that can.
     */
    private updateArrowStates(): void {
        const canScrollLeft = this.scrollCount > 0;
        const canScrollRight = this.scrollCount + 20 < this.tableColumnCount;
        if (this.leftArrow) {
            this.leftArrow.setAlpha(canScrollLeft ? 1 : 0.25);
            if (canScrollLeft) {
                this.leftArrow.setInteractive();
            } else {
                this.leftArrow.disableInteractive();
            }
        }
        if (this.rightArrow) {
            this.rightArrow.setAlpha(canScrollRight ? 1 : 0.25);
            if (canScrollRight) {
                this.rightArrow.setInteractive();
            } else {
                this.rightArrow.disableInteractive();
            }
        }
    }


    /**
     * creates two arrows for scrolling columns to the left / right
     */
    setUpScrollingArrows() {
        let bottom = this.variableTable.bottom + 35;

        // right arrow — no tween guard needed: arrows are disabled while scrolling
        this.rightArrow = this.scene.add.image(150, bottom, 'arrow')
            .setAngle(180)
            .setTint(this.colorArrow);
        const rightArrowBaseX = 150;

        this.rightArrow.setInteractive()
            .on('pointerdown', () => {
                if (this.scrollTable(true)) {
                    this.rightArrow.setTint(0xff0000);
                    this.scene.tweens.killTweensOf(this.rightArrow);
                    this.rightArrow.x = rightArrowBaseX;
                    this.scene.tweens.add({
                        targets: this.rightArrow,
                        x: rightArrowBaseX + 20,
                        ease: 'power2',
                        duration: 100,
                        yoyo: true,
                        onComplete: () => this.rightArrow.setTint(this.colorArrow)
                    });
                }
            });

        // left arrow
        this.leftArrow = this.scene.add.image(70, bottom, 'arrow')
            .setInteractive()
            .setTint(this.colorArrow);
        const leftArrowBaseX = 70;

        this.leftArrow.on('pointerdown', () => {
            if (this.scrollTable(false)) {
                this.leftArrow.setTint(0xff0000);
                this.scene.tweens.killTweensOf(this.leftArrow);
                this.leftArrow.x = leftArrowBaseX;
                this.scene.tweens.add({
                    targets: this.leftArrow,
                    x: leftArrowBaseX - 20,
                    ease: 'power2',
                    duration: 100,
                    yoyo: true,
                    onComplete: () => this.leftArrow.setTint(this.colorArrow)
                });
            }
        });

        this.updateArrowStates();
    }
}


