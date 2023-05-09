import { useCallback } from "react";

export interface DrawVertexAction {
    action: "draw",
    vertexFirst?: GLint;
    vertexCount: GLsizei;
}

export default function useDrawVertexAction(gl?: WebGL2RenderingContext) {
    return useCallback(({vertexFirst, vertexCount}: DrawVertexAction) => {
        gl?.drawArrays(gl.TRIANGLES, vertexFirst ?? 0, vertexCount ?? 0);
    }, [gl]);
}