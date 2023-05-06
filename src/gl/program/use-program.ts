import { useCallback, useEffect, useState } from "react";
import { GlController } from "../../control/gl-controller";
import { ProgramResult, useShader } from "../use-shader";
import { ProgramConfig, ProgramId } from "./program";

interface Props {
    gl?: WebGL2RenderingContext;
    initialProgram?: ProgramId;
    programs?: ProgramConfig[];
    controller?: GlController;
}

export function useProgram({ gl, initialProgram, programs, controller }: Props) {
    const { createProgram, removeProgram } = useShader({ gl });
    const [programResults, setProgramResults] = useState<Record<ProgramId, ProgramResult>>({});
    const [usedProgram, setUsedProgram] = useState<WebGLProgram | undefined>();

    useEffect(() => {
        return () => {
            Object.values(programResults).forEach(removeProgram);
        };
    }, [programResults, removeProgram]);

    useEffect(() => {
        setProgramResults(results => {
            const newResults: Record<ProgramId, ProgramResult> = {
                ...results,
            };
            const existingProgramIds = new Set();
            for (let id in results) {
                existingProgramIds.add(id);
            }

            programs?.forEach(program => {
                existingProgramIds.add(program.id);
                if (!results[program.id]) {
                    const result = createProgram(program);
                    if (result) {
                        newResults[program.id] = result;
                    }
                }
            });
            Object.entries(newResults).forEach(([programId, result]) => {
                if (!existingProgramIds.has(programId)) {
                    removeProgram(result);
                    delete newResults[programId];
                }
            });
            return newResults;
        });
    }, [...(programs ?? []), createProgram, removeProgram]);

    const setActiveProgram = useCallback((programId?: ProgramId): boolean => {
        if (gl && programId) {
            const result = programResults[programId];
            if (result?.program) {
                gl.useProgram(result.program);
                setUsedProgram(result.program);
                return true;
            }
        }
        return false;
    }, [gl, programResults]);

    const getUniformLocation = useCallback((name: string, programId?: ProgramId): WebGLUniformLocation | undefined => {
        if (gl) {
            const program = programId ? (programResults[programId])?.program : usedProgram;
            if (program) {
                return gl.getUniformLocation(program, name) ?? undefined;
            }
        }
        return;
    }, [gl, programResults, usedProgram]);

    const getAttributeLocation = useCallback((name: string, programId?: ProgramId): number => {
        if (gl) {
            const program = programId ? (programResults[programId])?.program : usedProgram;
            if (program) {
                return gl.getAttribLocation(program, name) ?? -1;
            }
        }
        return -1;
    }, [gl, programResults, usedProgram]);

    useEffect(() => {
        if (controller) {
            controller.setActiveProgram = setActiveProgram;
        }
    }, [controller, setActiveProgram]);

    useEffect(() => {
        if (gl && !usedProgram) {
            setActiveProgram(initialProgram ?? programs?.[0].id);
        }
    }, [gl, initialProgram, setActiveProgram, usedProgram, programs]);

    return {
        usedProgram,
        getAttributeLocation,
        getUniformLocation,
    }
}