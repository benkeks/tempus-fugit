import {TwoParamOperator} from "./two-param-operator";
import {Proposition, PropositionStatus} from "../proposition";

export class Equivalence extends TwoParamOperator {


    public getDefaultRepresentation():string {
        return "=";
    }

    precedence = 2;

    evaluateInternal(condition: number, direction:number=Proposition.DEFAULT_DIRECTION): PropositionStatus {
        let leftStatus:PropositionStatus=this.leftOperand.evaluateInternal(condition, direction);
        let rightStatus:PropositionStatus=this.rightOperand.evaluateInternal(condition, direction);

        let status:PropositionStatus = new PropositionStatus();
        status.successful = leftStatus.successful || rightStatus.successful;
        status.maxStatus = Math.max(leftStatus.maxStatus, rightStatus.maxStatus);
        status.minStatus = Math.min(leftStatus.minStatus, rightStatus.minStatus);

        status.value = (leftStatus.value && rightStatus.value) || (!leftStatus.value && !rightStatus.value);

        return status;
    }

    public static getAlphabet():string {
        return "<->|<=>|=";
    }
}