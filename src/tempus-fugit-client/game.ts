import {Formula} from "./temporal-logic/Formula";


let f:Formula = new Formula("a&b-Ga");
f.variables['a'].values = [true,true,true,true, false];
f.variables['b'].values = [true,false,true, false];

document.body.innerText = "Hello World\nformula=" + f.generateRepresentation(true) + "\nevaluate=" + f.evaluate(0);
