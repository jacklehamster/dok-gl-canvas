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
import useScriptExecution, { ExecutionStep } from "./use-script-execution";

interface Props {
    gl?: WebGL2RenderingContext;
    getAttributeLocation(name: string, programId?: ProgramId): number;
    getUniformLocation(name: string, programId?: ProgramId): WebGLUniformLocation | undefined;
    setActiveProgram(programId?: ProgramId): boolean;
    getScript(script: string | GlAction[] | undefined): DokGlAction[];
}

export interface Context {
    time: number;
    executePipeline: ExecutePipeline;
    cleanupActions:(() => void)[];
}

export type ExecutePipeline = (steps: ExecutionStep[], context: Context) => void;

export default function useActionPipeline({ gl, getAttributeLocation, getUniformLocation, setActiveProgram, getScript }: Props) {
    const { bindVertexArray, bufferAttributes, getBufferAttribute, bufferSubData } = useBufferAttributes({ gl, getAttributeLocation });
    const clear = useClearAction(gl);
    const { drawArrays, drawArraysInstanced } = useDrawVertexAction(gl);
    const { updateUniformTimer, uniform1iAction } = useUniformAction({ gl, getUniformLocation });
    const { executeCustomAction } = useCustomAction({ gl, getBufferAttribute });
    const { executeLoadImageAction, executeVideoAction, executeLoadTextureAction } = useImageAction({ gl });
    const { executeProgramAction } = useProgramAction({ setActiveProgram });
    const { executeSteps } = useScriptExecution();

    const convertActions = useCallback((actions: DokGlAction[]): ExecutionStep[] => actions.map(action => {
        switch(action.action) {
            case "bind-vertex":
                return (context) => bindVertexArray(context);
            case "buffer-attribute":
                return (context) => bufferAttributes(action, context);
            case "buffer-sub-data":
                return () => bufferSubData(action);
            case "clear":
                return () => clear(action);
            case "draw-arrays":
                return () => drawArrays(action);
            case "draw-arrays-instanced":
                return () => drawArraysInstanced(action);
            case "uniform-timer":
                return (context) => updateUniformTimer(action, context.time);
            case "active-program":
                return () => executeProgramAction(action);
            case "custom":
                return (context) => executeCustomAction(action, context);
            case "load-image":
                const onLoad = convertActions(getScript(action.onLoad));
                return (context) => executeLoadImageAction(action, context, onLoad);
            case "uniform":
                return () => uniform1iAction(action);
            case "load-texture":
                return () => executeLoadTextureAction(action);
            case "load-video":
                return (context) => executeVideoAction(action, context);                
            case "execute-script":
                const steps = convertActions(getScript(action.script));
                return (context) => {
                    executeSteps(steps, context);
                };
        }
    }), [
        bindVertexArray,
        bufferAttributes,
        bufferSubData,
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
        executeSteps,
    ]);


    const executePipeline = useCallback((steps: ExecutionStep[], context: Context): void => {
        for (let step of steps) {
            step(context);
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
        time: 0,
        executePipeline,
        cleanupActions: [],
    }), [executePipeline]);

    return { executePipeline, context, convertActions };
}