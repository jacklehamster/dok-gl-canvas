import { DokGlAction, GlAction } from "../../pipeline/actions/GlAction";
export interface OldScript {
    name: string;
    actions: GlAction[];
    parameters?: string[];
}
interface Props {
    scripts: OldScript[];
}
export declare function useActionScripts({ scripts }: Props): {
    getScript: (script: string | GlAction[] | undefined) => DokGlAction[];
};
export {};
