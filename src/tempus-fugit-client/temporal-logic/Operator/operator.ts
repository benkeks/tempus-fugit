///<reference path="../proposition.ts"/>


import {Proposition} from "../proposition";

export abstract class Operator extends Proposition {
    public precedence:number;
    public associativity:number = Operator.LEFT_ASSOCIATIVE;

    public static LEFT_ASSOCIATIVE:number = 0;
    public static RIGHT_ASSOCIATIVE:number = 1;

    constructor(representation:string=undefined) {
        super(representation);
    }
}