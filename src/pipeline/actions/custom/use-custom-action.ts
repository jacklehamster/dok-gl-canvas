import { useCallback } from "react";
import { BufferInfo, TypedArray } from "../use-buffer-attributes";
import { Context } from "../../use-action-pipeline";

export interface CustomAction {
    action: "custom",
    location?: string;
    modifyAttributeBuffer?(bufferArray: TypedArray, time: number): void;
    updateContext?(context: Context): void;
}

export interface Props {
    gl?: WebGL2RenderingContext;
    getBufferAttribute(location: string): BufferInfo | undefined;
}

export default function useCustomAction({ gl, getBufferAttribute }: Props) {
    const executeCustomAction = useCallback(({location, modifyAttributeBuffer, updateContext }: CustomAction, context: Context) => {
        if (modifyAttributeBuffer) {
            const bufferLocation = getBufferAttribute(location ?? "");
            if (bufferLocation && bufferLocation.bufferSize) {
                if (!bufferLocation.bufferArray) {
                    bufferLocation.bufferArray = new Float32Array(bufferLocation.bufferSize / Float32Array.BYTES_PER_ELEMENT);
                    bufferLocation.bufferArray.fill(0);
                }
                gl?.bindBuffer(gl.ARRAY_BUFFER, bufferLocation.buffer);
                gl?.getBufferSubData(gl.ARRAY_BUFFER, 0, bufferLocation.bufferArray);
                modifyAttributeBuffer(bufferLocation.bufferArray!, context.time);
                gl?.bufferData(gl.ARRAY_BUFFER, bufferLocation.bufferArray!, bufferLocation.usage ?? gl.DYNAMIC_DRAW);
            }
        }
        updateContext?.(context);
    }, [getBufferAttribute, gl]);

    return {
        executeCustomAction,
    }
}
