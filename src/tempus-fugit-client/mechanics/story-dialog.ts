import {Mission} from "./mission";

export class StoryDialog {

    public activeLine:number = -1;
    
    public text:string[][];
    public triggerFunction:Function = undefined;
    public triggerFunctionString:string;

    public parsetriggerFunctionString(triggerFunction:string=undefined) {
        if (!triggerFunction) {
            triggerFunction = this.triggerFunctionString;
        }

        this.triggerFunction = eval("(function(mission){" + triggerFunction + "})");
    }

    public isTriggered(mission:Mission):boolean {
        if (!this.triggerFunction) {
            this.parsetriggerFunctionString();
        }

        return this.triggerFunction(mission);
    }

    public copy():StoryDialog {
        let sd = new StoryDialog([...this.text]);
        sd.triggerFunctionString = this.triggerFunctionString;
        sd.triggerFunction = this.triggerFunction;
        return sd;
    }

    constructor(text:string[][]) {
        this.text = text;
    }

    public readLine():string[] {
        this.activeLine++;
        if (this.activeLine < this.text.length) {
            return this.text[this.activeLine];
        } else return null;
    }

}