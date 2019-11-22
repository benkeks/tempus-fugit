///<reference path="one-param-operator.ts"/>
import {OneParamOperator} from "./one-param-operator";
import {PropositionStatus} from "../proposition";

export class Global extends OneParamOperator {


    public getDefaultRepresentation():string {
        return "G";
    }

    evaluateInternal(condition: number): PropositionStatus {
        let operandStatus:PropositionStatus=this.operand.evaluateInternal(condition);

        let status:PropositionStatus = new PropositionStatus();
        let i:number = condition;

        status.value = true;
        status.successful = false;
        status.minStatus = operandStatus.minStatus;
        while (i<status.minStatus && status.value && i>= 0 && operandStatus.successful) {
            status.value = operandStatus.value;
            status.successful = true;

            i+=this.direction;
            operandStatus = this.operand.evaluateInternal(i);
        }
        return status;
    }


    public static getAlphabet():string {
        return "G";
    }
}