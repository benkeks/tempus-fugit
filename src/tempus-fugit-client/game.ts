document.body.innerText = "Hello World";

class test {
    public static count:number = 0;
    public testFunction(text:string):void {
        console.log(text + ";count="+test.count++);
    }
}

let c:test[] = [new test(), new test(), new test()];
let a:string[] = ["test"];
c.map(obj => obj.testFunction("test"));