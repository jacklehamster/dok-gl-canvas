import { ProgramConfig } from "../program/program";
import { GlScript } from "./GlScript";
export interface GlDokConfig {
    scripts: GlScript[];
    programs: ProgramConfig[];
}
