import { ProgramConfig, ProgramId } from "dok-gl-actions/dist/program/program";
interface Props {
    gl?: WebGL2RenderingContext;
    programs?: ProgramConfig[];
    initialPrograms?: ProgramConfig[];
}
export declare function useProgram({ gl, programs }: Props): {
    getAttributeLocation: (name: string, programId?: ProgramId) => number;
    getUniformLocation: (name: string, programId?: ProgramId) => WebGLUniformLocation | undefined;
    activateProgram: (programId?: ProgramId) => boolean;
    programLoading: boolean;
    activeProgram: WebGLProgram | undefined;
};
export {};
