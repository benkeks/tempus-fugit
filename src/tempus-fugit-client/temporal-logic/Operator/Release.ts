///<reference path="OneParamOperator.ts"/>
import {TwoParamOperator} from "./TwoParamOperator";
import {PropositionStatus} from "../Proposition";

export class Release extends TwoParamOperator {

    public getDefaultRepresentation():string {
        return "R";
    }

    evaluateInternal(condition: number): PropositionStatus {
        let leftStatus:PropositionStatus=this.leftOperand.evaluateInternal(condition);
        let rightStatus:PropositionStatus=this.rightOperand.evaluateInternal(condition);

        let status:PropositionStatus = new PropositionStatus();
        let i:number = condition;

        status.value = true;
        status.successful = false;
        status.minStatus = Math.min(leftStatus.minStatus, rightStatus.minStatus);
        while (i<status.minStatus && i>= 0 && leftStatus.successful && rightStatus.successful) {
            status.successful = true;

            if (!rightStatus.value) {
                status.value = false;
                break;
            }

            if (leftStatus.value && rightStatus.value) {
                break;
            }

            i+=this.direction;
            leftStatus = this.leftOperand.evaluateInternal(i);
            rightStatus = this.rightOperand.evaluateInternal(i);
        }
        return status;
    }


    public static getAlphabet():string {
        return "R";
    }
}