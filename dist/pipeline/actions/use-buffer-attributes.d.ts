import { ProgramId } from "../../gl/program/program";
import { LocationName, Type, Usage } from "./BufferAttributeAction";
import { Context } from "../use-action-pipeline";
interface Props {
    gl?: WebGL2RenderingContext;
    getAttributeLocation(name: LocationName, programId?: ProgramId): number;
}
export declare type TypedArray = Float32Array | Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array;
export interface BufferInfo {
    buffer: WebGLBuffer;
    location: number;
    bufferArray?: TypedArray;
    bufferSize?: number;
    usage?: GLenum;
}
export default function useBufferAttributes({ gl, getAttributeLocation }: Props): {
    bindVertexArray: (context: Context) => void;
    createBuffer: (location: LocationName) => void;
    getBufferAttribute: (location: LocationName) => BufferInfo;
    vertexAttribPointer: (location: string, locationOffset: 0 | 1 | 2 | 3, size: GLint, type: Type | undefined, normalized: boolean, stride: GLsizei, offset: GLintptr, rows: number) => void;
    getTypedArray: (type: Type | undefined) => Int8ArrayConstructor | Float32ArrayConstructor | Int16ArrayConstructor | Uint8ArrayConstructor | Uint16ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | undefined;
    bufferData: (location: LocationName, bufferArray: TypedArray | undefined, bufferSize: number, glUsage: GLenum) => void;
    getGlUsage: (usage: Usage | undefined) => GLenum | undefined;
};
export {};
