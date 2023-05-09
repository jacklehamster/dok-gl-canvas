import { GlAction } from "./GlAction";
interface Props {
    executePipeline(actions?: GlAction[], time?: number): (() => void) | undefined;
}
export default function useLoopPipeline({ executePipeline }: Props): (actions?: GlAction[] | undefined) => () => void;
export {};
