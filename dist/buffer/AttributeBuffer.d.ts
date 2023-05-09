export declare enum Usage {
    STATIC_DRAW = 0,
    DYNAMIC_DRAW = 1,
    STREAM_DRAW = 2
}
export declare enum Type {
    BYTE = 0,
    SHORT = 1,
    UNSIGNED_BYTE = 2,
    UNSIGNED_SHORT = 3,
    FLOAT = 4
}
export declare enum ClearFlag {
    COLOR_BUFFER_BIT = 0,
    DEPTH_BUFFER_BIT = 1,
    STENCIL_BUFFER_BIT = 2
}
export interface AttributeBuffer {
    location: string;
    buffer: Float32Array;
    usage?: Usage;
    size: GLint & (1 | 2 | 3 | 4);
    type?: Type;
    normalized?: boolean;
    stride?: GLsizei;
    offset?: GLintptr;
}
export interface DrawVertexParams {
    vertexFirst?: GLint;
    vertexCount: GLsizei;
    clearFlags: ClearFlag[];
}
export interface ShaderAttributes {
    attributeBuffers: AttributeBuffer[];
    drawVertex: DrawVertexParams;
}
