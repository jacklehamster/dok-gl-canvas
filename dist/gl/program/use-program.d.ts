import { ProgramConfig } from "./program";
interface Props {
    gl?: WebGL2RenderingContext;
    programs?: ProgramConfig[];
}
export declare function useProgram({ gl, programs }: Props): {
    usedProgram: WebGLProgram | undefined;
    getAttributeLocation: (name: string, programId?: string | undefined) => number;
    getUniformLocation: (name: string, programId?: string | undefined) => WebGLUniformLocation | undefined;
    setActiveProgram: (programId?: string | undefined) => boolean;
};
export {};
