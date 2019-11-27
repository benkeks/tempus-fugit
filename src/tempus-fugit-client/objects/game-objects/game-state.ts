import {Variable} from "../../temporal-logic/variable";
import {Formula} from "../../temporal-logic/formula";
import {Card} from "./card";

export class GameState {
    get energy(): number {
        return this._energy;
    }

    set energy(value: number) {
        let old:number = this._energy;
        this._energy = value;

        this.listener.map(obj => obj.energyChanged(this, old, value, -1, -1));
    }

    get maxEnergy(): number {
        return this._maxEnergy;
    }

    set maxEnergy(value: number) {
        let old:number = this._maxEnergy;
        this._maxEnergy = value;

        this.listener.map(obj => obj.energyChanged(this, -1, -1, old, value));
    }
    get variables(): { [p: string]: Variable } {
        return this._variables;
    }

    set variables(value: { [p: string]: Variable }) {
        this._variables = value;
    }

    private _variables:{[represenstation:string]:Variable} = {};
    public variableStatus:{[representation:string]:VariableStatus} = {};

    private _maxEnergy:number = 3;
    private _energy:number = this._maxEnergy;

    public activeState:number = 0;
    public listener:GameStateListener[] = [];

    constructor() {}

    /**
     * applies the assignment of the given formula and evaluates it.
     *
     * @param object can be a Formula or a Card
     * @return the truth value of the formula
     *
     * */
    public evaluate(object:any):boolean {
        if (typeof object === typeof Formula) {
            let f: Formula = object as Formula;

            f.applyAssignment(this._variables);
            return f.evaluate(this.activeState);
        } else if (typeof object === typeof Card) {
            let c:Card = object as Card;
            return this.evaluate(c.getFormula());
        } else {
            console.log("object type: " + typeof object);
            throw new TypeError("Evaluate expects object of type Formula or Card!");
        }
    }

    /***
     *  changes the roundIndex and triggers an event.
     *
     * @param round next round index. Default: activeState+1
     * @return 0: if succceed; 1: if the round is the active Round
     */
    public changeRound(round:number=this.activeState+1):number {
        if (this.activeState == round) {
            return 1;
        }


        let lastState:number=this.activeState;
        this.activeState = round;

        // calling listener
        this.listener.map(obj => obj.roundChanged(this, lastState, this.activeState));

        return 0;
    }

    /**
     *
     * this function changes the value of a variable at a given state. Afterwards it calls its listener only if it succeded.
     * @param name the representation of the variable
     * @param value the value that should be set
     * @param state the state where the value should be set. Default: the active state
     * @return 0: if the change succeded, 1: if the value is blocked, 2: if no energy available
     * */
    public setVariable(name:string, value:boolean, state:number=this.activeState, useEnergy:boolean=true):number {
        let v:Variable = this.getVariable(name);
        let vs:VariableStatus = this.getVariableStatus(name);
        let oldVariable:Variable = v.copy();
        let changes:{[state:number]:boolean} = {};

        if (useEnergy && state == this.activeState) {
            if (this.energy > 0) {
                this.energy -= 1;
            } else {
                return 2;
            }
        }

        if (vs.isBlocked(state)) {
            return 1;
        } else {
            v = this.variables[name];
            changes[state] = value;
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
    roundChanged(gameSate:GameState, lastRound:number, activeRound:number):void;

    /**
     * This function gets called if a Variable is being changed.
     * @param gameState a reference to the gamestate Object where the variable got changed.
     * @param oldVariable the Variable before the change
     * @param variable the Variable after the change
     * @param valueChanges the values that got changed in the event for each state.
     * @example
     *  let varName:string=variable.representation;
     *  let newValue:boolean = variable.value;
     *  for (i in valueChanges) {
     *      console.log("change: " + valueChanges[i]);
     *  }
     * */
    //TODO: Variablename und index und neuer wert
    variableChanged(gameState:GameState, oldVariable:Variable, variable:Variable, valueChanges:{[state:number]:boolean}):void;

    /**
     *  this function is being called if the energy values are changed.
     * @param gameState a reference to the gamestate Object which triggered the event
     * @param oldEnergy the Energy before the change
     * @param newEnergy the Energy value after the change
     * @param oldMaxEnergy the maximum Energy before the change
     * @param newMaxEnergy the maximum Energy after the change
     */
    energyChanged(gameState:GameState, oldEnergy:number, newEnergy:number, oldMaxEnergy:number, newMaxEnergy:number):void;
}