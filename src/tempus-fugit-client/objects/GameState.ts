import {Variable} from "../temporal-logic/Variable";
import {Formula} from "../temporal-logic/Formula";

export class GameState {

    public variables:{[represenstation:string]:Variable} = {};
    public activeState:number;

    constructor() {

    }

    public evaluate(object:any) {
        if (typeof object === typeof Formula) {
            let f: Formula = object as Formula;

            f.applyAssignment(this.variables);
            f.evaluate(this.activeState);
        }
    }

}