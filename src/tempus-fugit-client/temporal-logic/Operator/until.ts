///<reference path="one-param-operator.ts"/>
import {TwoParamOperator} from "./two-param-operator";
import {PropositionStatus} from "../proposition";

export class Until extends TwoParamOperator {

    public getDefaultRepresentation():string {
        return "U";
    }

    evaluateInternal(condition: number): PropositionStatus {
        let leftStatus:PropositionStatus=this.leftOperand.evaluateInternal(condition);
        let rightStatus:PropositionStatus=this.rightOperand.evaluateInternal(condition);

        let status:PropositionStatus = new PropositionStatus();
        let i:number = condition;

        status.value = true;
        status.successful = false;
        status.maxStatus = Math.max(leftStatus.maxStatus, rightStatus.maxStatus);
        status.minStatus = Math.min(leftStatus.minStatus, rightStatus.minStatus);
        while (i<=status.maxStatus && i>= status.minStatus && leftStatus.successful && rightStatus.successful) {
            status.successful = true;

            if (rightStatus.value) {
                break;
            }

            if (!leftStatus.value) {
                status.value = false;
                break;
            }

            i+=this.direction;
            leftStatus = this.leftOperand.evaluateInternal(i);
            rightStatus = this.rightOperand.evaluateInternal(i);
        }
        return status;
    }


    public static getAlphabet():string {
        return "U";
    }
}