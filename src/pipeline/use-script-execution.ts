import { useCallback } from "react";
import { Context } from "./use-action-pipeline";

export type ExecutionStep = (time: number, context: Context) => (() => void) | void | undefined;


export default function useScriptExecution() {
    const executeSteps = useCallback((steps: ExecutionStep[], time: number, context: Context, cleanupActions: (() => void)[]): void => {
        for (let step of steps) {
            const cleanup = step(time, context);
            if (cleanup) {
                cleanupActions.push(cleanup);
            }
        }
    }, []);

    return {
        executeSteps,
    }
}