import { useCallback, useEffect, useRef } from "react";
import { clearRecord } from "../../utils/object-utils";
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

export default function useBufferAttributes({ gl, getAttributeLocation }: Props) {
    const bindVertexArray = useCallback(() => {
        const triangleArray = gl?.createVertexArray() ?? null;
        gl?.bindVertexArray(triangleArray);
        return () => gl?.deleteVertexArray(triangleArray);
    }, [gl]);

    const bufferRecord = useRef<Record<LocationName, BufferInfo>>({});
    useEffect(() => {
      const record = bufferRecord.current;
      return () => {
        clearRecord(record, info => {
          if (info.buffer) {
            gl?.deleteBuffer(info.buffer);
          }
        });
      };
    }, [gl, bufferRecord]);

    const createBuffer = useCallback((location: LocationName): BufferInfo => {
      if (bufferRecord.current[location]) {
        gl?.deleteBuffer(bufferRecord.current[location].buffer);
        delete bufferRecord.current[location];
      }
      const bufferBuffer = gl?.createBuffer();
      if (!bufferBuffer) {
        throw new Error(`Unable to create buffer "${location}"`);
      }
      const record = {
        buffer: bufferBuffer,
        location: getAttributeLocation(location),
      };
      bufferRecord.current[location] = record;
      return record;
    }, [bufferRecord, gl, getAttributeLocation]);

    const getBufferAttribute = useCallback((location: LocationName, autoCreate?: boolean) => {
      const attribute = bufferRecord.current[location];
      if (!attribute) {
        if (autoCreate) {
          return createBuffer(location);
        }
        throw new Error(`Attribute "${location}" not created. Make sure "createBuffer" is called.`);
      }
      return attribute;
    }, [bufferRecord, createBuffer])

    const bufferData = useCallback((target: GLenum | undefined, location: LocationName, bufferArray: TypedArray | undefined, bufferSize: number, glUsage: GLenum) => {
      const bufferInfo = getBufferAttribute(location);
      const targetValue = target ?? bufferInfo.target ?? WebGL2RenderingContext.ARRAY_BUFFER;
      if (bufferArray) {
        gl?.bufferData(targetValue, bufferArray, glUsage);
      } else {
        gl?.bufferData(targetValue, bufferSize, glUsage);
      }
      bufferInfo.bufferSize = bufferSize;
      bufferInfo.bufferArray = bufferArray ?? new Float32Array(bufferInfo.bufferSize! / Float32Array.BYTES_PER_ELEMENT).fill(0);
      bufferInfo.usage = glUsage;
      bufferInfo.target = targetValue;

    }, [gl, getBufferAttribute]);

    const bufferSubData = useCallback((target: GLenum, bufferArray: TypedArray, dstByteOffset: number, srcOffset?: number, length?: number) => {
      if (srcOffset) {
        gl?.bufferSubData(target, dstByteOffset, bufferArray, srcOffset, length);
      } else {
        gl?.bufferSubData(target, dstByteOffset, bufferArray);
      }
    }, [gl]);

    return {
      bindVertexArray,
      createBuffer,
      getBufferAttribute,
      bufferData,
      bufferSubData,
    };
}