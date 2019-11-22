import {GameState, GameStateListener} from "./objects/GameState";
import {Variable} from "./temporal-logic/Variable";

document.body.innerText = "Hello World";

let text:string = "";
let gs:GameState = new GameState();
gs.listener.push(new class implements GameStateListener {
    roundChanged(gameSate: GameState, lastRound: number): void {
        text = text + "roundChanged!\n";
        text = text + "active= " + gameSate.activeState + "  last=" + lastRound + "\n";
    }

    variableChanged(gameState: GameState, oldVariable: Variable, variable: Variable, valueChanges: { [p: number]: [boolean, boolean] }): void {
        text = text + "variable changed!\n";
        text = text + valueChanges[gs.activeState] + "\n";
    }
});

while (true) {
    text = "test";
    gs.setVariable("a", !gs.getVariable("a").getValue(gs.activeState-1));
    gs.changeRound();
    window.alert(text);
}