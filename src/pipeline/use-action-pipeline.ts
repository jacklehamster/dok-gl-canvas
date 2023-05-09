import { useCallback } from "react";
import { GlAction } from "./GlAction";
import { ProgramId } from "../gl/program/program";
import useBufferAttributes from "./use-buffer-attributes";
import useClearAction from "./use-clear-action";
import useDrawVertexAction from "./draw-vertex-action";
import useUniformAction from "./UniformAction";

interface Props {
    gl?: WebGL2RenderingContext;
    getAttributeLocation(name: string, programId?: ProgramId): number;
    getUniformLocation(name: string, programId?: ProgramId): WebGLUniformLocation | undefined;
    setActiveProgram(programId?: ProgramId): boolean;
}

export default function useActionPipeline({ gl, getAttributeLocation, getUniformLocation, setActiveProgram }: Props) {
    const { bindVertexArray, bufferAttributes } = useBufferAttributes({ gl, getAttributeLocation });
    const clear = useClearAction(gl);
    const drawVertices = useDrawVertexAction(gl);
    const { updateUniformTimer } = useUniformAction({ gl, getUniformLocation });

    const executePipeline = useCallback((actions?: GlAction[], time: number = 0) => {
        const cleanupActions: (() => void)[] = [];
        cleanupActions.push(bindVertexArray());
        actions?.forEach(action => {
            let cleanupAction;
            switch(action.action) {
                case "buffer-attribute":
                    cleanupAction = bufferAttributes(action);
                    break;
                case "clear":
                    clear(action);
                    break;
                case "draw":
                    drawVertices(action);
                    break;
                case "uniform-timer":
                    cleanupAction = updateUniformTimer(action, time);
                    break;
                case "active-program":
                    setActiveProgram(action.id);
                    break;
            }
            if (cleanupAction) {
                cleanupActions.push(cleanupAction);
            }
        });
        return () => cleanupActions.forEach(cleanup => cleanup());
    }, [bufferAttributes, updateUniformTimer, drawVertices, clear, setActiveProgram]);
    return { executePipeline, clear, drawVertices };
}