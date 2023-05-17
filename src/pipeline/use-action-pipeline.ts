import { useCallback, useMemo } from "react";
import { DokGlAction, GlAction } from "./actions/GlAction";
import { ProgramId } from "../gl/program/program";
import useBufferAttributes from "./actions/use-buffer-attributes";
import useClearAction from "./actions/use-clear-action";
import useCustomAction from "./actions/custom/use-custom-action";
import useImageAction from "./actions/use-image-action";
import useScriptExecution, { ExecutionStep } from "./use-script-execution";
import { useDataProvider } from "./data/data-provider";

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
    const { bindVertexArray, bufferAttributes, getBufferAttribute } = useBufferAttributes({ gl, getAttributeLocation });
    const clear = useClearAction(gl);
    const { executeCustomAction } = useCustomAction({ gl, getBufferAttribute });
    const { executeLoadImageAction, executeVideoAction, executeLoadTextureAction } = useImageAction({ gl });
    const { executeSteps } = useScriptExecution();
    const { calc, calcBuffer } = useDataProvider();

    const convertActions = useCallback((actions: DokGlAction[]): ExecutionStep[] => actions.map(action => {
        switch(action.action) {
            case "bind-vertex":
                return (context) => bindVertexArray(context);
            case "buffer-attribute":
                return (context) => bufferAttributes(action, context);
            case "buffer-sub-data":
                {
                    const buffer = calcBuffer(action.buffer);
                    const dstByteOffset = calc(action.dstByteOffset);
                    const srcOffset = calc(action.srcOffset);
                    const length = calc(action.length);

                    return () => {
                        const bufferArray = buffer.valueOf();
                        gl?.bufferSubData(gl.ARRAY_BUFFER, dstByteOffset.valueOf(), bufferArray, srcOffset.valueOf(), length.valueOf() || bufferArray.length);
                    };
                }
            case "clear":
                return () => clear(action);
            case "draw-arrays":
                {
                    const vertexFirst = calc(action.vertexFirst);
                    const vertexCount = calc(action.vertexCount);
                    return () => gl?.drawArrays(gl.TRIANGLES, vertexFirst.valueOf(), vertexCount.valueOf());
                }
            case "draw-arrays-instanced":
                {
                    const vertexFirst = calc(action.vertexFirst);
                    const vertexCount = calc(action.vertexCount);
                    const instanceCount = calc(action.instanceCount);
                    return () => gl?.drawArraysInstanced(gl.TRIANGLES, vertexFirst.valueOf(), vertexCount.valueOf(), instanceCount.valueOf());
                }
            case "uniform-timer":
                return (context) => gl?.uniform1f(getUniformLocation(action.location) ?? null, context.time);
            case "active-program":
                return () => setActiveProgram(action.id);
            case "custom":
                return (context) => executeCustomAction(action, context);
            case "load-image":
                const onLoad = convertActions(getScript(action.onLoad));
                return (context) => executeLoadImageAction(action, context, onLoad);
            case "uniform":
                if (action.int !== undefined) {
                    const value = calc(action.int);
                    return () => gl?.uniform1i(getUniformLocation(action.location) ?? null, value.valueOf());    
                } else {
                    const value = calc(action.float);
                    return () => gl?.uniform1f(getUniformLocation(action.location) ?? null, value.valueOf());
                }
            case "load-texture":
                return () => executeLoadTextureAction(action);
            case "load-video":
                return (context) => executeVideoAction(action, context);                
            case "execute-script":
                const steps = convertActions(getScript(action.script));
                return (context) => executeSteps(steps, context);
        }
        throw new Error("Unreachable");
    }), [
        gl,
        bindVertexArray,
        bufferAttributes,
        clear,
        setActiveProgram,
        executeCustomAction,
        executeLoadImageAction,
        executeLoadTextureAction,
        executeVideoAction,
        getScript,
        executeSteps,
        getUniformLocation,
        calc,
        calcBuffer,
    ]);


    const executePipeline = useCallback((steps: ExecutionStep[], context: Context): void => {
        for (let step of steps) {
            step(context);
        }
    }, []);

    const context: Context = useMemo(() => ({
        time: 0,
        executePipeline,
        cleanupActions: [],
    }), [executePipeline]);

    return { executePipeline, context, convertActions };
}