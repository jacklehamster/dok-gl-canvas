import { BufferInfo } from "../use-buffer-attributes";
import { Context } from "../../use-action-pipeline";
export interface CustomAction {
    action: "custom";
    location?: string;
    modifyAttributeBuffer?(bufferArray: Float32Array, time: number): void;
}
export interface Props {
    gl?: WebGL2RenderingContext;
    getBufferAttribute(location: string): BufferInfo | undefined;
}
export default function useCustomAction({ gl, getBufferAttribute }: Props): {
    executeCustomAction: ({ location, modifyAttributeBuffer }: CustomAction, context: Context) => void;
};
