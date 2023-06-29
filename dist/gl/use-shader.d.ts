import { ProgramConfig } from "dok-gl-actions/dist/program/program";
interface Props {
    gl?: WebGL2RenderingContext;
}
export interface ProgramResult {
    id: number;
    vertex: string;
    fragment: string;
    program?: WebGLProgram;
    ready?: boolean;
}
export declare function useShader({ gl }: Props): {
    createProgram: ({ vertex, fragment }: ProgramConfig) => ProgramResult | undefined;
    removeProgram: (programResult: ProgramResult) => void;
};
export {};
