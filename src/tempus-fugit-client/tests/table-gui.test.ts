import { describe, expect, it, vi } from "vitest";
import { GameState } from "../objects/game-objects/game-state";
import { TableGUI } from "../objects/game-gui-objects/table-gui";

vi.mock("../objects/game-gui-objects/list-gui", () => ({ListGUI: class {}}));

function createTable(visible = true) {
    const game = new GameState();
    game.setVariable("l", false, 19);
    const items = Array.from({length: 20}, () => ({iconAlpha: 0}));
    const updateTable = vi.fn();
    const addColumns = vi.fn();
    const icon = {};
    const table: TableGUI = Object.create(TableGUI.prototype);
    Object.assign(table, {
        _gameState: game,
        variables: {l: 0},
        tableColumnCount: 20,
        tableItems: items,
        variableTable: {
            scene: {},
            getElement: () => ({
                updateTable,
                getCell: () => ({getContainer: () => visible ? {getElement: () => icon} : null}),
            }),
            removeAllListeners: vi.fn(),
            destroy: vi.fn(),
        },
        activeCellAnimations: new Map(),
        activeEnergyAnimations: new Map(),
        pendingSpendEnergyIndex: null,
        pendingRefundEnergyIndex: null,
        pendingCardRuneSource: null,
        hoveredVariableCellIndex: null,
        addColumns,
    });
    const transition = vi.fn(table["applyRuneTransition"].bind(table));
    Object.assign(table, {applyRuneTransition: transition});
    game.addListener(table);
    return {game, table, items, updateTable, addColumns, transition};
}

describe("Rune table updates", () => {
    it("refreshes once for whole-future casts, including repeated casts", () => {
        const {game, items, updateTable, addColumns} = createTable();
        game.activeState = 5;
        for (const value of [true, true, false]) {
            updateTable.mockClear();
            game.setAllVariableValues({variable: "l", start: 0, end: -1, local: true, value});
            expect(updateTable).toHaveBeenCalledExactlyOnceWith(true);
            expect(items.map(item => item.iconAlpha))
                .toEqual(Array(5).fill(0).concat(Array(15).fill(Number(value))));
        }
        expect(addColumns).not.toHaveBeenCalled();
    });

    it("batches bounded updates without bypassing visible-cell transitions", () => {
        const {game, items, updateTable, transition} = createTable();
        game.setVariableValues({l: {1: true, 2: true}});
        expect(updateTable).toHaveBeenCalledExactlyOnceWith(true);
        expect(transition).toHaveBeenCalledTimes(2);
        expect(items[1].iconAlpha).toBe(1);
        expect(items[2].iconAlpha).toBe(1);
    });

    it("does not expand the table or animate off-screen updates", () => {
        const {game, items, updateTable, addColumns, transition} = createTable(false);
        game.setVariableValues({l: {1: true, 2000: true}});
        expect(updateTable).toHaveBeenCalledTimes(1);
        expect(addColumns).not.toHaveBeenCalled();
        expect(transition).not.toHaveBeenCalled();
        expect(items).toHaveLength(20);
        expect(items[1].iconAlpha).toBe(1);
        expect(game.getVariable("l").getValue(2000)).toBe(true);
    });

    it("preserves the single-cell energy and card animation inputs", () => {
        const {game, table, transition, updateTable} = createTable();
        const cardSource = {x: 100, y: 200};
        Object.assign(table, {pendingSpendEnergyIndex: 1, pendingCardRuneSource: cardSource});
        transition.mockImplementation(() => {});
        game.setVariable("l", true);
        expect(transition).toHaveBeenCalledExactlyOnceWith(
            0, 0, false, true, {kind: "spend", index: 1}, cardSource,
        );
        expect(updateTable).toHaveBeenCalledTimes(1);
    });

    it("cancels stale cell animations before a whole-future repaint", () => {
        const {game, table, items} = createTable();
        const cancel = vi.fn();
        table["activeCellAnimations"].set(table["getCellAnimationKey"](1, 0), cancel);
        game.setAllVariableValues({variable: "l", start: 0, end: -1, local: false, value: true});
        expect(cancel).toHaveBeenCalledOnce();
        expect(items[1].iconAlpha).toBe(1);
    });

    it("refreshes normally when an animation completes after the batch", () => {
        const {game, table, updateTable, items} = createTable();
        game.setVariable("l", true);
        updateTable.mockClear();
        table["toggleRune"](false, 0, 0);
        expect(items[0].iconAlpha).toBe(0);
        expect(updateTable).toHaveBeenCalledExactlyOnceWith(true);
    });

    it("restores a refunded rune when its energy is reused by another cell", () => {
        const {game, table, items} = createTable();
        game.setVariable("l", true, 0, false, false);
        items[0].iconAlpha = 0;
        const cancelRefund = vi.fn();
        table["startConflictAwareAnimation"](0, 0, 1, () => cancelRefund, () => {});

        table["startConflictAwareAnimation"](1, 0, 1, () => () => {}, () => {});

        expect(cancelRefund).toHaveBeenCalledOnce();
        expect(items[0].iconAlpha).toBe(1);
        expect(table["activeCellAnimations"].has("0:0")).toBe(false);
    });

    it("cancels a pending arrival even when the replacement update has no animation source", () => {
        const {game, table, items} = createTable();
        game.setVariable("l", true, 0, false, false);
        const cancelArrival = vi.fn();
        table["startConflictAwareAnimation"](0, 0, 1, () => cancelArrival, () => {});

        game.setVariable("l", false);

        expect(cancelArrival).toHaveBeenCalledOnce();
        expect(items[0].iconAlpha).toBe(0);
        expect(table["activeCellAnimations"].size).toBe(0);
    });

    it("does not retain an animation that finishes synchronously without endpoints", () => {
        const {table} = createTable();
        const completed = vi.fn();
        table["startConflictAwareAnimation"](0, 0, 1, done => {
            done();
            return () => {};
        }, completed);
        expect(completed).toHaveBeenCalledOnce();
        expect(table["activeCellAnimations"].size).toBe(0);
        expect(table["activeEnergyAnimations"].size).toBe(0);
    });

    it("handles energy cells without rendered containers", () => {
        const {table} = createTable();
        table.energyTable = {
            scene: {},
            getElement: () => ({getCell: () => ({getContainer: () => null})}),
        };
        expect(table["getEnergyIcon"](1)).toBeNull();
        expect(() => table["setEnergyIconColor"](true, 1)).not.toThrow();
    });

    it("cancels in-flight animations and source timers when the table is destroyed", () => {
        const {game, table} = createTable();
        const cancel = vi.fn();
        const removeTimer = vi.fn();
        table["startConflictAwareAnimation"](0, 0, 1, () => cancel, () => {});
        Object.assign(table, {pendingCardRuneSourceClearTimer: {remove: removeTimer}});

        table.destroy();
        table.destroy();

        expect(cancel).toHaveBeenCalledOnce();
        expect(removeTimer).toHaveBeenCalledOnce();
        expect(table["activeCellAnimations"].size).toBe(0);
        expect(table["activeEnergyAnimations"].size).toBe(0);
        expect(game.listener).not.toContain(table);
    });
});
