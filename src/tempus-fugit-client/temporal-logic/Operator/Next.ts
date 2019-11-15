///<reference path="OneParamOperator.ts"/>
import {OneParamOperator} from "./OneParamOperator";
import {PropositionStatus} from "../Proposition";

export class Next extends OneParamOperator {


    public getDefaultRepresentation():string {
        return "X";
    }

    evaluateInternal(condition: number): PropositionStatus {
        let status:PropositionStatus = this.operand.evaluateInternal(condition+this.direction);

        return status;
    }


    public static getAlphabet():string {
        return "X|O";
    }
}