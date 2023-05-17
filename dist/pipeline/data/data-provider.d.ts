export declare type Formula = string;
export declare type Expression = {
    formula: Formula;
};
declare type NumberResolution = number | Formula | Expression | undefined;
export declare function useDataProvider(): {
    calc: (value: NumberResolution, defaultValue?: number) => number | {
        valueOf(): number;
    };
    calcBuffer: (value: Float32Array | NumberResolution[], defaultValue?: number) => Float32Array | {
        valueOf(): Float32Array;
    };
};
export {};
