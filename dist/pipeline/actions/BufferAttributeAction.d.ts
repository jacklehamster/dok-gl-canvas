import { BufferResolution, NumberResolution, StringResolution } from "../data/data-provider";
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
    FLOAT = 4,
    INT = 5,
    UNSIGNED_INT = 6
}
export declare type LocationName = string;
export declare type LocationResolution = LocationName | StringResolution | [LocationName | StringResolution, 0 | 1 | 2 | 3];
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
    action: "vertexAttribPointer";
    location: LocationResolution;
    size: GLint & (1 | 2 | 3 | 4) | NumberResolution;
    type?: Type;
    normalized?: boolean;
    stride?: GLsizei | NumberResolution;
    offset?: GLintptr | NumberResolution;
    rows?: 1 | 2 | 3 | 4 | NumberResolution;
}
export interface VertexAttribDivisor {
    action: "vertexAttribDivisor";
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
    action: "buffer-sub-data";
    buffer: BufferResolution;
    dstByteOffset?: GLintptr | NumberResolution;
    srcOffset?: GLuint | NumberResolution;
    length?: GLuint | NumberResolution;
    type?: Type;
}
