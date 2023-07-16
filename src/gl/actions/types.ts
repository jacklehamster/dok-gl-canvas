import { convertValueOf } from "dok-gl-actions";
import { GlBufferTarget, GlUsage, ValueOf } from "dok-gl-actions/dist/types";
import { useCallback } from "react";

export function useTypes() {
    const convertUsage = useCallback((usage: GlUsage | string | undefined): GLenum => {
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


    const getGlUsage = useCallback((usage: ValueOf<GlUsage|string | undefined>): ValueOf<GLenum> => {
      return convertValueOf(usage, convertUsage);
    }, [convertUsage]);

    const convertBufferTarget = useCallback((target: GlBufferTarget | string | undefined): GLenum => {
      switch(target) {
        case "ARRAY_BUFFER":
          return WebGL2RenderingContext.ARRAY_BUFFER;
        case "ELEMENT_ARRAY_BUFFER":
          return WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER;
        default:
            return WebGL2RenderingContext.ARRAY_BUFFER;
      }
    }, []);

    const getBufferTarget = useCallback((target: ValueOf<GlBufferTarget | string | undefined>): ValueOf<GLenum> => {
      return convertValueOf(target, convertBufferTarget);
    }, [convertBufferTarget]);

    return {
        getGlUsage,
        getBufferTarget,
    }
}