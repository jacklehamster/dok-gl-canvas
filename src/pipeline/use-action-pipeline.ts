import { useCallback, useMemo } from "react";
import { DokGlAction, GlAction } from "./actions/GlAction";
import { ProgramId } from "../gl/program/program";
import useBufferAttributes, { TypedArray } from "./actions/use-buffer-attributes";
import useClearAction from "./actions/use-clear-action";
import useCustomAction from "./actions/custom/use-custom-action";
import useImageAction from "./actions/use-image-action";
import useScriptExecution, { ExecutionStep } from "./use-script-execution";
import { useDataProvider } from "./data/data-provider";
import { useStorage } from "./actions/use-store-action";
import { LocationResolution } from "./actions/BufferAttributeAction";

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
    storage: Record<string, number | string | TypedArray>[];
}

export type ExecutePipeline = (steps: ExecutionStep[], context: Context) => void;

export default function useActionPipeline({ gl, getAttributeLocation, getUniformLocation, setActiveProgram, getScript }: Props) {
    const { bindVertexArray, getBufferAttribute, createBuffer, vertexAttribPointer, bufferData, getTypedArray, getGlUsage } = useBufferAttributes({ gl, getAttributeLocation });
    const clear = useClearAction(gl);
    const { executeCustomAction } = useCustomAction({ gl, getBufferAttribute });
    const { executeLoadImageAction, executeVideoAction, executeLoadTextureAction } = useImageAction({ gl });
    const { executeSteps } = useScriptExecution();
    const { calc, calcBuffer, calcString, evaluate } = useDataProvider();
    const { store, popStorage } = useStorage();

    const resolveLocation = useCallback((location: LocationResolution): [{valueOf(context?: Context): string}, 0|1|2|3] => {
        if (Array.isArray(location)) {
            return [calcString(location[0]), location[1]];
        }
        return [calcString(location), 0];
    }, [calcString]);

    const convertActions = useCallback((actions: DokGlAction[]): ExecutionStep[] => actions.map(action => {
        switch(action.action) {
            case "bind-vertex":
                return (context) => bindVertexArray(context);
            case "buffer-sub-data":
                {
                    const buffer = calcBuffer(action.buffer, getTypedArray(action.type) ?? Float32Array);
                    const dstByteOffset = calc(action.dstByteOffset);
                    const srcOffset = calc(action.srcOffset);
                    const length = calc(action.length);

                    return (context) => {
                        const bufferArray = buffer.valueOf(context);
                        gl?.bufferSubData(gl.ARRAY_BUFFER, dstByteOffset.valueOf(context), bufferArray, srcOffset.valueOf(context), length.valueOf(context) || bufferArray.length);
                    };
                }
            case "buffer-data":
                {
                    const buffer = typeof(action.buffer) === "number" ? undefined : calcBuffer(action.buffer, getTypedArray(action.type) ?? Float32Array);
                    const bufferSize = typeof(action.buffer) === "number" ? action.buffer : undefined;
                    const glUsage = getGlUsage(action.usage);
                    const [location] = resolveLocation(action.location);
                    return (context) => {
                        if (!gl) {
                            return;
                        }
                        const bufferArray = buffer?.valueOf(context);
                        bufferData(location.valueOf(context), bufferArray, bufferSize ?? bufferArray?.length ?? 0, glUsage ?? gl.STATIC_DRAW);
                    };                    
                }
            case "clear":
                return () => clear(action);
            case "createBuffer":
                {
                    const [location] = resolveLocation(action.location);
                    return (context) => createBuffer(location.valueOf(context));    
                }
            case "bindBuffer":
                {
                    const [location] = resolveLocation(action.location);
                    return (context) => {
                        const bufferInfo = getBufferAttribute(location.valueOf(context));
                        gl?.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.buffer);    
                    };    
                }
            case "draw-arrays":
                {
                    const vertexFirst = calc(action.vertexFirst);
                    const vertexCount = calc(action.vertexCount);
                    return (context) => gl?.drawArrays(gl.TRIANGLES, vertexFirst.valueOf(context), vertexCount.valueOf(context));
                }
            case "draw-arrays-instanced":
                {
                    const vertexFirst = calc(action.vertexFirst);
                    const vertexCount = calc(action.vertexCount);
                    const instanceCount = calc(action.instanceCount);
                    return (context) => gl?.drawArraysInstanced(gl.TRIANGLES, vertexFirst.valueOf(context), vertexCount.valueOf(context), instanceCount.valueOf(context));
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
                    return (context) => gl?.uniform1i(getUniformLocation(action.location) ?? null, value.valueOf(context));    
                } else {
                    const value = calc(action.float);
                    return (context) => gl?.uniform1f(getUniformLocation(action.location) ?? null, value.valueOf(context));
                }
            case "load-texture":
                return () => executeLoadTextureAction(action);
            case "load-video":
                return (context) => executeVideoAction(action, context);                
            case "execute-script":
            case undefined:
                const steps = convertActions(getScript(action.script));
                const entries: [string, {valueOf(context?: Context): any}][] = Object.entries(action.context)
                    .map(([ key, value ]) => [key, evaluate(value)]);
                const newStorage: Record<string, string | number | TypedArray> = {
                    index: 0,
                };
                const loop = calc(action.loop, 1);
                return (context) => {
                    for (let [key, value] of entries) {
                        newStorage[key] = value.valueOf(context);
                    }
                    store(context, newStorage);
                    const loopCount = loop.valueOf(context);
                    if (loopCount) {
                        const topStorage = context.storage[context.storage.length - 1];
                        for (let i = 0; i < loopCount; i++) {
                            topStorage.index = i;
                            executeSteps(steps, context);
                        }    
                    }
                    popStorage(context);
                }
            case "vertexAttribPointer":
                const [location, locationOffset] = resolveLocation(action.location);
                const size = calc(action.size);
                const type = action.type;
                const normalized = !!action.normalized;
                const stride = calc(action.stride);
                const offset = calc(action.offset);
                const rows = calc(action.rows, 1);
                return (context) => {
                    vertexAttribPointer(location.valueOf(context), locationOffset, size.valueOf(context), type, normalized, stride.valueOf(context), offset.valueOf(context), rows.valueOf(context));
                }
            case "vertexAttribDivisor":
                {
                    const rows = calc(action.rows, 1);
                    const [location, locationOffset] = resolveLocation(action.location);
                    const divisor = calc(action.divisor);
                    return (context) => {
                        const bufferInfo = getBufferAttribute(location.valueOf(context));
                        const numRows = rows.valueOf(context);
                        for (let i = 0; i < numRows; i++) {
                            gl?.vertexAttribDivisor(bufferInfo.location + i + locationOffset, divisor.valueOf(context));
                        }
                    };    
                }
            case "enableVertexAttribArray":
                {
                    const rows = calc(action.rows, 1);
                    const [location, locationOffset] = resolveLocation(action.location);
                    return (context) => {
                        const bufferInfo = getBufferAttribute(location.valueOf(context));
                        const numRows = rows.valueOf(context);
                        for (let i = 0; i < numRows; i++) {
                            const location = bufferInfo.location + i + locationOffset;
                            gl?.enableVertexAttribArray(location);
                            context.cleanupActions.push(() => {
                                gl?.disableVertexAttribArray(location);
                            });
                        }
                    };
                }
            case "store-context":
                {
                    const entries: [string, {valueOf(context?: Context): any}][] = Object.entries(action.context)
                        .map(([ key, value ]) => [key, evaluate(value)]);
                    const newStorage: Record<string, string | number | TypedArray> = {};
                    return (context) => {
                        for (let [key, value] of entries) {
                            newStorage[key] = value.valueOf(context);
                        }
                        store(context, newStorage);
                    };
                }
            case "pop-context":
                {
                    return (context) => popStorage(context);
                }
        }
        throw new Error("Unreachable");
    }), [getScript, bindVertexArray, calcBuffer, getTypedArray, calc, gl, getGlUsage, bufferData, clear, createBuffer, getBufferAttribute, getUniformLocation, setActiveProgram, executeCustomAction, executeLoadImageAction, executeLoadTextureAction, executeVideoAction, evaluate, executeSteps, vertexAttribPointer, store, popStorage, resolveLocation]);


    const executePipeline = useCallback((steps: ExecutionStep[], context: Context): void => {
        for (let step of steps) {
            step(context);
        }
    }, []);

    const context: Context = useMemo(() => ({
        time: 0,
        executePipeline,
        cleanupActions: [],
        storage: [],
    }), [executePipeline]);

    return { executePipeline, context, convertActions };
}