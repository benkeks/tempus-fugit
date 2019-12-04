///<reference path="../proposition.ts"/>
///<reference path="operator.ts"/>
import {Operator} from "./operator";
import {Proposition} from "../proposition";

export abstract class TwoParamOperator extends Operator{
    leftOperand:Proposition;
    rightOperand:Proposition;

    associativity = Operator.LEFT_ASSOCIATIVE;

    precedence = 3;

    constructor(representation:string=undefined, leftOperand:Proposition=null, rightOperand:Proposition=null) {
        super(representation);
        this.leftOperand = leftOperand;
        this.rightOperand = rightOperand;
    }

    generateRepresentation(recursive: boolean): string {
        if (!recursive) return this.representation;
        let representation:string = this.representation;


        if (this.leftOperand instanceof Operator && (<Operator>this.leftOperand).precedence < this.precedence) {
            representation = " (" + this.leftOperand.generateRepresentation(recursive) + ") " + representation;
        } else {
            representation = this.leftOperand.generateRepresentation(recursive) + " " + representation;
        }


        if (this.rightOperand instanceof Operator && (<Operator>this.rightOperand).precedence <= this.precedence) {
            representation = representation + " (" + this.rightOperand.generateRepresentation(recursive) + ") ";
        } else {
            representation = representation + " " + this.rightOperand.generateRepresentation(recursive);
        }

        return representation;
    }
}