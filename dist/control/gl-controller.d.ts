import { OldScript } from "../gl/actionscripts/Script";
import { ProgramConfig, ProgramId } from "../gl/program/program";
import { GlAction } from "../pipeline/actions/GlAction";
export type GetUniformLocation = (name: string, id?: ProgramId) => WebGLUniformLocation | undefined;
export type GetAttributeLocation = (name: string, id?: ProgramId) => number;
export interface GlConfig {
    gl: WebGL2RenderingContext;
    getUniformLocation: GetUniformLocation;
    getAttributeLocation: GetAttributeLocation;
}
export interface GlController {
    setActiveProgram?(id: ProgramId): boolean;
    setPipelineActions?(script: GlAction[] | string): void;
    setLoopActions?(script: GlAction[] | string): void;
    setScripts?(scripts: OldScript[]): void;
    setPrograms?(programs: ProgramConfig[]): void;
}
