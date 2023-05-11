import { useCallback } from "react";
import { GlAction } from "./GlAction";

interface Props {
    executePipeline(actions?: GlAction[], time?: number): (() => void);
}

export default function useLoopPipeline({ executePipeline }: Props) {
    return useCallback((actions?: GlAction[]) => {
        let id: number;
        let cleanup: (() => void)  = () => {};
        const loop = (time: number) => {
            cleanup();
            cleanup = executePipeline(actions, time);
            id = requestAnimationFrame(loop);
        };

        loop(0);
        return () => {
            cleanup();
            cancelAnimationFrame(id);
        };
    }, [executePipeline]);
}