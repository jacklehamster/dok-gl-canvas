import { Script, ScriptProcessor } from "dok-actions";
import { LocationName } from "dok-gl-actions";
import { ProgramId } from "dok-gl-actions/dist/program/program";
interface Props {
    gl?: WebGL2RenderingContext;
    getAttributeLocation(name: LocationName, programId?: ProgramId): number;
    getUniformLocation(name: string, programId?: ProgramId): WebGLUniformLocation | undefined;
    activateProgram(programId?: ProgramId): boolean;
}
interface State {
    getScriptProcessor<T>(scripts: Script<T>[]): ScriptProcessor<T>;
}
export declare function useGlAction({ gl, getAttributeLocation, getUniformLocation, activateProgram }: Props): State;
export {};
