///<reference path="one-param-operator.ts"/>
import {TwoParamOperator} from "./two-param-operator";
import {Proposition, PropositionStatus} from "../proposition";

export class Release extends TwoParamOperator {

    public getDefaultRepresentation():string {
        return "R";
    }

    public getReverseRepresentation(): string {
        return "S";
    }

    evaluateInternal(condition: number, direction:number=Proposition.DEFAULT_DIRECTION): PropositionStatus {
        let leftStatus:PropositionStatus=this.leftOperand.evaluateInternal(condition, Proposition.DEFAULT_DIRECTION);
        let rightStatus:PropositionStatus=this.rightOperand.evaluateInternal(condition, Proposition.DEFAULT_DIRECTION);

        let status:PropositionStatus = new PropositionStatus();
        let i:number = condition;

        status.value = true;
        status.successful = false;
        status.maxStatus = Math.max(leftStatus.maxStatus, rightStatus.maxStatus);
        status.minStatus = Math.min(leftStatus.minStatus, rightStatus.minStatus);
        while (i<=status.maxStatus && i>= status.minStatus && leftStatus.successful && rightStatus.successful) {
            status.successful = true;

            if (!rightStatus.value) {
                status.value = false;
                break;
            }

            if (leftStatus.value && rightStatus.value) {
                break;
            }

            i+=direction;
            leftStatus = this.leftOperand.evaluateInternal(i, Proposition.DEFAULT_DIRECTION);
            rightStatus = this.rightOperand.evaluateInternal(i, Proposition.DEFAULT_DIRECTION);
        }
        return status;
    }


    public static getAlphabet():string {
        return "R";
    }
}