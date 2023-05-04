import { ProgramId } from "../gl/program/program";
export declare type GetUniformLocation = (name: string, id?: ProgramId) => WebGLUniformLocation | undefined;
export declare type GetAttributeLocation = (name: string, id?: ProgramId) => number;
export interface GlConfig {
    gl: WebGL2RenderingContext;
    getUniformLocation: GetUniformLocation;
    getAttributeLocation: GetAttributeLocation;
}
export declare type OnChange = (glConfig: GlConfig) => (() => void) | undefined;
export interface GlController {
    setActiveProgram?: (id: ProgramId) => boolean;
    setOnChange?: (onChange: OnChange) => void;
}
