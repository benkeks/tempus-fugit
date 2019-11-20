///<reference path="../Proposition.ts"/>
///<reference path="Operator.ts"/>
import {Operator} from "./Operator";
import {Proposition} from "../Proposition";
import {TwoParamOperator} from "./TwoParamOperator";

export abstract class OneParamOperator extends Operator{
    public get operand(): Proposition {
        return this._operand;
    }

    public set operand(value: Proposition) {
        this._operand = value;
    }
    protected _operand:Proposition;
    associativity = Operator.RIGHT_ASSOCIATIVE;

    constructor(representation:string=undefined, operand:Proposition=null) {
        super(representation);
        this.operand = operand;

        this.precedence = 4;
    }

    generateRepresentation(recursive: boolean): string {
        if (!recursive) return this.representation;
        let representation:string = "";

        if (this._operand instanceof TwoParamOperator) {
            representation = "(" + this._operand.generateRepresentation(recursive) + ")";
        } else {
            representation = this._operand.generateRepresentation(recursive);
        }

        if (this.associativity == Operator.LEFT_ASSOCIATIVE) {
            return (representation + this.representation);
        } else {
            return (this.representation + representation);
        }
    }
}