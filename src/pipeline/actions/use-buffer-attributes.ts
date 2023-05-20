import { useCallback, useEffect, useRef } from "react";
import { ProgramId } from "../../gl/program/program";
import { LocationName, Type, Usage } from "./BufferAttributeAction";
import { clearRecord } from "../../utils/object-utils";
import { Context } from "../use-action-pipeline";

interface Props {
    gl?: WebGL2RenderingContext;
    getAttributeLocation(name: LocationName, programId?: ProgramId): number;
}

export type TypedArray = Float32Array | Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array;

export interface BufferInfo {
  buffer: WebGLBuffer;
  location: number;
  bufferArray?: TypedArray;
  bufferSize?: number;
  usage?: GLenum;
}

export default function useBufferAttributes({ gl, getAttributeLocation }: Props) {
    const getGlUsage = useCallback((usage: Usage | undefined): GLenum | undefined => {
        if (!gl) {
          return;
        }
        switch(usage) {
          case Usage.DYNAMIC_DRAW:
            return gl.DYNAMIC_DRAW;
          case Usage.STREAM_DRAW:
            return gl.STREAM_DRAW;
          case Usage.STATIC_DRAW:
            return gl.STATIC_DRAW;
          default:
            return;
        }
      }, [gl]);
  
    const getGlType = useCallback((type: Type | undefined): GLenum | undefined => {
        switch(type) {
          case Type.BYTE:
            return gl?.BYTE;
          case Type.FLOAT:
            return gl?.FLOAT;
          case Type.SHORT:
            return gl?.SHORT;
          case Type.UNSIGNED_BYTE:
            return gl?.UNSIGNED_BYTE;
          case Type.UNSIGNED_SHORT:
            return gl?.UNSIGNED_SHORT;
          case Type.INT:
            return gl?.INT;
          case Type.UNSIGNED_INT:
            return gl?.UNSIGNED_INT;
        }
        return;
    }, [gl]);

    const getTypedArray = useCallback((type: Type | undefined) => {
      switch(type) {
        case Type.BYTE:
          return Int8Array;
        case Type.FLOAT:
          return Float32Array;
        case Type.SHORT:
          return Int16Array;
        case Type.UNSIGNED_BYTE:
          return Uint8Array;
        case Type.UNSIGNED_SHORT:
          return Uint16Array;
        case Type.INT:
          return Int32Array;
        case Type.UNSIGNED_INT:
          return Uint32Array;
      }
      return;
    }, []);

    const getByteSize = useCallback((type: Type | undefined) => {
      return getTypedArray(type)?.BYTES_PER_ELEMENT;
    }, [getTypedArray])

    const bindVertexArray = useCallback((context: Context) => {
        const triangleArray = gl?.createVertexArray() ?? null;
        gl?.bindVertexArray(triangleArray);
        context.cleanupActions.push(() => gl?.deleteVertexArray(triangleArray));
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

    const getBufferAttribute = useCallback((location: LocationName) => {
      const attribute = bufferRecord.current[location];
      if (!attribute) {
        throw new Error(`Attribute ${location} not created. Make sure "createBuffer" is called.`);
      }
      return attribute;
    }, [bufferRecord])

    const createBuffer = useCallback((location: LocationName): void => {
      if (bufferRecord.current[location]) {
        gl?.deleteBuffer(bufferRecord.current[location].buffer);
        delete bufferRecord.current[location];
      }
      const bufferBuffer = gl?.createBuffer();
      if (!bufferBuffer) {
        throw new Error(`Unable to create buffer ${location}`);
      }
      bufferRecord.current[location] = {
        buffer: bufferBuffer,
        location: getAttributeLocation(location),
      };
    }, [bufferRecord, gl, getAttributeLocation]);

    const vertexAttribPointer = useCallback((location: string, locationOffset: 0|1|2|3, size: GLint, type: Type | undefined, normalized: boolean, stride: GLsizei, offset: GLintptr, rows: number) => {
      if (!gl) {
          return;
      }
      const bufferLocation = bufferRecord.current[location].location ?? getAttributeLocation(location);
      if (bufferLocation < 0) {
        return;
      }
      const glType = getGlType(type) ?? gl.FLOAT;
      const sizeMul = size * (getByteSize(type) ?? Float32Array.BYTES_PER_ELEMENT);
      for (let i = 0; i < rows; i++) {
        const finalOffset = offset + i * sizeMul;
        gl.vertexAttribPointer(bufferLocation + i + locationOffset, size, glType, normalized, stride, finalOffset);
      }
    }, [getAttributeLocation, getByteSize, getGlType, gl, bufferRecord]);

    const bufferData = useCallback((location: LocationName, bufferArray: TypedArray | undefined, bufferSize: number, glUsage: GLenum) => {
      if (!gl) {
        return;
      }

      const bufferLocation = bufferRecord.current[location].location ?? getAttributeLocation(location);
      if (bufferLocation < 0) {
        throw new Error(`Invalid attribute location ${location}`);
      }
      const bufferInfo = getBufferAttribute(location);
      if (bufferArray) {
        gl.bufferData(gl.ARRAY_BUFFER, bufferArray, glUsage);
      } else {
        gl.bufferData(gl.ARRAY_BUFFER, bufferSize, glUsage);
      }
      bufferInfo.bufferArray = bufferArray;
      bufferInfo.bufferSize = bufferSize;
      bufferInfo.usage = glUsage;

    }, [gl, getAttributeLocation, getBufferAttribute, bufferRecord]);

    return {
      bindVertexArray,
      createBuffer,
      getBufferAttribute,
      vertexAttribPointer,
      getTypedArray,
      bufferData,
      getGlUsage,
    };
}