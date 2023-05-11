import { useCallback } from "react";
import { BufferInfo } from "../use-buffer-attributes";

export interface CustomAction {
    action: "custom",
    location?: string;
    processAttributeBuffer?(bufferArray: Float32Array, time: number): (() => void) | undefined;
}

export interface Props {
    gl?: WebGL2RenderingContext;
    getBufferAttribute(location: string): BufferInfo | undefined;
}

export default function useCustomAction({ getBufferAttribute, gl }: Props) {
    const executeCustomAction = useCallback((action: CustomAction, time: number) => {
        if (action.processAttributeBuffer) {
            const bufferLocation = getBufferAttribute(action.location ?? "");
            if (bufferLocation) {
                const cleanup = action.processAttributeBuffer(bufferLocation.bufferArray, time);
                gl?.bindBuffer(gl.ARRAY_BUFFER, bufferLocation.buffer);
                gl?.bufferData(gl.ARRAY_BUFFER, bufferLocation.bufferArray, gl.STATIC_DRAW);
                return cleanup;
            }
        }
        return;
    }, [getBufferAttribute, gl]);

    return {
        executeCustomAction,
    }
}
