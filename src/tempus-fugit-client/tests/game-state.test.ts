import { afterEach, describe, expect, it, vi } from "vitest";
import { GameState, GameStateListener } from "../objects/game-objects/game-state";
import { Formula } from "../temporal-logic/formula";
import { Variable } from "../temporal-logic/variable";

function createGame(length = 20) {
    const game = new GameState();
    game.setVariable("l", false, length - 1);
    game.activeState = 5;
    return game;
}

function observe(game: GameState) {
    const listener: GameStateListener = {
        variableChanged: vi.fn(),
        roundChanged: vi.fn(),
        energyChanged: vi.fn(),
        activated: vi.fn(),
    };
    game.addListener(listener);
    return vi.mocked(listener.variableChanged);
}

afterEach(() => vi.restoreAllMocks());

describe("Rune assignments", () => {
    it("changes the stored future and its default with one snapshot and notification", () => {
        const game = createGame(2000);
        const changed = observe(game);
        const copy = vi.spyOn(Variable.prototype, "copy");
        game.getVariableStatus("l").userChanged[5] = true;

        game.setAllVariableValues({variable: "l", start: 0, end: -1, local: true, value: true});

        expect(copy).toHaveBeenCalledTimes(1);
        expect(changed).toHaveBeenCalledTimes(1);
        const [, oldVariable, variable, changes] = changed.mock.calls[0];
        expect(oldVariable.defaultValueFuture).toBe(false);
        expect(oldVariable.getValue(5)).toBe(false);
        expect(variable.defaultValueFuture).toBe(true);
        expect(variable.getValue(4)).toBe(false);
        expect(variable.getValue(5)).toBe(true);
        expect(variable.getValue(10000)).toBe(true);
        expect(Object.keys(changes)).toHaveLength(1995);
        expect(changes[5]).toBe(true);
        expect(changes[1999]).toBe(true);
        expect(game.getVariableStatus("l").userChanged[5]).toBe(false);
        expect(game.evaluate(new Formula("Gl"))).toBe(true);
    });

    it("does not grow history on repeated whole-future casts", () => {
        const game = createGame();
        for (const value of [true, true, false, false, true]) {
            game.setAllVariableValues({variable: "l", start: 0, end: -1, local: true, value});
            expect(game.getVariable("l").values).toHaveLength(20);
            expect(game.getVariable("l").getValue(10000)).toBe(value);
            expect(game.getVariable("l").getValue(4)).toBe(false);
        }
    });

    it.each([5, 19, 25])("preserves the current round when an effect starts next round at %i", round => {
        const game = createGame();
        game.activeState = round;

        game.setAllVariableValues({variable: "l", start: 1, end: -1, local: true, value: true});

        const variable = game.getVariable("l");
        expect(variable.getValue(round)).toBe(false);
        expect(variable.getValue(round + 1)).toBe(true);
        expect(variable.getValue(10000)).toBe(true);
        expect(variable.values).toHaveLength(Math.max(20, round + 1));
    });

    it("preserves an existing true default before a later false interval", () => {
        const game = createGame();
        game.getVariable("l").defaultValueFuture = true;
        game.activeState = 25;

        game.setAllVariableValues({variable: "l", start: 1, end: -1, local: true, value: false});

        expect(game.getVariable("l").getValue(20)).toBe(true);
        expect(game.getVariable("l").getValue(25)).toBe(true);
        expect(game.getVariable("l").getValue(26)).toBe(false);
    });

    it("preserves bounded local intervals and absolute whole-timeline assignments", () => {
        const game = createGame();
        game.setAllVariableValues({variable: "l", start: 1, end: 3, local: true, value: true});
        expect([5, 6, 7, 8].map(state => game.getVariable("l").getValue(state)))
            .toEqual([false, true, true, false]);
        expect(game.getVariable("l").defaultValueFuture).toBe(false);

        game.setAllVariableValues([{variable: "l", start: 0, end: -1, local: false, value: true}]);
        expect(game.getVariable("l").getValue(0)).toBe(true);
        expect(game.getVariable("l").getValue(10000)).toBe(true);
    });

    it("takes no snapshots for silent writes but preserves single-cell notifications", () => {
        const game = createGame();
        const changed = observe(game);
        const copy = vi.spyOn(Variable.prototype, "copy");

        game.setVariable("l", true, 6, false, false);
        expect(copy).not.toHaveBeenCalled();
        expect(changed).not.toHaveBeenCalled();

        game.setVariable("l", true, 5);
        expect(copy).toHaveBeenCalledTimes(1);
        expect(changed).toHaveBeenCalledTimes(1);
        expect(changed.mock.calls[0][1].getValue(5)).toBe(false);
        expect(changed.mock.calls[0][3]).toEqual({5: true});
    });
});
