///<reference path="proposition.ts"/>
import {Proposition, PropositionStatus} from "./proposition";

export class Variable extends Proposition {
    get representation(): string {
        return this._representation;
    }

    set representation(value: string) {
        this._representation = value;
    }

    get values(): boolean[] {
        return this._values;
    }

    set values(value: boolean[]) {
        this._values = value;
        this.firstValue = 0;
    }

    public static getAlphabet(): string {
        return "[a-z](?:[a-z0-9])*";
    }

    protected _values:boolean[] = [];
    private firstValue:number = 0;

    public getDefaultRepresentation():string {
        return this.representation;
    }
    public static varCount:number = 0;
    public defaultValueFuture:boolean = false;
    public defaultValuePast:boolean = false;
    public finiteStatesFuture:boolean = true;
    public finiteStatesPast:boolean = true;

    public setDefaultValue(value:boolean) {
        this.defaultValuePast = value;
        this.defaultValueFuture = value;
    }

    evaluateInternal(condition:number, direction:number=Proposition.DEFAULT_DIRECTION): PropositionStatus {
        let pstat : PropositionStatus = new PropositionStatus();

        pstat.successful = true;
        pstat.valuesLength = this._values.length;
        pstat.value = this.getValue(condition);
        if (this.finiteStatesFuture) {
            pstat.maxStatus = this.firstValue + this._values.length-1;
        } else {
            pstat.maxStatus = this.firstValue + pstat.valuesLength;
        }

        if (this.finiteStatesPast) {
            pstat.minStatus = this.firstValue;
        } else {
            pstat.minStatus = this.firstValue - 1;
        }

        if ((condition > pstat.maxStatus && this.finiteStatesFuture) || (condition < pstat.minStatus && this.finiteStatesPast)) {
            pstat.successful = false;
        }

        return pstat;
    }

    generateRepresentation(recursive:boolean, defaultRepresentation=true, direction:number=Proposition.DEFAULT_DIRECTION): string {
        return this.representation;
    }


    /**
     * @author Tobias Loch
     * @description Returns a value at agiven temporal state. This value can be negative or positive. This function should be used if finitstate is false.
     * @param state the state that you want to set. Can be negative aswell as positive numbers.
     * @return boolean value of temporal state
     * @example
     * let v:Variable = new Variable("v");
     * v.setValue(true,3);
     * v.setValue(false,-1);
     * console.log(v.getValue(3)); //output:true
     * console.log(v.getValue(0)); //output: as defaultValue: true
     * console.log(v.getValue(-1));//output:false
     * */
    public getValue(state:number):boolean {
        state-=this.firstValue;
        if (state >= 0 && state < this.values.length) {
            return this.values[state];
        } else {
            if (state < 0) return this.defaultValuePast;
            else return this.defaultValueFuture;
        }
    }


    /**
     * @author Tobias Loch
     * @description Sets the Value of a given state (default:after last given state). If the state index is not existent in values array, then it
     * creates as much new states as needed(default:this.defaultvalue) to set the given state. Works also with negative states. This function should be used if finitstate is false.
     * @param value the value that should be set
     * @param state the state that you want to set. Can be negative aswell as positive numbers.
     * @example
     * let v:Variable = new Variable("v");
     * v.setValue(true,3);
     * v.setValue(false,-2);
     * console.log(v.getValue(3)); //output:true
     * console.log(v.getValue(0)); //output: as defaultValue: false
     * console.log(v.getValue(-2));//output:false
     * */
    public setValue(value:boolean, state:number = this.values.length):void {
        state -= this.firstValue;
        while(state >= this.values.length || state < 0) {
            if (state >= this.values.length) {
                this.values.push(this.defaultValueFuture);
            } else {
                this.values.unshift(this.defaultValuePast);
                this.firstValue--;
                state++;
            }
        }
        this.values[state] = value;
    }

    public setAllFalse():void {
        for (let i in this._values) {
            this._values[i] = false;
        }
    }

    public copy():Variable {
        let v:Variable = new Variable(this.representation);
        v.applyAssignment(this);

        return v;
    }

    constructor(representation:string="v"+Variable.varCount++, value:boolean[]=[]) {
        super(representation);
        this._values = value;
    }

    public applyAssignment(assignment):void {
        if (assignment instanceof Array) {
            var somethingIsNotBoolean = false;
            assignment.forEach(function(item){
                if(typeof item !== 'boolean'){
                    somethingIsNotBoolean = true;
                }
            });

            if (somethingIsNotBoolean) return;

            this.values = [...assignment];
        } else if (assignment instanceof Variable) {
            this.defaultValueFuture = assignment.defaultValueFuture;
            this.defaultValuePast = assignment.defaultValuePast;
            this.finiteStatesFuture = assignment.finiteStatesFuture;
            this.finiteStatesPast = assignment.finiteStatesPast;
            this.applyAssignment(assignment.values);
        } else {
            console.warn("The given assignment is neither a boolean array nor a variable! typeof assignment" + typeof assignment);
        }
    }
}