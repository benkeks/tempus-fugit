///<reference path="one-param-operator.ts"/>
import {OneParamOperator} from "./one-param-operator";
import {EvaluationWindow, Proposition, PropositionStatus} from "../proposition";

export class Next extends OneParamOperator {

    public getDefaultRepresentation():string {
        return "X";
    }

    public getReverseRepresentation(): string {
        return "Y";
    }

    evaluateInternal(condition: number, direction:number=Proposition.DEFAULT_DIRECTION, evaluationWindow: EvaluationWindow|undefined): PropositionStatus {
        let status:PropositionStatus = this.operand.evaluateInternal(condition+direction, Proposition.DEFAULT_DIRECTION, evaluationWindow);

        return status;
    }


    public static getAlphabet():string {
        return "X|O";
    }
}