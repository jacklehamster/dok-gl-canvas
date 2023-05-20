import { NumberResolution, Resolution } from "../data/data-provider";
import { GlAction } from "./GlAction";

export interface ExecuteScriptAction {
    action?: "execute-script",
    context: Record<string, Resolution>;
    script: GlAction[] | string;
    loop?: NumberResolution;
}
