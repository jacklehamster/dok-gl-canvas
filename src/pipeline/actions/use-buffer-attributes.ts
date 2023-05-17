import { useCallback, useEffect, useRef } from "react";
import { ProgramId } from "../../gl/program/program";
import { BufferAttributeAction, BufferSubDataAction, LocationName, Type, Usage } from "./BufferAttributeAction";
import { clearRecord } from "../../utils/object-utils";
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

export default function useBufferAttributes({ gl, getAttributeLocation }: Props) {
    const getGlEnum = useCallback((usage: Usage | undefined): GLenum | undefined => {
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
        if (!gl) {
          return;
        }
        switch(type) {
          case Type.BYTE:
            return gl.BYTE;
          case Type.FLOAT:
            return gl.FLOAT;
          case Type.SHORT:
            return gl.SHORT;
          case Type.UNSIGNED_BYTE:
            return gl.UNSIGNED_BYTE;
          case Type.UNSIGNED_SHORT:
            return gl.UNSIGNED_SHORT;
          default:
            return;
        }
    }, [gl]);

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

    const bufferAttributes = useCallback((bufferAttributeAction: BufferAttributeAction, context: Context):void  => {
        if (!gl) {
            return;
        }
        const { location, buffer, usage, size, type, normalized, stride, offset, divisor } = bufferAttributeAction;

        const bufferLocation = getAttributeLocation(location);
        if (bufferLocation < 0) {
          return;
        }
        const glUsage = getGlEnum(usage) ?? gl.STATIC_DRAW;
        const bufferBuffer = gl.createBuffer();
        const bufferArray = buffer instanceof Float32Array ? buffer : Array.isArray(buffer) ? new Float32Array(buffer) : undefined;
        const bufferSize = typeof(buffer) === "number" ? buffer : buffer.length;
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferBuffer);
        if (bufferArray) {
          gl.bufferData(gl.ARRAY_BUFFER, bufferArray, glUsage);
        } else {
          gl.bufferData(gl.ARRAY_BUFFER, bufferSize, glUsage);
        }
        gl.vertexAttribPointer(bufferLocation, size, getGlType(type) ?? gl.FLOAT, normalized ?? false, stride ?? 0, offset ?? 0);
        gl.vertexAttribDivisor(bufferLocation, divisor ?? 0);
        gl.enableVertexAttribArray(bufferLocation);

        if (bufferBuffer && !bufferRecord.current[location]) {
          bufferRecord.current[location] = {
            buffer: bufferBuffer,
            bufferArray,
            bufferSize,
            usage: glUsage,
          };
        }
  
        //  Cleanup
        context.cleanupActions.push(() => gl.disableVertexAttribArray(bufferLocation));
    }, [gl, getAttributeLocation, getGlEnum, getGlType]);

    const bufferSubData = useCallback(({ dstByteOffset, buffer, srcOffset, length }: BufferSubDataAction):void  => {
        const bufferArray = buffer instanceof Float32Array ? buffer : new Float32Array(buffer);
        gl?.bufferSubData(gl.ARRAY_BUFFER, dstByteOffset ?? 0, bufferArray, srcOffset ?? 0, length ?? bufferArray.length);
    }, [gl]);

    return {
      bindVertexArray,
      bufferAttributes,
      bufferSubData,
      getBufferAttribute: useCallback((location: LocationName) => bufferRecord.current[location], [bufferRecord]),
    };
}