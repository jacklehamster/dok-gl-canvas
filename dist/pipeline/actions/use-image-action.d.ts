export declare type TextureId = "TEXTURE0" | "TEXTURE1" | "TEXTURE2" | "TEXTURE3" | "TEXTURE4" | "TEXTURE5" | "TEXTURE6" | "TEXTURE7" | "TEXTURE8" | "TEXTURE9" | "TEXTURE10" | "TEXTURE11" | "TEXTURE12" | "TEXTURE13" | "TEXTURE14" | "TEXTURE15" | "TEXTURE16" | "TEXTURE17" | "TEXTURE18" | "TEXTURE19" | "TEXTURE20" | "TEXTURE21" | "TEXTURE22" | "TEXTURE23" | "TEXTURE24" | "TEXTURE25" | "TEXTURE26" | "TEXTURE27" | "TEXTURE28" | "TEXTURE29" | "TEXTURE30" | "TEXTURE31";
export declare type Url = string;
export declare type ImageId = string;
interface Props {
    gl?: WebGL2RenderingContext;
}
export default function useImageAction({ gl }: Props): {
    loadImage: <T>(src: Url, imageId: ImageId, onLoad?: ((param?: T | undefined) => void) | undefined, onLoadParam?: T | undefined) => () => void;
    loadVideo: (src: Url, imageId: ImageId, volume?: number | undefined) => () => void;
    executeLoadTextureAction: (imageId: ImageId, textureId: TextureId) => void;
};
export {};
