import { ProgramConfig } from "./program/program";
interface Props {
    gl?: WebGL2RenderingContext;
    showDebugInfo?: boolean;
}
export interface ProgramResult {
    id: number;
    program: WebGLProgram;
    ready?: boolean;
}
export declare function useShader({ gl, showDebugInfo }: Props): {
    createProgram: ({ vertex, fragment }: ProgramConfig) => ProgramResult | undefined;
    removeProgram: (programResult: ProgramResult) => void;
};
export {};
