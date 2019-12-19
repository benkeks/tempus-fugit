///<reference path="one-param-operator.ts"/>
import {OneParamOperator} from "./one-param-operator";
import {PropositionStatus} from "../proposition";

export class Next extends OneParamOperator {

    public getDefaultRepresentation():string {
        return "X";
    }

    public getReverseRepresentation(): string {
        return "Y";
    }

    evaluateInternal(condition: number): PropositionStatus {
        let status:PropositionStatus = this.operand.evaluateInternal(condition+this.direction);

        return status;
    }


    public static getAlphabet():string {
        return "X|O";
    }
}