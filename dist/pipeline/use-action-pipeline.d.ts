import { GlAction } from "./GlAction";
import { ProgramId } from "../gl/program/program";
interface Props {
    gl?: WebGL2RenderingContext;
    getAttributeLocation(name: string, programId?: ProgramId): number;
    getUniformLocation(name: string, programId?: ProgramId): WebGLUniformLocation | undefined;
    setActiveProgram(programId?: ProgramId): boolean;
    getActions(script: string | GlAction[] | undefined): GlAction[];
}
export default function useActionPipeline({ gl, getAttributeLocation, getUniformLocation, setActiveProgram, getActions }: Props): {
    executePipeline: (actions: GlAction[], time?: number) => () => void;
    clear: ({ color, depth, stencil }: import("./use-clear-action").ClearAction) => void;
    drawVertices: ({ vertexFirst, vertexCount }: import("./draw-vertex-action").DrawVertexAction) => void;
    getBufferAttribute: (location: string) => import("./use-buffer-attributes").BufferInfo;
};
export {};
