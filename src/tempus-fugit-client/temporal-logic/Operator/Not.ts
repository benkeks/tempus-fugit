///<reference path="OneParamOperator.ts"/>
import {OneParamOperator} from "./OneParamOperator";
import {PropositionStatus} from "../Proposition";

export class Not extends OneParamOperator {


    public getDefaultRepresentation():string {
        return "!";
    }

    evaluateInternal(condition: number): PropositionStatus {
        let operandStatus:PropositionStatus=this.operand.evaluateInternal(condition);

        let status:PropositionStatus = new PropositionStatus();
        status.successful = operandStatus.successful;
        status.minStatus = operandStatus.minStatus;
        status.value = !operandStatus.value;

        return status;
    }


    public static getAlphabet():string {
        return "!";
    }
}