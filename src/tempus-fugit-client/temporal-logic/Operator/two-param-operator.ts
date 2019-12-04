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

    generateRepresentation(recursive: boolean, defaultRepresentation:boolean=true): string {
        let ownRep:string = this.representation;
        if (defaultRepresentation) ownRep = this.getDefaultRepresentation();

        if (!recursive) return ownRep;
        let representation:string = ownRep;


        if (this.leftOperand instanceof Operator && (<Operator>this.leftOperand).precedence < this.precedence) {
            representation = " (" + this.leftOperand.generateRepresentation(recursive, defaultRepresentation) + ") " + representation;
        } else {
            representation = this.leftOperand.generateRepresentation(recursive, defaultRepresentation) + " " + representation;
        }


        if (this.rightOperand instanceof Operator && (<Operator>this.rightOperand).precedence <= this.precedence) {
            representation = representation + " (" + this.rightOperand.generateRepresentation(recursive, defaultRepresentation) + ") ";
        } else {
            representation = representation + " " + this.rightOperand.generateRepresentation(recursive, defaultRepresentation);
        }

        return representation;
    }
}