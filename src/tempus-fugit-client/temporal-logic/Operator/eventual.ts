///<reference path="one-param-operator.ts"/>
import {OneParamOperator} from "./one-param-operator";
import {Proposition, PropositionStatus} from "../proposition";

export class Eventual extends OneParamOperator {

    public getDefaultRepresentation():string {
        return "E";
    }

    public getReverseRepresentation(): string {
        return "F";
    }

    evaluateInternal(condition: number, direction:number=Proposition.DEFAULT_DIRECTION): PropositionStatus {
        let operandStatus:PropositionStatus=this.operand.evaluateInternal(condition, Proposition.DEFAULT_DIRECTION);

        let status:PropositionStatus = new PropositionStatus();
        let i:number = condition;

        status.value = false;
        status.successful = false;
        status.maxStatus = operandStatus.maxStatus;
        status.minStatus = operandStatus.minStatus;
        const upperBound = direction > 0 ? status.maxStatus : condition;
        while (i<=upperBound && !status.value && i >= status.minStatus && operandStatus.successful) {
            status.value = operandStatus.value;
            status.successful = true;

            i+=direction;
            operandStatus = this.operand.evaluateInternal(i, Proposition.DEFAULT_DIRECTION);
        }
        return status;
    }


    public static getAlphabet():string {
        return "E|F";
    }
}