import { useCallback } from "react";
import { ProgramId } from "../gl/program/program";

export interface Uniform1iAction {
    action: "uniform1i",
    location: string;
    value: number;
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
    const uniform1iAction = useCallback(({ location, value }: Uniform1iAction) => {
        const uniformLocation = getUniformLocation(location) ?? null;
        gl?.uniform1i(uniformLocation, value);
    }, [gl]);

    const updateUniformTimer = useCallback(({ location }: UniformTimerAction, time: number) => {
        const uniformLocation = getUniformLocation(location) ?? null;
        gl?.uniform1i(uniformLocation, time);
    }, []);

    return { uniform1iAction, updateUniformTimer };
}