///<reference path="../proposition.ts"/>


import {Proposition} from "../proposition";

export abstract class Operator extends Proposition {
    public precedence:number;
    public associativity:number = Operator.LEFT_ASSOCIATIVE;

    // only used for temporal logic operators
    public direction:number = -1;

    public static LEFT_ASSOCIATIVE:number = 0;
    public static RIGHT_ASSOCIATIVE:number = 1;

    public listVariables() {

    }

    constructor(representation:string=undefined) {
        super(representation);
    }
}