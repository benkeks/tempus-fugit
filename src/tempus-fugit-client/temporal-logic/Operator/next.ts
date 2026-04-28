///<reference path="one-param-operator.ts"/>
import {OneParamOperator} from "./one-param-operator";
import {Proposition, PropositionStatus} from "../proposition";

export class Next extends OneParamOperator {

    public getDefaultRepresentation():string {
        return "X";
    }

    public getReverseRepresentation(): string {
        return "Y";
    }

    evaluateInternal(condition: number, direction:number=Proposition.DEFAULT_DIRECTION): PropositionStatus {
        let status:PropositionStatus = this.operand.evaluateInternal(condition+direction, Proposition.DEFAULT_DIRECTION);

        // this is heuristically, because O#O (next applied on reverse next) is not cancelling itself out,
        // but since this is only needed to bound computation time
        // this was sufficient enough
        if (direction > 0 && !status.finiteStatesPast) {
            status.minStatus--;
        } else if (!status.finiteStatesFuture) {
            status.maxStatus++;
        }

        return status;
    }


    public static getAlphabet():string {
        return "X|O";
    }
}