import { ProgramConfig, ProgramId } from "./program";
interface Props {
    gl?: WebGL2RenderingContext;
    initialProgram?: ProgramId;
    programs?: ProgramConfig[];
}
export interface ActiveProgramAction {
    action: "active-program";
    id: ProgramId;
}
export declare function useProgram({ gl, initialProgram, programs }: Props): {
    usedProgram: WebGLProgram | undefined;
    getAttributeLocation: (name: string, programId?: string | undefined) => number;
    getUniformLocation: (name: string, programId?: string | undefined) => WebGLUniformLocation | undefined;
    setActiveProgram: (programId?: string | undefined) => boolean;
};
export {};
