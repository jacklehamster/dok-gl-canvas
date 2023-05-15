import { useCallback } from "react";
import { Context, ExecutePipeline } from "./use-action-pipeline";
import { ExecutionStep } from "./use-script-execution";

interface Props {
    executePipeline: ExecutePipeline;
}

export default function useLoopPipeline({ executePipeline }: Props) {
    return useCallback((steps: ExecutionStep[], context: Context) => {
        const loopContext: Context = {...context, cleanupActions: [] };
        let id: number;
        const loop = (time: number) => {
            loopContext.time = time;
            executePipeline(steps, loopContext);
            for (let cleanup of loopContext.cleanupActions) {
                cleanup();
            }
            loopContext.cleanupActions.length = 0;
            id = requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);

        context.cleanupActions.push(() => {
            loopContext.cleanupActions.forEach(cleanup => cleanup());
            loopContext.cleanupActions.length = 0;
            cancelAnimationFrame(id);
        });
    }, [executePipeline]);
}