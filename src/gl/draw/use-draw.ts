import { useCallback } from "react";

interface Props {
    gl?: WebGL2RenderingContext;
}

export function useDraw({ gl }: Props) {
    const drawArrays = useCallback((mode: GLenum, first: GLint, count: GLsizei, instances?: GLsizei) => {
        if (instances !== undefined) {
            gl?.drawArraysInstanced(mode, first, count, instances);
          } else {
            gl?.drawArrays(mode, first, count);
          }    
    }, [gl]);

    const drawElements = useCallback((mode: GLenum, count: GLsizei, type: GLenum, offset: GLintptr, instances?: GLsizei) => {
        if (instances !== undefined) {
            gl?.drawElementsInstanced(mode, count, type, offset, instances);
          } else {
            gl?.drawElements(mode, count, type, offset);
          }    
    }, [gl]);

    return {
        drawArrays,
        drawElements,
    }
}