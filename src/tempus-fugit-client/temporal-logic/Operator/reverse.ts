import {Operator} from "./operator";
import {OneParamOperator} from "./one-param-operator";
import {Proposition, PropositionStatus} from "../proposition";
import {Global} from "./global";
import {Next} from "./next";
import {Until} from "./until";
import {Release} from "./release";
import {Eventual} from "./eventual";

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
        return ""; //default:#
    }

    public getReverseRepresentation():string {
        return "";
    }

    generateRepresentation(recursive: boolean, defaultRepresentation: boolean = true, direction: number=Proposition.DEFAULT_DIRECTION): string {
        if (defaultRepresentation) return this.operand.generateRepresentation(recursive, defaultRepresentation, -1);
        return super.generateRepresentation(recursive, defaultRepresentation);
    }

    evaluateInternal(condition: number, direction:number): PropositionStatus {
        return this.operand.evaluateInternal(condition, -1);
    }

    public static getAlphabet():string {
        return "#";
    }
}