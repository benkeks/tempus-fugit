    export abstract class Proposition {

        get representation(): string {
            return this._representation;
        }

        set representation(value: string) {
            this._representation = value;
        }

        protected _representation:string;

        public getDefaultRepresentation():string {
            return "";
        }

        /**
         * @author Tobias Loch
         * @param recursive if false it just returns the initiated representation, otherwise it walks through the syntax tree
         * @param defaultRepresentation if true the generator uses default values so that every semantical equivalent term has the same string. If false it generates it by the given characters.
         * @return if recursive=true -> the representation of the proposition and its children
         *          otherwise         -> the representation of the proposition itsself
         * @description generates the representation of this proposition by moving through the syntax tree if recursive is true.
         * @example
         *      let formula:Formula = new Formula("(  Fa ->...b )U c"); // computes a new formula
         *      console.log(formula.generateRepresentation(true, false)); // prints: (Fa->b)Uc
         *      console.log(formula.generateRepresentation(false, false)); // prints: (  Fa ->...b )U c
         *      console.log(formula.generateRepresentation(false, true)); // prints: (Ea->b)Uc
         *
         * */
        public abstract generateRepresentation(recursive:boolean, defaultRepresentation:boolean): string;

        /**
         * @author Tobias Loch
         * @description this function gets called from evaluate. It returns PropositionsStatus, which contains more status information.
         * @param condition the temporal state of the Evaluation
         * @return returns a status struct that contains the boolean value of the Evaluation, the success of the Evaluation and the minimal Condition that the variables can evaluate.
         * */
        public abstract evaluateInternal(condition: number): PropositionStatus;

        /**
         * @author Tobias Loch
         * @description the regular expression of the class. This is used by the scan function of formula.
         * @return string representation of the regular expression
         *
         * */
        public static getAlphabet():string {
            throw new Error("Alphabet not defined!");
        }

        public getAlphabet():string {
            return this.getAlphabet();
        }

        /**
         * @author Tobias Loch
         * @param condition the temporal state that should be evaluated
         * @return the value of the proposition
         * @description evaluates the proposition and returns its logic value
         * @throws RangeError if the formula cant be evaluated, because there are not enough variable states. If you dont want this exception use evaluateInternal.
         *
         * @example
         *      let formula:Formula = new Formula("(a->b)Uc"); // computes a new formula
         *      let vars:{} = formula.variables;
         *      vars['a'].values = [true, false];
         *      vars['b'].values = [false, true];
         *      vars['c'].values = [false, true];
         *      console.log(formula.evaluate(0)); // false
         *      console.log(formula.evaluate(1)); // true
         * */
        public evaluate(condition: number): boolean {
            let status: PropositionStatus = this.evaluateInternal(condition);

            if (!status.successful) {
                return undefined;
            }

            return status.value;
        }

        constructor(representation:string="") {
            if (representation === undefined || representation === ""){
                this.representation = this.getDefaultRepresentation();
            } else {
                this.representation = representation;
            }
        }
    }

    export class PropositionStatus {
        public value: boolean = false;
        public valuesLength:number = 0;

        public minStatus:number = 0; // propositions can be evaluated in range [minStatus,maxStatus]
        public maxStatus:number = 0;

        public successful: boolean = false;
    }
