import { useCallback, useEffect, useState } from "react";
import { ProgramResult, useShader } from "../use-shader";
import { ProgramConfig, ProgramId } from "dok-gl-actions/dist/program/program";

interface Props {
    gl?: WebGL2RenderingContext;
    programs?: ProgramConfig[];
    initialPrograms?: ProgramConfig[];
}

export function useProgram({ gl, programs }: Props) {
    const { createProgram, removeProgram } = useShader({ gl });

    const [programResults, setProgramResults] = useState<Record<ProgramId, ProgramResult>>({});
    const [activeProgram, setActiveProgram] = useState<WebGLProgram>();

    const updatePrograms = useCallback((programs?: ProgramConfig[]) => {
        setProgramResults(results => {
            const newResults = {...results};
            Object.entries(results).forEach(([programId, result]) => {
                if (!programs?.find(({id, vertex, fragment}) => id === programId && result.vertex === vertex && result.fragment === fragment)) {
                    removeProgram(result);
                    delete newResults[programId];
                }
            });

            (programs??[]).forEach(program => {
                if (program.id && !newResults[program.id]) {
                    const result = createProgram(program);
                    if (result) {
                        newResults[program.id] = result;    
                    }
                }
            });
            return newResults;
        });
    }, [createProgram, removeProgram]);

    useEffect(() => {
        setActiveProgram(undefined);
        updatePrograms(programs);
        return () => {
            updatePrograms(undefined);
        };
    }, [programs, updatePrograms]);

    const activateProgram = useCallback((programId?: ProgramId): boolean => {
        if (gl && programId) {
            const result = programResults[programId];
            if (result?.program) {
                setActiveProgram(result.program);
                gl.useProgram(result.program);
                return true;
            }
        }
        return false;
    }, [gl, programResults]);

    const getUniformLocation = useCallback((name: string, programId?: ProgramId): WebGLUniformLocation | undefined => {
        if (gl) {
            const program = programResults[programId ?? ""]?.program ?? activeProgram;
            if (program) {
                return gl.getUniformLocation(program, name) ?? undefined;
            }
        }
        return;
    }, [gl, programResults, activeProgram]);

    const getAttributeLocation = useCallback((name: string, programId?: ProgramId): number => {
        if (gl) {
            const program = programResults[programId ?? ""]?.program ?? activeProgram;
            if (program) {
                return gl.getAttribLocation(program, name) ?? -1;
            }
        }
        return -1;
    }, [gl, programResults, activeProgram]);

    useEffect(() => {
        const programId = programs?.[0]?.id;
        activateProgram(programId);
    }, [gl, activateProgram, programs]);

    return {
        getAttributeLocation,
        getUniformLocation,
        activateProgram,
        activeProgram,
    }
}