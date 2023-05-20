import { DokGlAction, GlAction } from "./actions/GlAction";
import { ProgramId } from "../gl/program/program";
import { TypedArray } from "./actions/use-buffer-attributes";
import { ExecutionStep } from "./use-script-execution";
interface Props {
    gl?: WebGL2RenderingContext;
    getAttributeLocation(name: string, programId?: ProgramId): number;
    getUniformLocation(name: string, programId?: ProgramId): WebGLUniformLocation | undefined;
    setActiveProgram(programId?: ProgramId): boolean;
    getScript(script: string | GlAction[] | undefined): DokGlAction[];
}
export interface Context {
    time: number;
    executePipeline: ExecutePipeline;
    cleanupActions: (() => void)[];
    storage: Record<string, number | string | TypedArray>[];
}
export declare type ExecutePipeline = (steps: ExecutionStep[], context: Context) => void;
export default function useActionPipeline({ gl, getAttributeLocation, getUniformLocation, setActiveProgram, getScript }: Props): {
    executePipeline: (steps: ExecutionStep[], context: Context) => void;
    context: Context;
    convertActions: (actions: DokGlAction[]) => ExecutionStep[];
};
export {};
