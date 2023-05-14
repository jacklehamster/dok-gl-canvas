import { useCallback } from "react";
import { ProgramId } from "../gl/program/program";
import { GlExecuteAction } from "./GlAction";

export interface UniformAction {
    action: "uniform",
    location: string;
    int?: number;
    float?: number;
}

export interface UniformTimerAction {
    action: "uniform-timer",
    location: string;
}

interface Props {
    gl?: WebGL2RenderingContext;
    getUniformLocation(name: string, programId?: ProgramId): WebGLUniformLocation | undefined;
}

export default function useUniformAction({ gl, getUniformLocation }: Props) {
    const uniform1iAction = useCallback(({ location, int, float }: UniformAction) => {
        const uniformLocation = getUniformLocation(location) ?? null;
        if (int !== undefined) {
            gl?.uniform1i(uniformLocation, int);            
        }
        if (float !== undefined) {
            gl?.uniform1f(uniformLocation, float);
        }
    }, [gl, getUniformLocation]);

    const updateUniformTimer = useCallback(({ location }: UniformTimerAction, time: number) => {
        const uniformLocation = getUniformLocation(location) ?? null;
        gl?.uniform1f(uniformLocation, time);
    }, [gl, getUniformLocation]);

    return { uniform1iAction, updateUniformTimer: useCallback((action: UniformTimerAction & GlExecuteAction, time: number) => {
        action.execute = updateUniformTimer;
        updateUniformTimer(action, time);
    }, [updateUniformTimer]) };
}