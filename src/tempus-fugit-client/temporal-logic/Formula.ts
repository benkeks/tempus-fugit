///<reference path="Proposition.ts"/>
import {Proposition, PropositionStatus} from "./Proposition";
import {Variable} from "./Variable";
import {And} from "./Operator/And";
import {Eventual} from "./Operator/Eventual";
import {Global} from "./Operator/Global";
import {Next} from "./Operator/Next";
import {Not} from "./Operator/Not";
import {Or} from "./Operator/Or";
import {Bracket} from "./Operator/Bracket";
import {Consequence} from "./Operator/Consequence";
import {Equivalence} from "./Operator/Equivalence";
import {Reverse} from "./Operator/Reverse";
import {Operator} from "./Operator/Operator";
import {OneParamOperator} from "./Operator/OneParamOperator";
import {TwoParamOperator} from "./Operator/TwoParamOperator";
import {Until} from "./Operator/Until";
import {Release} from "./Operator/Release";

export class Formula extends Proposition {
    public hjunctor:Proposition = undefined;

    public static readonly temporalLogicClasses:any[] = [And, Eventual, Global, Next, Not, Or, Variable, Bracket, Equivalence, Consequence, Reverse, Until, Release];

    /**
     * @author Tobias Loch
     * @description This dictionary contains all variables in the formula. It can be used to set the states of the variables. It will be set by the parse function.
     * @readonly
     *
     * */
    public variables:{[represenstation:string]:Variable} = {};

    evaluateInternal(condition: number): PropositionStatus {
        return this.hjunctor.evaluateInternal(condition);
    }

    generateRepresentation(recursive:boolean = true): string {
        if (!recursive) {
            return this.representation;
        }
        else {
            return this.hjunctor.generateRepresentation(recursive);
        }
    }

    public static getAlphabet(): string {
        let alphabet:string = "";

        for (let i:number = 0; i < this.temporalLogicClasses.length; i++) {
            let c = this.temporalLogicClasses[i];

            alphabet += c.getAlphabet();
            if (i < this.temporalLogicClasses.length-1) alphabet += "|";
        }

        return alphabet;
    }


    public static generateProposition(representation:string):Proposition {
        let classes:any = this.temporalLogicClasses;

        for (let i in classes) {
            let c =classes[i];

            let regex:RegExp = new RegExp(c.getAlphabet());
            if (regex.test(representation)) {
                if (typeof c === typeof Reverse) {

                }

                let p:Proposition = new c(representation);
                return p;
            }
        }

        return null;
    }

    /**
     * @author Tobias Loch
     * @param representation the representation of the formula. If hjunctor is not given or undefined, the constructor calls parse(representation).
     * @param hjunctor the main junctor of the formula
     * */
    constructor(representation:string=undefined, hjunctor:Proposition=undefined) {
        super(representation);
        this.hjunctor = hjunctor;

        if (hjunctor == undefined && representation != undefined) {
            this.parse(representation);
        }
    }

    /**
     * @author Tobias Loch
     * @param formula the string representation of the temporal logic formula
     * @return a list of propositions that represent the given string
     * @description scans the string for propositions and creates objects for them. Syntax:
     * <table class="tg", style="width:100%"><tr><th class="tg-0lax">Type</th><th class="tg-0lax">Syntax</th></tr><tr><td class="tg-0lax">Variable</td><td class="tg-0lax">[a-z][a-z0-9]*</td></tr><tr><td class="tg-0lax">And</td><td class="tg-0lax">&amp;</td></tr><tr><td class="tg-0lax">Or</td><td class="tg-0lax">| or +</td></tr><tr><td class="tg-0lax">Not</td><td class="tg-0lax">!</td></tr><tr><td class="tg-0lax">Consequence</td><td class="tg-0lax">&lt;-, &lt;=, -&gt;, =&gt; or -</td></tr><tr><td class="tg-0lax">Equivalence</td><td class="tg-0lax">&lt;-&gt;, &lt;=&gt; or =</td></tr><tr><td class="tg-0lax">Eventual</td><td class="tg-0lax">E or F</td></tr><tr><td class="tg-0lax">Global</td><td class="tg-0lax">G</td></tr><tr><td class="tg-0lax">Next</td><td class="tg-0lax">X or O</td></tr><tr><td class="tg-0lax">Until</td><td class="tg-0lax">U</td></tr><tr><td class="tg-0lax">Release</td><td class="tg-0lax">R</td></tr><tr><td class="tg-0lax">Reverse</td><td class="tg-0lax">#</td></tr></table>
     *
     * @example
     * let props:Proposition[] = Formula.scan("(a->b)&b->Ga");
     * for (let i in props) {
     *     let p:Proposition = props[i];
     *     console.log(p.representation + "(" + p.constructor.name + ")");
     * }
     *  output:
     * a(Variable)
     * ->(Consequence)
     * X(Next)
     * b(Variable)
     * */
    public static scan(formula:string):Proposition[] {
        let tempLogicSyntax:RegExp = new RegExp(this.getAlphabet(), 'g');
        let arr;
        let list:Proposition[] = [];

        let regex:RegExp = new RegExp("^((" + this.getAlphabet() + ")\\s*)*$");
        if (!regex.test(formula)) {
            console.warn("WARNING: Formula (" + formula + ") contains non Temporal logic characters! They will be ignored.");
        }

        while((arr = tempLogicSyntax.exec(formula)) !== null) {
            let p:Proposition = this.generateProposition(arr[0]);

            if (p != null) {
                list.push(p);
            }
        }

        return list;
    }

    /**
     * @author Tobias Loch
     * @param formula a string representation of the temporal logic formula or a list of propositions
     * @return the main junctor of the formula
     * @description Parses the propositions into a syntax tree by using the Shunting-Yard-Algorithm. Syntax:
     * <table class="tg" style="width:100%;">  <tr>    <th class="tg-0lax">Type</th>    <th class="tg-0lax">Syntax</th>    <th class="tg-0lax">Associativity</th>    <th class="tg-0lax">Priority</th>  </tr>  <tr>    <td class="tg-0lax">Variable</td>    <td class="tg-0lax">[a-z][a-z0-9]*</td>    <td class="tg-0lax">None</td>    <td class="tg-0lax">None</td>  </tr>  <tr>    <td class="tg-0lax">And</td>    <td class="tg-0lax">&amp;</td>    <td class="tg-0lax">Left</td>    <td class="tg-0lax">3</td>  </tr>  <tr>    <td class="tg-0lax">Or</td>    <td class="tg-0lax">| or +</td>    <td class="tg-0lax">Left</td>    <td class="tg-0lax">3</td>  </tr>  <tr>    <td class="tg-0lax">Not</td>    <td class="tg-0lax">!</td>    <td class="tg-0lax">Right</td>    <td class="tg-0lax">4</td>  </tr>  <tr>    <td class="tg-0lax">Consequence</td>    <td class="tg-0lax">leftassociative: &lt;- or &lt;=<br>rightassociative: -&gt;, =&gt; or -</td>    <td class="tg-0lax">both</td>    <td class="tg-0lax">2</td>  </tr>  <tr>    <td class="tg-0lax">Equivalence</td>    <td class="tg-0lax">&lt;-&gt;, &lt;=&gt; or =</td>    <td class="tg-0lax">Left</td>    <td class="tg-0lax">2</td>  </tr>  <tr>    <td class="tg-0lax">Eventual</td>    <td class="tg-0lax">E or F</td>    <td class="tg-0lax">Right</td>    <td class="tg-0lax">4</td>  </tr>  <tr>    <td class="tg-0lax">Global</td>    <td class="tg-0lax">G</td>    <td class="tg-0lax">Right</td>    <td class="tg-0lax">4</td>  </tr>  <tr>    <td class="tg-0lax">Next</td>    <td class="tg-0lax">X or O</td>    <td class="tg-0lax">Right</td>    <td class="tg-0lax">4</td>  </tr>  <tr>    <td class="tg-0lax">Until</td>    <td class="tg-0lax">U</td>    <td class="tg-0lax">Left</td>    <td class="tg-0lax">3</td>  </tr>  <tr>    <td class="tg-0lax">Release</td>    <td class="tg-0lax">R</td>    <td class="tg-0lax">Left</td>    <td class="tg-0lax">3</td>  </tr>  <tr>    <td class="tg-0lax">Reverse</td>    <td class="tg-0lax">#</td>    <td class="tg-0lax">Right</td>    <td class="tg-0lax">4</td>  </tr></table>
     * <i>Note: The Reverse Operator reverses the direction of n temporal operator.</i>
     * @example this function gets immidiatly called if the constructor has no hjunctor given and the representation is not empty. So for an example check out the example of the Propositions evaluate function
     * */
    public parse(formula:any):Proposition {
        if (typeof formula === "string") {
            return this.parse(Formula.scan(formula as string));
        } else if (!(formula instanceof Array)) {
            let somethingIsNotString = false;
            formula.forEach(function(item:any){
                if(typeof item !== 'string'){
                    somethingIsNotString = true;
                }
            });
            if(somethingIsNotString || formula.length == 0){
                throw new Error("Formula has to be of type String or Proposition[]");
            }
        }

        let operatorStack:Operator[] = [];
        let outputQueue:Proposition[] = [];
        this.variables = {};

        for (let i in formula) {
            let token:Proposition = formula[i];

            if (token instanceof Bracket) {
                if (token.isOpenBracket()) {
                    operatorStack.push(token);
                } else {
                    while(operatorStack.length >0) {
                        let o:Operator=operatorStack.pop();

                        if (o instanceof Bracket) {
                            if (o.isOpenBracket()) break;
                        }

                        if (operatorStack.length==0) {
                            throw new Error("The number of open and close brackets is not equal!");
                        }

                        outputQueue.push(o);
                    }
                }
            } else if (token instanceof Operator) {
                let o:Operator = token as Operator;
                while(operatorStack.length> 0
                && ((operatorStack[operatorStack.length-1].precedence > o.precedence
                    || (operatorStack[operatorStack.length-1].precedence == o.precedence && operatorStack[operatorStack.length-1].associativity == Operator.LEFT_ASSOCIATIVE))
                    && (!(operatorStack[operatorStack.length-1] instanceof Bracket))
                )) {
                    outputQueue.push(operatorStack.pop());
                }

                operatorStack.push(token);
            } else if (token instanceof Variable) {
                if (token.representation in this.variables) {
                    token = this.variables[token.representation];
                } else {
                    this.variables[token.representation] = token;
                }

                outputQueue.push(token);
            } else {
                throw new Error("A Token is being read which type is not known!");
            }
        }

        while(operatorStack.length>0) {
            let p:Proposition=operatorStack.pop();
            if (p instanceof Bracket) {
                throw new Error("The number of open and close brackets is not equal!");
            }
            outputQueue.push(p);
        }

        if (outputQueue.length > 0){
            this.hjunctor = outputQueue[outputQueue.length-1];
        }
        for (let i=0; i < outputQueue.length; i++) {
            let p:Proposition= outputQueue[i];

            if (p instanceof Operator) {
                if (p instanceof OneParamOperator) {
                    p.operand = outputQueue[i-1];
                    outputQueue.splice(i-1, 1);
                    i-=1;
                } else if (p instanceof TwoParamOperator) {
                    p.leftOperand = outputQueue[i-2];
                    p.rightOperand = outputQueue[i-1];

                    outputQueue.splice(i-2, 2);
                    i-=2;
                }
            }
        }

        return this.hjunctor;
    }
}