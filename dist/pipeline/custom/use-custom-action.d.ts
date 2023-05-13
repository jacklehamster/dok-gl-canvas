import { BufferInfo } from "../use-buffer-attributes";
export interface CustomAction {
    action: "custom";
    location?: string;
    processAttributeBuffer?(bufferArray: Float32Array, time: number): void;
}
export interface Props {
    gl?: WebGL2RenderingContext;
    getBufferAttribute(location: string): BufferInfo | undefined;
}
export default function useCustomAction({ getBufferAttribute, gl }: Props): {
    executeCustomAction: ({ location, processAttributeBuffer }: CustomAction, time: number) => void;
};
