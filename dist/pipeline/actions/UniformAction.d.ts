import { ProgramId } from "../../gl/program/program";
import { LocationName } from "./BufferAttributeAction";
export interface UniformAction {
    action: "uniform";
    location: LocationName;
    int?: number;
    float?: number;
}
export interface UniformTimerAction {
    action: "uniform-timer";
    location: LocationName;
}
interface Props {
    gl?: WebGL2RenderingContext;
    getUniformLocation(name: LocationName, programId?: ProgramId): WebGLUniformLocation | undefined;
}
export default function useUniformAction({ gl, getUniformLocation }: Props): {
    uniform1iAction: ({ location, int, float }: UniformAction) => void;
    updateUniformTimer: ({ location }: UniformTimerAction, time: number) => void;
};
export {};
