import { useCallback, useMemo } from "react";
import { DokGlAction, GlAction } from "./actions/GlAction";
import { ProgramId } from "../gl/program/program";
import useBufferAttributes from "./actions/use-buffer-attributes";
import useClearAction from "./actions/use-clear-action";
import useDrawVertexAction from "./actions/draw-vertex-action";
import useUniformAction from "./actions/UniformAction";
import useCustomAction from "./actions/custom/use-custom-action";
import useImageAction from "./actions/use-image-action";
import useProgramAction from "./actions/use-program-action";
import { ExecutionStep } from "./use-script-execution";

interface Props {
    gl?: WebGL2RenderingContext;
    getAttributeLocation(name: string, programId?: ProgramId): number;
    getUniformLocation(name: string, programId?: ProgramId): WebGLUniformLocation | undefined;
    setActiveProgram(programId?: ProgramId): boolean;
    getScript(script: string | GlAction[] | undefined): DokGlAction[];
}

export interface Context {
    executePipeline: ExecutePipeline;
}

export type ExecutePipeline = (steps: ExecutionStep[], time: number, context: Context, cleanupActions: (() => void)[]) => void;

export default function useActionPipeline({ gl, getAttributeLocation, getUniformLocation, setActiveProgram, getScript }: Props) {
    const { bindVertexArray, bufferAttributes, getBufferAttribute } = useBufferAttributes({ gl, getAttributeLocation });
    const clear = useClearAction(gl);
    const { drawArrays, drawArraysInstanced } = useDrawVertexAction(gl);
    const { updateUniformTimer, uniform1iAction } = useUniformAction({ gl, getUniformLocation });
    const { executeCustomAction } = useCustomAction({ gl, getBufferAttribute });
    const { executeLoadImageAction, executeVideoAction, executeLoadTextureAction } = useImageAction({ gl });
    const { executeProgramAction } = useProgramAction({ setActiveProgram });

    const convertActions = useCallback((actions: DokGlAction[]): ExecutionStep[] => actions.map(action => {
        switch(action.action) {
            case "bind-vertex":
                return bindVertexArray;
            case "buffer-attribute":
                return () => bufferAttributes(action);
            case "clear":
                return () => clear(action);
            case "draw-arrays":
                return () => drawArrays(action);
            case "draw-arrays-instanced":
                return () => drawArraysInstanced(action);
            case "uniform-timer":
                return (time) => updateUniformTimer(action, time);
            case "active-program":
                return () => executeProgramAction(action);
            case "custom":
                return (time) => executeCustomAction(action, time);
            case "load-image":
                const onLoad = convertActions(getScript(action.onLoad));
                return (time, context) => executeLoadImageAction(action, time, context, onLoad);
            case "uniform":
                return () => uniform1iAction(action);
            case "load-texture":
                return () => executeLoadTextureAction(action);
            case "load-video":
                return () => executeVideoAction(action);                
            case "execute-script":
                const steps = convertActions(getScript(action.script));
                return (time, context) => {
                    for (let step of steps) step(time, context);
                };
        }
    }), [
        bindVertexArray,
        bufferAttributes,
        clear,
        drawArrays,
        drawArraysInstanced,
        updateUniformTimer,
        executeProgramAction,
        executeCustomAction,
        executeLoadImageAction,
        uniform1iAction,
        executeLoadTextureAction,
        executeVideoAction,
        getScript,
    ]);


    const executePipeline = useCallback((steps: ExecutionStep[], time: number = 0, context: Context, cleanupActions: (() => void)[]): void => {
        for (let step of steps) {
            const cleanup = step(time, context);
            if (cleanup) {
                cleanupActions.push(cleanup);
            }
        }
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

    const context: Context = useMemo(() => ({
        executePipeline,
    }), [executePipeline]);

    return { executePipeline, context, convertActions };
}