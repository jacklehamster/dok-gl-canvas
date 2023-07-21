import { ExecutionParameters, ProgramId } from "dok-gl-actions";
export declare type GetUniformLocation = (name: string, id?: ProgramId) => WebGLUniformLocation | undefined;
export declare type GetAttributeLocation = (name: string, id?: ProgramId) => number;
export interface GlConfig {
    gl: WebGL2RenderingContext;
    getUniformLocation: GetUniformLocation;
    getAttributeLocation: GetAttributeLocation;
}
export interface GlController {
    executeScript?(name: string, parameters?: ExecutionParameters): void;
}
