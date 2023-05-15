export interface DrawArraysAction {
    action: "draw-arrays";
    vertexFirst?: GLint;
    vertexCount: GLsizei;
}
export interface DrawArraysInstancedAction {
    action: "draw-arrays-instanced";
    vertexFirst?: GLint;
    vertexCount: GLsizei;
    instanceCount: GLsizei;
}
export default function useDrawVertexAction(gl?: WebGL2RenderingContext): {
    drawArrays: ({ vertexFirst, vertexCount }: DrawArraysAction) => void;
    drawArraysInstanced: ({ vertexFirst, vertexCount, instanceCount }: DrawArraysInstancedAction) => void;
};
