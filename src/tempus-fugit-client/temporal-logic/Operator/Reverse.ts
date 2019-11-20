import {Operator} from "./Operator";
import {OneParamOperator} from "./OneParamOperator";
import {Proposition, PropositionStatus} from "../Proposition";
import {Global} from "./Global";
import {Next} from "./Next";
import {Until} from "./Until";
import {Release} from "./Release";
import {Eventual} from "./Eventual";

export class Reverse extends OneParamOperator {

    public set operand(value: Proposition) {
        if (value !== undefined && value !== null) {
            let types: any = [Global, Next, Until, Release, Eventual];
            let isType: boolean = false;

            for (let i in types) {
                if (value instanceof types[i]) {
                    isType = true;
                    break;
                }
            }
            if (!isType) {
                console.warn("WARNING: The Operand of the Reverse Operator has to be of type Global, Next, Not, Until or Release and not of type (" + value.constructor.name + ") or this Operator does nothing.");
            }
        }

        this._operand = value;
    }

    public get operand(): Proposition {
        return this._operand;
    }

    public getDefaultRepresentation():string {
        return "#";
    }

    evaluateInternal(condition: number): PropositionStatus {
        if (this.operand instanceof Operator) {
            this.operand.direction = -1;
        }
        return this.operand.evaluateInternal(condition);
    }

    constructor(representation:string=undefined, operator:Operator=undefined) {
        super(representation, operator);

        this.direction = -1;
    }

    public static getAlphabet():string {
        return "#";
    }
}