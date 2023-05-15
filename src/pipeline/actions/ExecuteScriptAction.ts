import { GlAction } from "./GlAction";

export interface ExecuteScriptAction {
    action: "execute-script",
    script: GlAction[] | string;
}
