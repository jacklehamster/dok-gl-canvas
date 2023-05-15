import { Context } from "./use-action-pipeline";
export declare type ExecutionStep = (context: Context) => void;
export default function useScriptExecution(): {
    executeSteps: (steps: ExecutionStep[], context: Context) => void;
};
