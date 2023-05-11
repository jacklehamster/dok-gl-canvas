import { ProgramId } from "../gl/program/program";
import { GlAction } from "../pipeline/GlAction";
import { BufferInfo } from "../pipeline/use-buffer-attributes";
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
    setPipelineActions?(script: GlAction[] | string): void;
    setLoopActions?(script: GlAction[] | string): void;
    executeScript?(script: GlAction[] | string): (() => void) | undefined;
    getBufferAttribute?(location: string): BufferInfo;
}
