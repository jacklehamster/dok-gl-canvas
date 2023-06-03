import { useCallback } from "react";
import { BufferInfo, TypedArray } from "../use-buffer-attributes";

export interface CustomAction extends Record<string, any> {
    action: "custom",
    location?: string;
    modifyAttributeBuffer?(bufferArray: TypedArray, time: number): void;
}

export interface Props {
    gl?: WebGL2RenderingContext;
    getBufferAttribute(location: string): BufferInfo | undefined;
}

export default function useCustomAction({ gl, getBufferAttribute }: Props) {
    const executeCustomAction = useCallback(({location, modifyAttributeBuffer }: CustomAction, time: number) => {
        if (modifyAttributeBuffer) {
            const bufferLocation = getBufferAttribute(location ?? "");
            if (bufferLocation && bufferLocation.bufferSize) {
                if (!bufferLocation.bufferArray) {
                    bufferLocation.bufferArray = new Float32Array(bufferLocation.bufferSize / Float32Array.BYTES_PER_ELEMENT);
                    bufferLocation.bufferArray.fill(0);
                }
                gl?.bindBuffer(gl.ARRAY_BUFFER, bufferLocation.buffer);
                gl?.getBufferSubData(gl.ARRAY_BUFFER, 0, bufferLocation.bufferArray);
                modifyAttributeBuffer(bufferLocation.bufferArray!, time);
                gl?.bufferData(gl.ARRAY_BUFFER, bufferLocation.bufferArray!, bufferLocation.usage ?? gl.DYNAMIC_DRAW);
            }
        }
    }, [getBufferAttribute, gl]);

    return {
        executeCustomAction,
    }
}
