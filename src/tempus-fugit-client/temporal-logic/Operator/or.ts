///<reference path="two-param-operator.ts"/>
import {TwoParamOperator} from "./two-param-operator";
import {PropositionStatus} from "../proposition";

export class Or extends TwoParamOperator {

    public static getDefaultUnicodeRepresentation(x): string {
        return "\u2228";
    }

    public getDefaultRepresentation():string {
        return "\\|";
    }

    evaluateInternal(condition: number): PropositionStatus {
        let leftStatus:PropositionStatus=this.leftOperand.evaluateInternal(condition);
        let rightStatus:PropositionStatus=this.rightOperand.evaluateInternal(condition);

        let status:PropositionStatus = new PropositionStatus();
        status.successful = leftStatus.successful || rightStatus.successful;
        status.maxStatus = Math.max(leftStatus.maxStatus, rightStatus.maxStatus);
        status.minStatus = Math.min(leftStatus.minStatus, rightStatus.minStatus);
        status.value = leftStatus.value || rightStatus.value;

        return status;
    }

    public static getAlphabet():string {
        return "\\||\\+";
    }
}