import { TextureIndex } from "dok-gl-actions";
import { GlBufferTarget, GlUsage, ValueOf } from "dok-gl-actions/dist/types";
import { TextureId } from "../../pipeline/actions/use-image-action";
export declare function useTypes(): {
    getGlUsage: (usage: ValueOf<GlUsage | string | undefined>) => ValueOf<GLenum>;
    getBufferTarget: (target: ValueOf<GlBufferTarget | string | undefined>) => ValueOf<GLenum>;
    convertTextureId: (index: TextureIndex | number) => TextureId | undefined;
};
