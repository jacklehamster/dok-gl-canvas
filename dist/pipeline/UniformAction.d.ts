import { ProgramId } from "../gl/program/program";
export interface Uniform1iAction {
    action: "uniform1i";
    location: string;
    value: number;
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
    uniform1iAction: ({ location, value }: Uniform1iAction) => void;
    updateUniformTimer: ({ location }: UniformTimerAction, time: number) => void;
};
export {};
