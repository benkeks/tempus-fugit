///<reference path="../proposition.ts"/>
///<reference path="operator.ts"/>
import {Operator} from "./operator";
import {Proposition} from "../proposition";
import {TwoParamOperator} from "./two-param-operator";

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

    generateRepresentation(recursive: boolean, defaultRepresentation:boolean=true): string {
        let ownRep:string = this.representation;
        if (defaultRepresentation) {
            ownRep = this.getDefaultRepresentation();
            if (this.direction < 0) ownRep = this.getReverseRepresentation();
        }

        if (!recursive) return ownRep;
        let representation:string = "";

        if (this._operand instanceof TwoParamOperator) {
            representation = " (" + this._operand.generateRepresentation(recursive) + ") ";
        } else {
            representation = this._operand.generateRepresentation(recursive, defaultRepresentation);
        }

        if (this.associativity == Operator.LEFT_ASSOCIATIVE) {
            return (representation + ownRep);
        } else {
            return (ownRep + representation);
        }
    }
}