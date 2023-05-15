import { GlExecuteAction } from "./GlAction";
import { ProgramId } from "../../gl/program/program";
export interface ActiveProgramAction {
    action: "active-program";
    id: ProgramId;
}
interface Props {
    setActiveProgram(id: ProgramId): void;
}
export default function useProgramAction({ setActiveProgram }: Props): {
    executeProgramAction: (action: ActiveProgramAction & GlExecuteAction) => void;
};
export {};
