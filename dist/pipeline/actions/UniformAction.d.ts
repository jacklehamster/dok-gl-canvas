import { ProgramId } from "../../gl/program/program";
import { GlExecuteAction } from "./GlAction";
export interface UniformAction {
    action: "uniform";
    location: string;
    int?: number;
    float?: number;
}
export interface UniformTimerAction {
    action: "uniform-timer";
    location: string;
}
interface Props {
    gl?: WebGL2RenderingContext;
    getUniformLocation(name: string, programId?: ProgramId): WebGLUniformLocation | undefined;
}
export default function useUniformAction({ gl, getUniformLocation }: Props): {
    uniform1iAction: ({ location, int, float }: UniformAction) => void;
    updateUniformTimer: (action: UniformTimerAction & GlExecuteAction, time: number) => void;
};
export {};
