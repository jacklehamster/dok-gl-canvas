interface Props {
    gl?: WebGL2RenderingContext;
}
export declare function useDraw({ gl }: Props): {
    drawArrays: (mode: GLenum, first: GLint, count: GLsizei, instances?: number | undefined) => void;
    drawElements: (mode: GLenum, count: GLsizei, type: GLenum, offset: GLintptr, instances?: number | undefined) => void;
};
export {};
