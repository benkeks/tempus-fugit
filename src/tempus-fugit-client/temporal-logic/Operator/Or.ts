///<reference path="TwoParamOperator.ts"/>
import {TwoParamOperator} from "./TwoParamOperator";
import {PropositionStatus} from "../Proposition";

export class Or extends TwoParamOperator {


    public getDefaultRepresentation():string {
        return "\\|";
    }

    evaluateInternal(condition: number): PropositionStatus {
        let leftStatus:PropositionStatus=this.leftOperand.evaluateInternal(condition);
        let rightStatus:PropositionStatus=this.rightOperand.evaluateInternal(condition);

        let status:PropositionStatus = new PropositionStatus();
        status.successful = leftStatus.successful && rightStatus.successful;
        status.minStatus = Math.min(leftStatus.minStatus, rightStatus.minStatus);
        status.value = leftStatus.value || rightStatus.value;

        return status;
    }

    public static getAlphabet():string {
        return "\\||\\+";
    }
}