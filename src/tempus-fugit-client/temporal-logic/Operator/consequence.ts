import {TwoParamOperator} from "./two-param-operator";
import {PropositionStatus} from "../proposition";
import {Operator} from "./operator";

export class Consequence extends TwoParamOperator {

    set representation(value: string) {
        this._representation = value;

        if (Consequence.isLeft(value)) {
            this.associativity = Operator.LEFT_ASSOCIATIVE;
        } else {
            this.associativity = Operator.RIGHT_ASSOCIATIVE;
        }
    }

    public static getDefaultUnicodeRepresentation(x): string {
        if (Consequence.isLeft(x)) {
            return "\u2190";
        } else if (Consequence.isRight(x)) {
            return "\u2192";
        }

        throw new Error("Consequence is neither left nor right!");
    }

    get representation(): string {
        return this._representation;
    }

    precedence = 2;

    public getDefaultRepresentation():string {
        return "->";
    }

    public static leftDirectionAlphabet:string = "<-|<=";
    public static rightDirectionAlphabet:string = "->|=>|-";

    evaluateInternal(condition: number): PropositionStatus {
        let leftStatus:PropositionStatus=this.leftOperand.evaluateInternal(condition);
        let rightStatus:PropositionStatus=this.rightOperand.evaluateInternal(condition);

        let status:PropositionStatus = new PropositionStatus();
        status.successful = leftStatus.successful || rightStatus.successful;
        status.maxStatus = Math.max(leftStatus.maxStatus, rightStatus.maxStatus);
        status.minStatus = Math.min(leftStatus.minStatus, rightStatus.minStatus);

        if (Consequence.isLeft(this.representation)) {
            status.value = (!rightStatus.value) || leftStatus.value;
        } else {
            status.value = (!leftStatus.value) || rightStatus.value;
        }
        return status;
    }

    public static isLeft(consequence:any):boolean {
        if (typeof consequence === typeof Consequence) {
            return this.isLeft(consequence.representation);
        } else if (typeof consequence === "string") {
            let regex:RegExp = new RegExp(this.leftDirectionAlphabet);
            if (regex.test(consequence as string)) {
                return true;
            }

            regex = new RegExp(this.rightDirectionAlphabet);
            if (regex.test(consequence as string)) {
                return false;
            }

            throw new Error("Consequence is not open nor close, but has to be one of them!");
        } else {
            console.log(typeof(consequence));
            throw new TypeError("Consequence has to be of type Consequence or String");
        }
    }

    public static isRight(consequence:any):boolean {
        return !this.isLeft(consequence);
    }

    public static getAlphabet():string {
        return Consequence.leftDirectionAlphabet + "|" + Consequence.rightDirectionAlphabet;
    }

}