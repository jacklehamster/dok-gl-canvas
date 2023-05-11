import { ProgramId } from "../gl/program/program";
import { GlAction } from "../pipeline/GlAction";
import { DrawVertexAction } from "../pipeline/draw-vertex-action";
import { BufferInfo } from "../pipeline/use-buffer-attributes";
import { ClearAction } from "../pipeline/use-clear-action";
export declare type GetUniformLocation = (name: string, id?: ProgramId) => WebGLUniformLocation | undefined;
export declare type GetAttributeLocation = (name: string, id?: ProgramId) => number;
export interface GlConfig {
    gl: WebGL2RenderingContext;
    getUniformLocation: GetUniformLocation;
    getAttributeLocation: GetAttributeLocation;
}
export declare type OnChange = (glConfig: GlConfig) => (() => void) | undefined;
export interface GlController {
    setActiveProgram?(id: ProgramId): boolean;
    setOnChange?(onChange: OnChange): void;
    setPipelineActions?(actions: GlAction[]): void;
    setLoopActions?(actions: GlAction[]): void;
    clear?(action: ClearAction): void;
    drawVertices?(action: DrawVertexAction): void;
    getBufferAttribute?(location: string): BufferInfo;
}
