import { useCallback } from "react";
import { GlExecuteAction } from "./GlAction";
import { ProgramId } from "../../gl/program/program";

export interface ActiveProgramAction {
    action: "active-program";
    id: ProgramId;
}

interface Props {
    setActiveProgram(id: ProgramId): void;
}

export default function useProgramAction({ setActiveProgram }: Props) {
    const execute = useCallback((action: ActiveProgramAction) => {
        setActiveProgram(action.id);
    }, [setActiveProgram]);
    return { 
        executeProgramAction : useCallback((action: ActiveProgramAction & GlExecuteAction) => {
            action.execute = execute;
            execute(action);
        }, [ execute ]),
    };
}