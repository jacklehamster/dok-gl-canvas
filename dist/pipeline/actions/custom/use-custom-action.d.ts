import { BufferInfo } from "../use-buffer-attributes";
import { GlExecuteAction } from "../GlAction";
export interface CustomAction {
    action: "custom";
    location?: string;
    modifyAttributeBuffer?(bufferArray: Float32Array, time: number): void;
}
export interface Props {
    gl?: WebGL2RenderingContext;
    getBufferAttribute(location: string): BufferInfo | undefined;
}
export default function useCustomAction({ getBufferAttribute, gl }: Props): {
    executeCustomAction: (action: CustomAction & GlExecuteAction, time: number) => void;
};
