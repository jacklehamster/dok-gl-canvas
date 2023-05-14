import { GlExecuteAction } from "./GlAction";
export interface DrawVertexAction {
    action: "draw";
    vertexFirst?: GLint;
    vertexCount: GLsizei;
}
export default function useDrawVertexAction(gl?: WebGL2RenderingContext): (action: DrawVertexAction & GlExecuteAction) => void;
