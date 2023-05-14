import { useCallback } from "react";
import { GlAction } from "./GlAction";
import { ProgramId } from "../gl/program/program";
import useBufferAttributes from "./use-buffer-attributes";
import useClearAction from "./use-clear-action";
import useDrawVertexAction from "./draw-vertex-action";
import useUniformAction from "./UniformAction";
import useCustomAction from "./custom/use-custom-action";
import useImageAction from "./use-image-action";
import useProgramAction from "./use-program-action";

interface Props {
    gl?: WebGL2RenderingContext;
    getAttributeLocation(name: string, programId?: ProgramId): number;
    getUniformLocation(name: string, programId?: ProgramId): WebGLUniformLocation | undefined;
    setActiveProgram(programId?: ProgramId): boolean;
    getScript(script: string | GlAction[] | undefined): GlAction[];
}

const NOP = () => {};

export default function useActionPipeline({ gl, getAttributeLocation, getUniformLocation, setActiveProgram, getScript }: Props) {
    const { bindVertexArray, bufferAttributes, getBufferAttribute } = useBufferAttributes({ gl, getAttributeLocation });
    const clear = useClearAction(gl);
    const { drawArrays, drawArraysInstanced } = useDrawVertexAction(gl);
    const { updateUniformTimer, uniform1iAction } = useUniformAction({ gl, getUniformLocation });
    const { executeCustomAction } = useCustomAction({ gl, getBufferAttribute });
    const { executeLoadImageAction, executeVideoAction, executeLoadTextureAction } = useImageAction({ gl });
    const { executeProgramAction } = useProgramAction({ setActiveProgram });

    const executePipeline = useCallback((actions: GlAction[], time: number = 0): () => void => {
        if (!actions.length) {
            return NOP;
        }
        const cleanupActions = actions.map(action => {
            if (typeof(action) === "string") {
                return executePipeline(getScript(action), time);
            }
            if (action.execute) {
                action.execute(action, time);
                return;
            }
            switch(action.action) {
                case "bind-vertex":
                    return bindVertexArray();
                case "buffer-attribute":
                    return bufferAttributes(action);
                case "clear":
                    clear(action);
                    break;
                case "draw-arrays":
                    drawArrays(action);
                    break;
                case "draw-arrays-instanced":
                    drawArraysInstanced(action);
                    break;
                case "uniform-timer":
                    return updateUniformTimer(action, time);
                case "active-program":
                    executeProgramAction(action);
                    break;
                case "custom":
                    return executeCustomAction(action, time);
                case "execute-script":
                    return executePipeline(getScript(action.script));
                case "load-image":
                    return executeLoadImageAction(action, executePipeline);
                case "uniform":
                    return uniform1iAction(action);
                case "load-texture":
                    return executeLoadTextureAction(action);
                case "load-video":
                    return executeVideoAction(action);
            }
            return NOP;
        }).filter((cleanup): cleanup is (() => void) => !!cleanup);
        return cleanupActions.length ? () => cleanupActions.forEach(cleanup => cleanup()) : NOP;
    }, [
        bufferAttributes,
        updateUniformTimer,
        uniform1iAction,
        drawArrays,
        drawArraysInstanced,
        clear,
        executeProgramAction,
        executeCustomAction,
        getScript,
        executeLoadImageAction,
        executeLoadTextureAction,
    ]);

    return { executePipeline, getBufferAttribute };
}