///<reference path="one-param-operator.ts"/>
import {OneParamOperator} from "./one-param-operator";
import {EvaluationWindow, Proposition, PropositionStatus} from "../proposition";

export class Eventual extends OneParamOperator {

    public getDefaultRepresentation():string {
        return "E";
    }

    public getReverseRepresentation(): string {
        return "F";
    }

    evaluateInternal(condition: number, direction:number=Proposition.DEFAULT_DIRECTION, evaluationWindow: EvaluationWindow|undefined): PropositionStatus {
        let operandStatus:PropositionStatus=this.operand.evaluateInternal(condition, Proposition.DEFAULT_DIRECTION, evaluationWindow);

        let status:PropositionStatus = new PropositionStatus();
        let i:number = condition;

        status.value = false;
        status.successful = false;
        status.maxStatus = operandStatus.maxStatus;
        status.minStatus = operandStatus.minStatus;
        evaluationWindow = {
            endState: evaluationWindow ? evaluationWindow.endState : status.maxStatus,
            startState: evaluationWindow ? evaluationWindow.startState: status.minStatus
        }
        while (i<=evaluationWindow.endState && !status.value && i >= evaluationWindow.startState && operandStatus.successful) {
            status.value = operandStatus.value;
            status.successful = true;

            i+=direction;
            operandStatus = this.operand.evaluateInternal(i, Proposition.DEFAULT_DIRECTION, evaluationWindow);
        }
        return status;
    }


    public static getAlphabet():string {
        return "E|F";
    }
}