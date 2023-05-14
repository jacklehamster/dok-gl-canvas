import { GlAction } from "./GlAction";
import { ProgramId } from "../gl/program/program";
interface Props {
    gl?: WebGL2RenderingContext;
    getAttributeLocation(name: string, programId?: ProgramId): number;
    getUniformLocation(name: string, programId?: ProgramId): WebGLUniformLocation | undefined;
    setActiveProgram(programId?: ProgramId): boolean;
    getScript(script: string | GlAction[] | undefined): GlAction[];
}
export default function useActionPipeline({ gl, getAttributeLocation, getUniformLocation, setActiveProgram, getScript }: Props): {
    executePipeline: (actions: GlAction[], time?: number) => () => void;
    clear: (action: import("./use-clear-action").ClearAction & import("./GlAction").GlExecuteAction) => void;
    drawVertices: (action: import("./draw-vertex-action").DrawVertexAction & import("./GlAction").GlExecuteAction) => void;
    getBufferAttribute: (location: string) => import("./use-buffer-attributes").BufferInfo;
};
export {};
