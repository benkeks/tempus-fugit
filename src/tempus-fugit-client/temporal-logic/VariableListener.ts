import {Variable} from "./Variable";

export interface VariableListener {
    valuesChanged(variable:Variable):void;
    representationChanged(variable:Variable):void;
}