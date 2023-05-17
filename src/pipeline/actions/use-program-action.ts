import { ProgramId } from "../../gl/program/program";

export interface ActiveProgramAction {
    action: "active-program";
    id: ProgramId;
}
