import { useCallback } from "react";
import { ProgramId } from "../../gl/program/program";

export interface ActiveProgramAction {
    action: "active-program";
    id: ProgramId;
}

interface Props {
    setActiveProgram(id: ProgramId): void;
}

export default function useProgramAction({ setActiveProgram }: Props) {
    const executeProgramAction = useCallback((action: ActiveProgramAction) => {
        setActiveProgram(action.id);
    }, [setActiveProgram]);
    return { 
        executeProgramAction,
    };
}