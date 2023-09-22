interface Props {
    gl?: WebGL2RenderingContext;
}
export declare function useDraw({ gl }: Props): {
    drawArrays: (mode: GLenum, first: GLint, count: GLsizei, instances?: GLsizei) => void;
    drawElements: (mode: GLenum, count: GLsizei, type: GLenum, offset: GLintptr, instances?: GLsizei) => void;
};
export {};
