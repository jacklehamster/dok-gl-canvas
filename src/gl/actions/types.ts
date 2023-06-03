import { useCallback } from "react";

export type GlUsage = "STATIC_DRAW" | "STREAM_DRAW" | "DYNAMIC_DRAW";
export type GlType = "BYTE" | "FLOAT" | "SHORT" | "UNSIGNED_BYTE" | "UNSIGNED_SHORT" | "INT" | "UNSIGNED_INT" | "FLOAT";

export function useTypes() {

    const getGlType = useCallback((type: GlType | string | undefined): GLenum => {
        switch(type) {
          case "BYTE":
            return WebGL2RenderingContext.BYTE;
          case "FLOAT":
            return WebGL2RenderingContext.FLOAT;
          case "SHORT":
            return WebGL2RenderingContext.SHORT;
          case "UNSIGNED_BYTE":
            return WebGL2RenderingContext.UNSIGNED_BYTE;
          case "UNSIGNED_SHORT":
            return WebGL2RenderingContext.UNSIGNED_SHORT;
          case "INT":
            return WebGL2RenderingContext.INT;
          case "UNSIGNED_INT":
            return WebGL2RenderingContext.UNSIGNED_INT;
        }
        return WebGL2RenderingContext.FLOAT;
    }, []);
  
    const getTypedArray = useCallback((type: GlType | string | undefined) => {
      switch(type) {
        case "BYTE":
          return Int8Array;
        case "FLOAT":
          return Float32Array;
        case "SHORT":
          return Int16Array;
        case "UNSIGNED_BYTE":
          return Uint8Array;
        case "UNSIGNED_SHORT":
          return Uint16Array;
        case "INT":
          return Int32Array;
        case "UNSIGNED_INT":
          return Uint32Array;
      }
      return Float32Array;
    }, []);
  
    const getGlUsage = useCallback((usage: GlUsage | string | undefined): GLenum => {
      switch(usage) {
          case "DYNAMIC_DRAW":
            return WebGL2RenderingContext.DYNAMIC_DRAW;
          case "STREAM_DRAW":
            return WebGL2RenderingContext.STREAM_DRAW;
          case "STATIC_DRAW":
            return WebGL2RenderingContext.STATIC_DRAW;
          default:
            return WebGL2RenderingContext.STATIC_DRAW;
      }
    }, []);

    const getByteSize = useCallback((type?: GlType) => {
      return getTypedArray(type).BYTES_PER_ELEMENT;
    }, [getTypedArray])

    return {
        getGlType,
        getTypedArray,
        getGlUsage,
        getByteSize,
    }
}