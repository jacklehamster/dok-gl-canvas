export interface DrawVertexAction {
    action: "draw";
    vertexFirst?: GLint;
    vertexCount: GLsizei;
}
export default function useDrawVertexAction(gl?: WebGL2RenderingContext): ({ vertexFirst, vertexCount }: DrawVertexAction) => void;
