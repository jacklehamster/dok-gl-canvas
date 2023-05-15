import { Context, ExecutePipeline } from "./use-action-pipeline";
import { ExecutionStep } from "./use-script-execution";
interface Props {
    executePipeline: ExecutePipeline;
}
export default function useLoopPipeline({ executePipeline }: Props): (steps: ExecutionStep[], _: number, context: Context) => () => void;
export {};
