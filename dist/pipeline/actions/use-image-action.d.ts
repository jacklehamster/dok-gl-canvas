import { GlAction } from "./GlAction";
import { Context } from "../use-action-pipeline";
import { ExecutionStep } from "../use-script-execution";
declare type TextureId = "TEXTURE0" | "TEXTURE1" | "TEXTURE2" | "TEXTURE3" | "TEXTURE4" | "TEXTURE5" | "TEXTURE6" | "TEXTURE7" | "TEXTURE8" | "TEXTURE9" | "TEXTURE10" | "TEXTURE11" | "TEXTURE12" | "TEXTURE13" | "TEXTURE14" | "TEXTURE15" | "TEXTURE16" | "TEXTURE17" | "TEXTURE18" | "TEXTURE19" | "TEXTURE20" | "TEXTURE21" | "TEXTURE22" | "TEXTURE23" | "TEXTURE24" | "TEXTURE25" | "TEXTURE26" | "TEXTURE27" | "TEXTURE28" | "TEXTURE29" | "TEXTURE30" | "TEXTURE31";
declare type Url = string;
declare type ImageId = string;
export interface ImageAction {
    action: "load-image";
    src: Url;
    imageId: ImageId;
    onLoad?: GlAction[];
}
export interface VideoAction {
    action: "load-video";
    src: Url;
    imageId: ImageId;
    volume?: number;
}
export interface TextureAction {
    action: "load-texture";
    imageId: ImageId;
    textureId: TextureId;
}
interface Props {
    gl?: WebGL2RenderingContext;
}
export default function useImageAction({ gl }: Props): {
    executeLoadImageAction: ({ src, imageId }: ImageAction, context: Context, onLoad: ExecutionStep[]) => void;
    executeVideoAction: ({ src, imageId, volume }: VideoAction, context: Context) => void;
    executeLoadTextureAction: ({ imageId, textureId }: TextureAction) => void;
};
export {};
