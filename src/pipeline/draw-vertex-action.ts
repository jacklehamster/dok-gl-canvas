import { useCallback } from "react";
import { GlExecuteAction } from "./GlAction";

export interface DrawVertexAction {
    action: "draw",
    vertexFirst?: GLint;
    vertexCount: GLsizei;
}

export default function useDrawVertexAction(gl?: WebGL2RenderingContext) {
    const execute = useCallback(({vertexFirst, vertexCount}: DrawVertexAction) => {
        gl?.drawArrays(gl.TRIANGLES, vertexFirst ?? 0, vertexCount ?? 0);
    }, [gl]);

    return useCallback((action: DrawVertexAction & GlExecuteAction) => {
        action.execute = execute;
        execute(action);
    }, [execute]);
}