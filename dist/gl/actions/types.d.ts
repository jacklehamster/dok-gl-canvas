import { GlBufferTarget, GlUsage, ValueOf } from "dok-gl-actions/dist/types";
export declare function useTypes(): {
    getGlUsage: (usage: ValueOf<GlUsage | string | undefined>) => ValueOf<GLenum>;
    getBufferTarget: (target: ValueOf<GlBufferTarget | string | undefined>) => ValueOf<GLenum>;
};
