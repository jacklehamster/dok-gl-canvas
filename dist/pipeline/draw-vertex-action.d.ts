import { GlExecuteAction } from "./GlAction";
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
    drawArrays: (action: DrawArraysAction & GlExecuteAction) => void;
    drawArraysInstanced: (action: DrawArraysInstancedAction & GlExecuteAction) => void;
};
