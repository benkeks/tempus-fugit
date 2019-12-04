///<reference path="one-param-operator.ts"/>
import {OneParamOperator} from "./one-param-operator";
import {PropositionStatus} from "../proposition";

export class Not extends OneParamOperator {

    public getDefaultRepresentation():string {
        return "!";
    }

    evaluateInternal(condition: number): PropositionStatus {
        let operandStatus:PropositionStatus=this.operand.evaluateInternal(condition);

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