import { ProgramId } from "dok-gl-actions/dist/program/program";
import { LocationName } from "dok-gl-actions";
interface Props {
    gl?: WebGL2RenderingContext;
    getAttributeLocation(name: LocationName, programId?: ProgramId): number;
}
export type TypedArray = Float32Array | Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array;
export interface BufferInfo {
    buffer: WebGLBuffer;
    target?: GLenum;
    location: number;
    bufferArray?: TypedArray;
    bufferSize?: number;
    usage?: GLenum;
}
export default function useBufferAttributes({ gl, getAttributeLocation }: Props): {
    bindVertexArray: () => () => void | undefined;
    createBuffer: (location: LocationName) => BufferInfo;
    getBufferAttribute: (location: LocationName, autoCreate?: boolean) => BufferInfo;
    bufferData: (target: GLenum, location: LocationName, bufferArray: TypedArray | undefined, bufferSize: number, glUsage: GLenum) => void;
    bufferSubData: (target: GLenum, bufferArray: TypedArray, dstByteOffset: number, srcOffset?: number, length?: number) => void;
};
export {};
