import * as math from "mathjs";

import { useCallback } from "react";

export type Formula = string

export type Expression = {
    formula: Formula;
}

type NumberResolution = number | Formula | Expression | undefined;

export function useDataProvider() {
    const calc = useCallback((value: NumberResolution, defaultValue: number = 0) => {
        if (typeof(value) === "number") {
            return value;
        }
        if (value === undefined) {
            return {
                valueOf() {
                    return defaultValue;
                }
            };
        }
        const parsed = math.parse(typeof(value) === "string" ? value : value.formula);
        const evaluator = parsed.compile();
        return {
            valueOf(): number {
                const result = evaluator.evaluate();
                return typeof(result) === "number" ? result : defaultValue;
            }
        };
    }, []);

    const calcBuffer = useCallback((value: Float32Array | NumberResolution[], defaultValue: number = 0) => {
        if (value instanceof Float32Array) {
            return value;
        }
        const float32Array = new Float32Array(value.length);
        const compiledArray = value.map(value => calc(value, defaultValue));
        return {
            valueOf(): Float32Array {
                for (let i = 0; i < compiledArray.length; i++) {
                    float32Array[i] = compiledArray[i].valueOf();
                }
                return float32Array;
            }
        };
    }, [calc]);

    return { calc, calcBuffer };
}