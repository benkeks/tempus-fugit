///<reference path="one-param-operator.ts"/>
import {OneParamOperator} from "./one-param-operator";
import {EvaluationWindow, Proposition, PropositionStatus} from "../proposition";

export class Not extends OneParamOperator {

    public getDefaultRepresentation():string {
        return "!";
    }

    evaluateInternal(condition: number, direction:number=Proposition.DEFAULT_DIRECTION, evaluationWindow: EvaluationWindow|undefined): PropositionStatus {
        let operandStatus:PropositionStatus=this.operand.evaluateInternal(condition, Proposition.DEFAULT_DIRECTION, evaluationWindow);

        let status:PropositionStatus = new PropositionStatus();
        status.successful = operandStatus.successful;
        status.maxStatus = operandStatus.maxStatus;
        status.minStatus = operandStatus.minStatus;
        status.value = !operandStatus.value;

        return status;
    }


    public static getAlphabet():string {
        return "!";
    }
}