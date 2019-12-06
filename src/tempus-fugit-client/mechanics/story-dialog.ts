import {Game} from "./game";

export class StoryDialog {

    public text:string[][];
    public activeLine:number = -1;

    public triggerFunction:Function;

    public isTriggered(game:Game):boolean {
        return this.triggerFunction(game);
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