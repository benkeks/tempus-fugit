///<reference path="one-param-operator.ts"/>
import {TwoParamOperator} from "./two-param-operator";
import {EvaluationWindow, Proposition, PropositionStatus} from "../proposition";

export class Release extends TwoParamOperator {

    public getDefaultRepresentation():string {
        return "R";
    }

    public getReverseRepresentation(): string {
        return "S";
    }

    evaluateInternal(condition: number, direction:number=Proposition.DEFAULT_DIRECTION, evaluationWindow: EvaluationWindow|undefined): PropositionStatus {
        let leftStatus:PropositionStatus=this.leftOperand.evaluateInternal(condition, Proposition.DEFAULT_DIRECTION, evaluationWindow);
        let rightStatus:PropositionStatus=this.rightOperand.evaluateInternal(condition, Proposition.DEFAULT_DIRECTION, evaluationWindow);

        let status:PropositionStatus = new PropositionStatus();
        let i:number = condition;

        status.value = true;
        status.successful = false;
        status.maxStatus = Math.max(leftStatus.maxStatus, rightStatus.maxStatus);
        status.minStatus = Math.min(leftStatus.minStatus, rightStatus.minStatus);
        evaluationWindow = {
            endState: evaluationWindow ? evaluationWindow.endState : status.maxStatus,
            startState: evaluationWindow ? evaluationWindow.startState: status.minStatus
        }
        while (i<=evaluationWindow.endState && i>= evaluationWindow.startState && leftStatus.successful && rightStatus.successful) {
            status.successful = true;

            if (!rightStatus.value) {
                status.value = false;
                break;
            }

            if (leftStatus.value && rightStatus.value) {
                break;
            }

            i+=direction;
            leftStatus = this.leftOperand.evaluateInternal(i, Proposition.DEFAULT_DIRECTION, evaluationWindow);
            rightStatus = this.rightOperand.evaluateInternal(i, Proposition.DEFAULT_DIRECTION, evaluationWindow);
        }
        return status;
    }


    public static getAlphabet():string {
        return "R";
    }
}