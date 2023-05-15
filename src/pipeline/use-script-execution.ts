import { useCallback } from "react";
import { Context } from "./use-action-pipeline";

export type ExecutionStep = (context: Context) => void;


export default function useScriptExecution() {
    const executeSteps = useCallback((steps: ExecutionStep[], context: Context): void => {
        for (let step of steps) {
            step(context);
        }
    }, []);

    return {
        executeSteps,
    }
}