import { GlType, GlUsage } from "dok-gl-actions/dist/types";
export declare function useTypes(): {
    getGlType: (type: GlType | string | undefined) => GLenum;
    getTypedArray: (type: GlType | string | undefined) => Int8ArrayConstructor | Float32ArrayConstructor | Int16ArrayConstructor | Uint8ArrayConstructor | Uint16ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor;
    getGlUsage: (usage: GlUsage | string | undefined) => GLenum;
    getByteSize: (type?: "BYTE" | "FLOAT" | "SHORT" | "UNSIGNED_BYTE" | "UNSIGNED_SHORT" | "INT" | "UNSIGNED_INT" | undefined) => number;
};
