import { BufferResolution, NumberResolution, StringResolution } from "../data/data-provider";

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
    INT,
    UNSIGNED_INT,
};

export type LocationName = string;
export type LocationResolution = LocationName | StringResolution | [LocationName|StringResolution, 0|1|2|3];

export interface CreateBufferAction {
    action: "createBuffer";
    location: LocationResolution;
    bind?: boolean;
}

export interface BindBufferAction {
    action: "bindBuffer";
    location: LocationResolution;
}

export interface VertexAttribPointerAction {
    action: "vertexAttribPointer"
    location: LocationResolution;
    size: GLint & (1 | 2 | 3 | 4) | NumberResolution;
    type?: Type;
    normalized?: boolean;
    stride?: GLsizei | NumberResolution;
    offset?: GLintptr | NumberResolution;
    rows?: 1 | 2 | 3 | 4 | NumberResolution;
}

export interface VertexAttribDivisor {
    action: "vertexAttribDivisor",
    location: LocationResolution;
    divisor?: GLuint | NumberResolution;
    rows?: 1 | 2 | 3 | 4 | NumberResolution;
}

export interface EnableVertexAttribArray {
    action: "enableVertexAttribArray";
    location: LocationResolution;
    rows?: 1 | 2 | 3 | 4 | NumberResolution;
}

export interface BufferDataAction {
    action: "buffer-data";
    location: LocationResolution;
    buffer: BufferResolution | GLsizeiptr;
    usage?: Usage;
    type?: Type;
}

export interface BufferSubDataAction {
    action: "buffer-sub-data",
    buffer: BufferResolution;
    dstByteOffset?: GLintptr | NumberResolution;
    srcOffset?: GLuint | NumberResolution;
    length?: GLuint | NumberResolution;
    type?: Type;
}
