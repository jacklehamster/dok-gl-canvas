import { useCallback } from "react";
import { BufferInfo } from "../use-buffer-attributes";
import { GlExecuteAction } from "../GlAction";

export interface CustomAction {
    action: "custom",
    location?: string;
    modifyAttributeBuffer?(bufferArray: Float32Array, time: number): void;
}

export interface Props {
    gl?: WebGL2RenderingContext;
    getBufferAttribute(location: string): BufferInfo | undefined;
}

export default function useCustomAction({ getBufferAttribute, gl }: Props) {
    const executeCustomAction = useCallback(({location, modifyAttributeBuffer}: CustomAction, time: number) => {
        if (modifyAttributeBuffer) {
            const bufferLocation = getBufferAttribute(location ?? "");
            if (bufferLocation) {
                if (!bufferLocation.bufferArray) {
                    bufferLocation.bufferArray = new Float32Array(bufferLocation.bufferSize / Float32Array.BYTES_PER_ELEMENT);
                }
                modifyAttributeBuffer(bufferLocation.bufferArray, time);
                gl?.bindBuffer(gl.ARRAY_BUFFER, bufferLocation.buffer);
                gl?.bufferData(gl.ARRAY_BUFFER, bufferLocation.bufferArray, bufferLocation.usage);
            }
        }
    }, [getBufferAttribute, gl]);

    return {
        executeCustomAction: useCallback((action: CustomAction & GlExecuteAction, time: number) => {
            action.execute = executeCustomAction;
            executeCustomAction(action, time);
        }, [executeCustomAction]),
    }
}
