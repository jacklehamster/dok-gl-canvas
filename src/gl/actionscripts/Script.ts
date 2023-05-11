import { useCallback } from "react";
import { GlAction } from "../../pipeline/GlAction";

export interface Script {
    name: string;
    actions: GlAction[];
}

interface Props {
    scripts: Script[];
}

export function useActionScripts({ scripts }: Props) {
    const getActions = useCallback((script: string | GlAction[] | undefined): GlAction[] => {
        if (!script) {
            return [];
        }
        if (Array.isArray(script)) {
            return script;
        }
        return scripts.find(s => s.name === script)?.actions ?? [];
    }, [scripts]);

    return {
        getActions,
    }
}
