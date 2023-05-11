import { useCallback } from "react";
import { GlAction } from "./GlAction";
import { ProgramId } from "../gl/program/program";
import useBufferAttributes from "./use-buffer-attributes";
import useClearAction from "./use-clear-action";
import useDrawVertexAction from "./draw-vertex-action";
import useUniformAction from "./UniformAction";
import useCustomAction from "./custom/use-custom-action";

interface Props {
    gl?: WebGL2RenderingContext;
    getAttributeLocation(name: string, programId?: ProgramId): number;
    getUniformLocation(name: string, programId?: ProgramId): WebGLUniformLocation | undefined;
    setActiveProgram(programId?: ProgramId): boolean;
}

const NOP = () => {};

export default function useActionPipeline({ gl, getAttributeLocation, getUniformLocation, setActiveProgram }: Props) {
    const { bindVertexArray, bufferAttributes, getBufferAttribute } = useBufferAttributes({ gl, getAttributeLocation });
    const clear = useClearAction(gl);
    const drawVertices = useDrawVertexAction(gl);
    const { updateUniformTimer } = useUniformAction({ gl, getUniformLocation });
    const { executeCustomAction } = useCustomAction({ gl, getBufferAttribute });

    const executePipeline = useCallback((actions?: GlAction[], time: number = 0) => {
        if (!actions?.length) {
            return NOP;
        }
        const cleanupActions = actions?.map(action => {
            switch(action.action) {
                case "bind-vertex":
                    return bindVertexArray();
                case "buffer-attribute":
                    return bufferAttributes(action);
                case "clear":
                    clear(action);
                    break;
                case "draw":
                    drawVertices(action);
                    break;
                case "uniform-timer":
                    return updateUniformTimer(action, time);
                case "active-program":
                    setActiveProgram(action.id);
                    break;
                case "custom":
                    return executeCustomAction(action, time);
            }
            return undefined;
        }).filter((cleanup): cleanup is (() => void) => !!cleanup);
        return cleanupActions.length ? () => cleanupActions.forEach(cleanup => cleanup()) : NOP;
    }, [bufferAttributes, updateUniformTimer, drawVertices, clear, setActiveProgram, executeCustomAction]);
    return { executePipeline, clear, drawVertices, getBufferAttribute };
}