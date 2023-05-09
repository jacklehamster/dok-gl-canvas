import { useCallback } from "react";
import { ProgramId } from "../gl/program/program";
import { BufferAttributeAction, Type, Usage } from "./BufferAttributeAction";

interface Props {
    gl?: WebGL2RenderingContext;
    getAttributeLocation(name: string, programId?: ProgramId): number;
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

    const bindVertexArray = useCallback(() => {
        const triangleArray = gl?.createVertexArray() ?? null;
        gl?.bindVertexArray(triangleArray);
        return () => gl?.deleteVertexArray(triangleArray);
    }, [gl]);
    
    const bufferAttributes = useCallback((bufferAttributeAction: BufferAttributeAction):((() => void) | undefined)  => {
        if (!gl) {
            return;
        }
        const { location, buffer, usage, size, type, normalized, stride, offset } = bufferAttributeAction;

        const bufferLocation = getAttributeLocation(location);
        if (bufferLocation < 0 || !buffer.length) {
          return;
        }
        const bufferBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer), getGlEnum(usage) ?? gl.STATIC_DRAW);
        gl.vertexAttribPointer(bufferLocation, size, getGlType(type) ?? gl.FLOAT, normalized ?? false, stride ?? 0, offset ?? 0);
        gl.enableVertexAttribArray(bufferLocation);
  
        //  Cleanup
        return () => {
            gl.deleteBuffer(bufferBuffer);
            gl.disableVertexAttribArray(bufferLocation);  
        };                  
    }, [gl, getAttributeLocation]);

    return { bindVertexArray, bufferAttributes };
}