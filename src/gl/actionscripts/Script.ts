import { useCallback } from "react";
import { DokGlAction, GlAction } from "../../pipeline/actions/GlAction";

export interface OldScript {
    name: string;
    actions: GlAction[];
    parameters?: string[];
}

interface Props {
    scripts: OldScript[];
}

export function useActionScripts({ scripts }: Props) {
    const extractScript = useCallback((script: string | GlAction[] | undefined, results: DokGlAction[]): void => {
        if (!script) {
            return;
        }
        const actions: GlAction[] = typeof(script) === "string" ? (scripts.find(s => s.name === script)?.actions ?? []) : script;
        actions.forEach(action => {
            if (typeof(action) === "string") {
                extractScript(action, results);
                return;
            }
            if (action.action === "execute-script") {
                // BUGBUG: Handle loop properly
                if (action.loop) {
                    throw new Error("Loop not yet implemented");
                }
                results.push({
                    action: "store-context",
                    context: action.context,
                });
                extractScript(action.script, results);
                results.push({
                    action: "pop-context",
                });
                return;
            }
            results.push(action);
        });
    }, [scripts]);

    const getScript = useCallback((script: string | GlAction[] | undefined): DokGlAction[] => {
        const actions: DokGlAction[] = [];
        extractScript(script, actions);
        return actions;
    }, [extractScript]);

    return {
        getScript,
    }
}
