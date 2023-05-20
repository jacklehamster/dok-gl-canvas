import * as math from "mathjs";

import { useCallback } from "react";
import { TypedArray } from "../actions/use-buffer-attributes";
import { Context } from "../use-action-pipeline";

export type Formula = string

export type Expression = {
    formula: Formula;
}

interface TypedArrayConstructor {
    new (size: number): TypedArray;
    BYTES_PER_ELEMENT: number;
}

type SupportedTypes = string | number | TypedArray;

export type NumberResolution = number | Formula | Expression | undefined;
export type BufferResolution = TypedArray | NumberResolution[] | Formula | Expression;
export type StringResolution = string | Formula | Expression | undefined;
export type Resolution = NumberResolution | BufferResolution | StringResolution;

export function useDataProvider() {
    const calculate = useCallback((evaluator: math.EvalFunction, scopes: Record<string, SupportedTypes>[] = [], formula: string | Expression) => {
        const scope = scopes[scopes.length-1];
        try {
            return evaluator.evaluate(scope ?? {});
        } catch (e) {
            console.error("Error: " + e + " on formula: " + formula + ", scope: ", scope);
        }
        return undefined;
    }, []);

    const getFormulaEvaluator = useCallback((value: Formula | Expression) => {
        const formula = typeof(value) === "string" ? value : value.formula;
        if (formula.charAt(0) !== "{" || formula.charAt(formula.length-1) !== "}") {
            throw new Error(`Formula: ${value} must start and end with brackets.`);
        }
        return math.parse(formula.substring(1, formula.length - 1)).compile();
    }, [])

    const calc = useCallback((value: NumberResolution, defaultValue = 0) => {
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
        const evaluator = getFormulaEvaluator(value);
        return {
            valueOf(context?: Context): number {
                const result = calculate(evaluator, context?.storage, value);
                return typeof(result) === "number" ? result : defaultValue;
            }
        };
    }, [getFormulaEvaluator, calculate]);

    const calcBuffer = useCallback((value: BufferResolution, ArrayConstructor: TypedArrayConstructor = Float32Array, defaultValue = 0) => {
        if (value instanceof Float32Array || value instanceof Int8Array || value instanceof Uint8Array
            || value instanceof Int16Array || value instanceof Uint16Array
            || value instanceof Int32Array || value instanceof Uint32Array) {
            return value;
        }
        if (Array.isArray(value)) {
            const array = new ArrayConstructor(value.length);
            const compiledArray = value.map(value => calc(value, defaultValue));
            return {
                valueOf(context?: Context): TypedArray {
                    for (let i = 0; i < compiledArray.length; i++) {
                        array[i] = compiledArray[i].valueOf(context);
                    }
                    return array;
                }
            };    
        }
        const formula = value;
        const evaluator = getFormulaEvaluator(formula);
        let bufferArray: TypedArray;
        return {
            valueOf(context?: Context): TypedArray {
                const value = calculate(evaluator, context?.storage, formula);
                if (value instanceof Float32Array || value instanceof Int8Array || value instanceof Uint8Array
                    || value instanceof Int16Array || value instanceof Uint16Array
                    || value instanceof Int32Array || value instanceof Uint32Array) {
                    return value;
                }
                if (typeof(value) === "number") {
                    if (!bufferArray) {
                        bufferArray = new ArrayConstructor(value / ArrayConstructor.BYTES_PER_ELEMENT);
                    }
                    return bufferArray;
                }
                throw new Error(`Formula ${formula} doesnt't evaluate to a TypedArray.`);
            }
        };
    }, [calc, getFormulaEvaluator, calculate]);

    const calcString = useCallback((value: StringResolution, defaultValue = "") => {
        if (typeof(value) === "string" && (value.charAt(0) !== "{" || value.charAt(value.length-1) !== "}")) {
            return value;
        }
        if (value === undefined) {
            return {
                valueOf() {
                    return defaultValue;
                }
            };
        }
        const evaluator = getFormulaEvaluator(value);
        return {
            valueOf(context?: Context): string {
                const result = calculate(evaluator, context?.storage, value);
                return typeof(result) === "string" ? result : defaultValue;
            }
        };
    }, [getFormulaEvaluator, calculate]);

    const evaluate = useCallback((value: Resolution) => {
        if (value === undefined) {
            return {
                valueOf() {
                    return undefined;
                }
            };
        }
        if (value instanceof Float32Array || value instanceof Int8Array || value instanceof Uint8Array
            || value instanceof Int16Array || value instanceof Uint16Array
            || value instanceof Int32Array || value instanceof Uint32Array) {
            return value;
        }
        if (typeof(value) === "number") {
            return value;
        }
        if (Array.isArray(value)) {
            return calcBuffer(value);
        }
        if (typeof(value) === "string" && (value.charAt(0) !== "{" || value.charAt(value.length-1) !== "}")) {
            return value;
        }
        const evaluator = getFormulaEvaluator(value);
        return {
            valueOf(context?: Context): string | number {
                const result = calculate(evaluator, context?.storage, value);
                return result;
            }
        };
    }, [calcBuffer, calculate, getFormulaEvaluator]);

    return { calc, calcBuffer, calcString, evaluate };
}