import { describe, expect, it } from "vitest";
import { Formula } from "./formula";

describe("Formula", () => {
  it("evaluates variable states from a parsed formula", () => {
    const formula = new Formula("a");

    formula.variables.a.values = [false, true];

    expect(formula.evaluate(0)).toBe(false);
    expect(formula.evaluate(1)).toBe(true);
  });

  it("evaluates boolean combinations from a parsed formula", () => {
    const formula = new Formula("a&!b");

    formula.variables.a.values = [true];
    formula.variables.b.values = [false];

    expect(formula.evaluate(0)).toBe(true);
  });
});