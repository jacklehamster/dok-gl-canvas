import { DrawArraysAction } from "./draw-vertex-action";
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
export interface BufferAttributeAction {
    action: "buffer-attribute";
    location: string;
    buffer: number[];
    usage?: Usage;
    size: GLint & (1 | 2 | 3 | 4);
    type?: Type;
    normalized?: boolean;
    stride?: GLsizei;
    offset?: GLintptr;
    divisor?: GLuint;
}
export interface ShaderAttributes {
    attributeBuffers: BufferAttributeAction[];
    drawVertex: DrawArraysAction;
}
