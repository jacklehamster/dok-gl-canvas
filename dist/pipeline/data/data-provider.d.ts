import { TypedArray } from "../actions/use-buffer-attributes";
import { Context } from "../use-action-pipeline";
export declare type Formula = string;
export declare type Expression = {
    formula: Formula;
};
interface TypedArrayConstructor {
    new (size: number): TypedArray;
}
export declare type NumberResolution = number | Formula | Expression | undefined;
export declare type BufferResolution = TypedArray | NumberResolution[] | Formula | Expression;
export declare type StringResolution = string | Formula | Expression | undefined;
export declare type Resolution = NumberResolution | BufferResolution | StringResolution;
export declare function useDataProvider(): {
    calc: (value: NumberResolution, defaultValue?: any) => number | {
        valueOf(): any;
    } | {
        valueOf(context?: Context | undefined): number;
    };
    calcBuffer: (value: BufferResolution, ArrayConstructor?: TypedArrayConstructor, defaultValue?: any) => Uint32Array | Int8Array | Float32Array | Int16Array | Uint8Array | Uint16Array | Int32Array | {
        valueOf(context?: Context | undefined): TypedArray;
    };
    calcString: (value: StringResolution, defaultValue?: any) => string | {
        valueOf(): any;
    } | {
        valueOf(context?: Context | undefined): string;
    };
    evaluate: (value: Resolution) => string | number | {
        valueOf(context?: Context | undefined): TypedArray;
    } | {
        valueOf(): undefined;
    } | {
        valueOf(context?: Context | undefined): string | number;
    };
};
export {};
