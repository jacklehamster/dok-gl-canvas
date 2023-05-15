import { useCallback } from "react";
import { Context, ExecutePipeline } from "./use-action-pipeline";
import { ExecutionStep } from "./use-script-execution";

interface Props {
    executePipeline: ExecutePipeline;
}

export default function useLoopPipeline({ executePipeline }: Props) {
    const performCleanup = useCallback((cleanupActions: (() => void)[]) => {
        if (cleanupActions.length) {
            for (let cleanup of cleanupActions) {
                cleanup();
            }
            cleanupActions.length = 0;    
        }
    }, []);

    return useCallback((steps: ExecutionStep[], _: number, context: Context) => {
        let id: number;
        const cleanupActions: (() => void)[] = [];
        const loop = (time: number) => {
            executePipeline(steps, time, context, cleanupActions);
            performCleanup(cleanupActions);
            id = requestAnimationFrame(loop);
        };

        loop(0);
        return () => {
            performCleanup(cleanupActions);
            cancelAnimationFrame(id);
        };
    }, [executePipeline, performCleanup]);
}