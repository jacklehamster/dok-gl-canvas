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

export type LocationName = string;

export interface BufferAttributeAction {
    action: "buffer-attribute",
    location: LocationName;
    buffer: number[] | Float32Array | GLsizeiptr;
    usage?: Usage;
    size: GLint & (1 | 2 | 3 | 4);
    type?: Type;
    normalized?: boolean;
    stride?: GLsizei;
    offset?: GLintptr;
    divisor?: GLuint;
}

export interface BufferSubDataAction {
    action: "buffer-sub-data",
    location: LocationName;
    buffer: number[] | Float32Array;
    dstByteOffset?: GLintptr;
    srcOffset?: GLuint;
    length?: GLuint;
}
