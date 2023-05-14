import { DrawArraysAction } from "./draw-vertex-action";

export enum Usage {
    STATIC_DRAW,
    DYNAMIC_DRAW,
    STREAM_DRAW,
};

export enum Type {
    BYTE,
    SHORT,
    UNSIGNED_BYTE,
    UNSIGNED_SHORT,
    FLOAT,
};

export interface BufferAttributeAction {
    action: "buffer-attribute",
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
