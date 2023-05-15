import { Context } from "./use-action-pipeline";
export declare type ExecutionStep = (time: number, context: Context) => (() => void) | void | undefined;
export default function useScriptExecution(): {
    executeSteps: (steps: ExecutionStep[], time: number, context: Context, cleanupActions: (() => void)[]) => void;
};
