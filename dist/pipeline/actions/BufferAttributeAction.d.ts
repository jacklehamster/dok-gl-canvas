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
export declare type LocationName = string;
export interface BufferAttributeAction {
    action: "buffer-attribute";
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
    action: "buffer-sub-data";
    location: LocationName;
    buffer: number[] | Float32Array;
    dstByteOffset?: GLintptr;
    srcOffset?: GLuint;
    length?: GLuint;
}
