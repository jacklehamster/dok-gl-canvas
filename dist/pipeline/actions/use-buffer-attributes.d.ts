import { ProgramId } from "../../gl/program/program";
import { BufferAttributeAction, BufferSubDataAction, LocationName } from "./BufferAttributeAction";
import { Context } from "../use-action-pipeline";
interface Props {
    gl?: WebGL2RenderingContext;
    getAttributeLocation(name: LocationName, programId?: ProgramId): number;
}
export interface BufferInfo {
    buffer: WebGLBuffer;
    bufferArray?: Float32Array;
    bufferSize: number;
    usage: GLenum;
}
export default function useBufferAttributes({ gl, getAttributeLocation }: Props): {
    bindVertexArray: (context: Context) => void;
    bufferAttributes: (bufferAttributeAction: BufferAttributeAction, context: Context) => void;
    bufferSubData: ({ dstByteOffset, buffer, srcOffset, length }: BufferSubDataAction) => void;
    getBufferAttribute: (location: LocationName) => BufferInfo;
};
export {};
