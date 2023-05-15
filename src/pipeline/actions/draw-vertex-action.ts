import { useCallback } from "react";
import { GlExecuteAction } from "./GlAction";

export interface DrawArraysAction {
    action: "draw-arrays",
    vertexFirst?: GLint;
    vertexCount: GLsizei;
}

export interface DrawArraysInstancedAction {
    action: "draw-arrays-instanced",
    vertexFirst?: GLint;
    vertexCount: GLsizei;
    instanceCount: GLsizei;    
}

export default function useDrawVertexAction(gl?: WebGL2RenderingContext) {
    const drawArrays = useCallback(({vertexFirst, vertexCount}: DrawArraysAction) => {
        gl?.drawArrays(gl.TRIANGLES, vertexFirst ?? 0, vertexCount ?? 0);
    }, [gl]);

    const drawArraysInstanced = useCallback(({vertexFirst, vertexCount, instanceCount}: DrawArraysInstancedAction) => {
        gl?.drawArraysInstanced(gl.TRIANGLES, vertexFirst ?? 0, vertexCount ?? 0, instanceCount ?? 0);
    }, [gl]);

    return {
        drawArrays: useCallback((action: DrawArraysAction & GlExecuteAction) => {
            action.execute = drawArrays;
            drawArrays(action);
        }, [drawArrays]),
        drawArraysInstanced: useCallback((action: DrawArraysInstancedAction & GlExecuteAction) => {
            action.execute = drawArraysInstanced;
            drawArraysInstanced(action);
        }, [drawArraysInstanced]),
    };
}