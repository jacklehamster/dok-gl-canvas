import { ProgramConfig } from "dok-gl-actions/dist/program/program";
interface Props {
    gl?: WebGL2RenderingContext;
    programs?: ProgramConfig[];
    initialPrograms?: ProgramConfig[];
}
export declare function useProgram({ gl, programs }: Props): {
    getAttributeLocation: (name: string, programId?: string | undefined) => number;
    getUniformLocation: (name: string, programId?: string | undefined) => WebGLUniformLocation | undefined;
    activateProgram: (programId?: string | undefined) => boolean;
    programLoading: boolean;
    activeProgram: WebGLProgram | undefined;
};
export {};
