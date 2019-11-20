import {Variable} from "../temporal-logic/Variable";
import {Formula} from "../temporal-logic/Formula";

export class GameState {
    get variables(): { [p: string]: Variable } {
        return this._variables;
    }

    set variables(value: { [p: string]: Variable }) {
        this._variables = value;
    }

    private _variables:{[represenstation:string]:Variable} = {};
    public variableStatus:{[representation:string]:VariableStatus} = {};

    public activeState:number = 0;
    public listener:GameStateListener[] = [];

    constructor() {}

    public evaluate(object:any) {
        if (typeof object === typeof Formula) {
            let f: Formula = object as Formula;

            f.applyAssignment(this._variables);
            f.evaluate(this.activeState);
        } else {
            console.log("object type: " + typeof object);
            throw new TypeError("Evaluate expects object of type formula!");
        }
    }

    public changeRound(round:number=this.activeState+1):number {
        if (this.activeState == round) {
            return;
        }

        let lastState:number=this.activeState;
        this.activeState = round;

        // calling listener
        this.listener.map(obj => obj.roundChanged(this, lastState));

        return 0;
    }

    /**
     *
     * this function changes the value of a variable at a given state. Afterwards it calls its listener only if it succeded.
     * @param name the representation of the variable
     * @param value the value that should be set
     * @param state the state where the value should be set. Default: the active state
     * @return 0: if the change succeded, 1: if the value is blocked
     * */
    public setVariable(name:string, value:boolean, state:number=this.activeState):number {
        let v:Variable = this.getVariable(name);
        let vs:VariableStatus = this.getVariableStatus(name);
        let oldVariable:Variable = v.copy();
        let changes:{[state:number]:[boolean,boolean]} = {};

        if (vs.isBlocked(state)) {
            return 1;
        } else {
            v = this.variables[name];
            changes[state] = [v.getValue(state), value];
            v.setValue(value, state);
        }

        this.listener.map(obj => obj.variableChanged(this, oldVariable, v, changes));

        return 0;
    }

    public getVariableStatus(name:string):VariableStatus {
        if (!(name in this.variableStatus)) {
            this.variableStatus[name] = new VariableStatus();
        }
        return this.variableStatus[name];
    }

    public getVariable(name:string):Variable {
        if (!(name in this.variables)) {
            this.variables[name] = new Variable(name);
            this.variableStatus[name] = new VariableStatus();
        }
        return this.variables[name];
    }
}

class VariableStatus {
    blocked:{[id:number] : boolean} = {};

    constructor() {
    }

    public isBlocked(state:number):boolean {
        if (state in this.blocked) {
            return this.blocked[state];
        }

        return false;
    }
}

export interface GameStateListener {
    /**
     * This function gets called, when the gamestate accesses a new round
     * @param gameState a reference to the gamestate Object where the round got changed.
     * @param lastRound The value of the round before the change. The new Round Value can be accessed in gameState
     *
     * */
    roundChanged(gameSate:GameState, lastRound:number):void;

    /**
     * This function gets called if a Variable is being changed.
     * @param gameState a reference to the gamestate Object where the variable got changed.
     * @param oldVariable the Variable before the change
     * @param variable the Variable after the change
     * @param valueChanges the values that got changed in the event for each state. It contains the value before and after [before,after]
     *
     * */
    variableChanged(gameState:GameState, oldVariable:Variable, variable:Variable, valueChanges:{[state:number]:[boolean,boolean]}):void;
}