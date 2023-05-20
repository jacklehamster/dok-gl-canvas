import { BufferInfo, TypedArray } from "../use-buffer-attributes";
import { Context } from "../../use-action-pipeline";
export interface CustomAction {
    action: "custom";
    location?: string;
    modifyAttributeBuffer?(bufferArray: TypedArray, time: number): void;
    updateContext?(context: Context): void;
}
export interface Props {
    gl?: WebGL2RenderingContext;
    getBufferAttribute(location: string): BufferInfo | undefined;
}
export default function useCustomAction({ gl, getBufferAttribute }: Props): {
    executeCustomAction: ({ location, modifyAttributeBuffer, updateContext }: CustomAction, context: Context) => void;
};
