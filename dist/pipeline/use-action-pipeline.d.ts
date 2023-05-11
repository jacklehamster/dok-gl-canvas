import { GlAction } from "./GlAction";
import { ProgramId } from "../gl/program/program";
interface Props {
    gl?: WebGL2RenderingContext;
    getAttributeLocation(name: string, programId?: ProgramId): number;
    getUniformLocation(name: string, programId?: ProgramId): WebGLUniformLocation | undefined;
    setActiveProgram(programId?: ProgramId): boolean;
}
export default function useActionPipeline({ gl, getAttributeLocation, getUniformLocation, setActiveProgram }: Props): {
    executePipeline: (actions?: GlAction[] | undefined, time?: number) => () => void;
    clear: ({ color, depth, stencil }: import("./use-clear-action").ClearAction) => void;
    drawVertices: ({ vertexFirst, vertexCount }: import("./draw-vertex-action").DrawVertexAction) => void;
    getBufferAttribute: (location: string) => import("./use-buffer-attributes").BufferInfo;
};
export {};
