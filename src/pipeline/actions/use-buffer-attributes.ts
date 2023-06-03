import { useCallback, useEffect, useRef } from "react";
import { ProgramId } from "../../gl/program/program";
import { clearRecord } from "../../utils/object-utils";
import { LocationName } from "../../gl/actions/GlAction";

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
        throw new Error(`Unable to create buffer ${location}`);
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
        throw new Error(`Attribute ${location} not created. Make sure "createBuffer" is called.`);
      }
      return attribute;
    }, [bufferRecord, createBuffer])

    const bufferData = useCallback((location: LocationName, bufferArray: TypedArray | undefined, bufferSize: number, glUsage: GLenum) => {
      if (!gl) {
        return;
      }

      const bufferLocation = bufferRecord.current[location].location ?? getAttributeLocation(location);
      if (bufferLocation < 0) {
        throw new Error(`Invalid attribute location ${location}`);
      }
      if (bufferArray) {
        gl.bufferData(gl.ARRAY_BUFFER, bufferArray, glUsage);
      } else {
        gl.bufferData(gl.ARRAY_BUFFER, bufferSize, glUsage);
      }
      const bufferInfo = getBufferAttribute(location);
      bufferInfo.bufferArray = bufferArray;
      bufferInfo.bufferSize = bufferSize;
      bufferInfo.usage = glUsage;

    }, [gl, getAttributeLocation, getBufferAttribute, bufferRecord]);

    return {
      bindVertexArray,
      createBuffer,
      getBufferAttribute,
      bufferData,
    };
}