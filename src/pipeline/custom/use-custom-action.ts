import { useCallback } from "react";
import { BufferInfo } from "../use-buffer-attributes";

export interface CustomAction {
    action: "custom",
    location?: string;
    processAttributeBuffer?(bufferArray: Float32Array, time: number): void;
}

export interface Props {
    gl?: WebGL2RenderingContext;
    getBufferAttribute(location: string): BufferInfo | undefined;
}

export default function useCustomAction({ getBufferAttribute, gl }: Props) {
    const executeCustomAction = useCallback(({location, processAttributeBuffer}: CustomAction, time: number) => {
        if (processAttributeBuffer) {
            const bufferLocation = getBufferAttribute(location ?? "");
            if (bufferLocation) {
                processAttributeBuffer(bufferLocation.bufferArray, time);
                gl?.bindBuffer(gl.ARRAY_BUFFER, bufferLocation.buffer);
                gl?.bufferData(gl.ARRAY_BUFFER, bufferLocation.bufferArray, gl.STATIC_DRAW);
            }
        }
    }, [getBufferAttribute, gl]);

    return {
        executeCustomAction,
    }
}
