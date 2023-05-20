import { DokGlAction, GlAction } from "../../pipeline/actions/GlAction";
export interface Script {
    name: string;
    actions: GlAction[];
    parameters?: string[];
}
interface Props {
    scripts: Script[];
}
export declare function useActionScripts({ scripts }: Props): {
    getScript: (script: string | GlAction[] | undefined) => DokGlAction[];
};
export {};
