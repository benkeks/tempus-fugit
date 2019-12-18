import {Operator} from "./operator";
import {PropositionStatus} from "../proposition";

export class Bracket extends Operator {

    public static openBracketAlphabet:string = "\\(|\\[";
    public static closeBracketAlphabet:string = "\\)|\\]";

    precedence = -1;
    associativity = -1;

    public getDefaultRepresentation():string {
        if (Bracket.isOpenBracket(this)) return "(";
        else return ")";
    }

    evaluateInternal(condition: number): PropositionStatus {
        throw new Error("This function is not defined!");
    }

    generateRepresentation(recursive: boolean): string {
        return this.representation;
    }

    public static getAlphabet() {
        return this.openBracketAlphabet + "|" + this.closeBracketAlphabet;
    }

    public static isOpenBracket(bracket:any):boolean {
        if (typeof bracket === typeof Bracket) {
            return this.isOpenBracket(bracket.representation);
        } else if (typeof bracket === "string") {
            let regex:RegExp = new RegExp(this.openBracketAlphabet);
            if (regex.test(bracket as string)) {
                return true;
            }

            regex = new RegExp(this.closeBracketAlphabet);
            if (regex.test(bracket as string)) {
                return false;
            }

            throw new Error("Bracket is not open nor close, but has to be one of them!");
        } else {
            throw new TypeError("Bracket has to be of type Bracket or String");
        }
    }

    public static isCloseBracket(bracket:any):boolean {
        return !this.isOpenBracket(bracket);
    }

    public isOpenBracket():boolean {
        return Bracket.isOpenBracket(this.representation);
    }
    public isCloseBracket():boolean {
        return Bracket.isCloseBracket(this.representation);
    }

    constructor(representation:string=undefined) {
        super(representation);
   }
}