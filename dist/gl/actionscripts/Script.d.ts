import { GlAction } from "../../pipeline/GlAction";
export interface Script {
    name: string;
    actions: GlAction[];
}
interface Props {
    scripts: Script[];
}
export declare function useActionScripts({ scripts }: Props): {
    getScript: (script: string | GlAction[] | undefined) => GlAction[];
};
export {};
