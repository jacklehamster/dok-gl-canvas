import { BufferInfo, TypedArray } from "../use-buffer-attributes";
export interface CustomAction extends Record<string, any> {
    action?: "custom";
    location?: string;
    modifyAttributeBuffer?(bufferArray: TypedArray, time: number): void;
}
export interface Props {
    gl?: WebGL2RenderingContext;
    getBufferAttribute(location: string): BufferInfo | undefined;
}
export default function useCustomAction({ gl, getBufferAttribute }: Props): {
    executeCustomAction: ({ location, modifyAttributeBuffer }: CustomAction, time: number) => void;
};
