import { DokGlAction, GlAction } from "./actions/GlAction";
import { ProgramId } from "../gl/program/program";
import { ExecutionStep } from "./use-script-execution";
interface Props {
    gl?: WebGL2RenderingContext;
    getAttributeLocation(name: string, programId?: ProgramId): number;
    getUniformLocation(name: string, programId?: ProgramId): WebGLUniformLocation | undefined;
    setActiveProgram(programId?: ProgramId): boolean;
    getScript(script: string | GlAction[] | undefined): DokGlAction[];
}
export interface Context {
    executePipeline: ExecutePipeline;
}
export declare type ExecutePipeline = (steps: ExecutionStep[], time: number, context: Context, cleanupActions: (() => void)[]) => void;
export default function useActionPipeline({ gl, getAttributeLocation, getUniformLocation, setActiveProgram, getScript }: Props): {
    executePipeline: (steps: ExecutionStep[], time: number | undefined, context: Context, cleanupActions: (() => void)[]) => void;
    context: Context;
    convertActions: (actions: DokGlAction[]) => ExecutionStep[];
};
export {};
