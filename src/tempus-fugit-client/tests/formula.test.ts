import { describe, expect, it } from "vitest";
import { Formula } from "../temporal-logic/formula";
import testCases from "./formula-test-data"

function formatStatesTable(states: Record<string, any[]>, highlightIndex?: number) {
  const keys = Object.keys(states)
  const length = Math.max(...keys.map(k => states[k].length))

  const lines: string[] = []

  // header (time indices)
  const header = ['   ', ...Array.from({ length }, (_, i) =>
    i === highlightIndex ? `[${i}]` : ` ${i} `
  )]
  lines.push(header.join(' | '))

  // separator
  lines.push('-'.repeat(header.join(' | ').length))

  // rows (variables)
  for (const key of keys) {
    const row = [
      key.padEnd(3),
      ...Array.from({ length }, (_, i) => {
        const val = states[key][i] ?? false
        return ` ${val} `
      })
    ]
    lines.push(row.join(' | '))
  }

  return lines.join('\n')
}

describe("Formula", () => {
  testCases.forEach(({formula, states, evaluatedState, expected, description}, index) => {
    it(`[${index}] ${formula} @ s=${evaluatedState} with ${JSON.stringify(states)} => ${expected}`, () => {
    
      try {
        const f = new Formula(formula);

        f.applyAssignment(states)

        expect(f.evaluate(evaluatedState)).toBe(expected);
      } catch (err) {
        console.error('\n=== TEST FAILED ===')
        console.error(`description: ${description}`)
        console.error(`Formula: ${formula}`)
        console.error(`Evaluated state: ${evaluatedState}`)
        console.error('States:\n' + formatStatesTable(states))

        throw err // rethrow so Vitest still fails
      }
    });
  })
});