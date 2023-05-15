import { useCallback, useEffect, useRef } from "react";
import { GlAction } from "./GlAction";
import { Context } from "../use-action-pipeline";
import { ExecutionStep } from "../use-script-execution";
import { clearRecord } from "../../utils/object-utils";

type TextureId = "TEXTURE0"|"TEXTURE1"|"TEXTURE2"|"TEXTURE3"|"TEXTURE4"|"TEXTURE5"|"TEXTURE6"|"TEXTURE7"|"TEXTURE8"|"TEXTURE9"
|"TEXTURE10"|"TEXTURE11"|"TEXTURE12"|"TEXTURE13"|"TEXTURE14"|"TEXTURE15"|"TEXTURE16"|"TEXTURE17"|"TEXTURE18"|"TEXTURE19"
|"TEXTURE20"|"TEXTURE21"|"TEXTURE22"|"TEXTURE23"|"TEXTURE24"|"TEXTURE25"|"TEXTURE26"|"TEXTURE27"|"TEXTURE28"|"TEXTURE29"
|"TEXTURE30"|"TEXTURE31";

type Url = string;
type ImageId = string;

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

interface ImageInfo {
    src: TexImageSource;
    activated: boolean;
}

interface Props {
    gl?: WebGL2RenderingContext;
}

export default function useImageAction({ gl }: Props) {
    const images = useRef<Record<ImageId, ImageInfo>>({});
    const textureBuffers = useRef<Record<TextureId | string, WebGLTexture>>({});

    useEffect(() => {
        return () => {
            clearRecord(images.current);
            clearRecord(textureBuffers.current, texture => gl?.deleteTexture(texture));
        };
    }, [textureBuffers, images, gl]);

    const textImage2d = useCallback((source: TexImageSource, texture: WebGLTexture) => {
        gl?.bindTexture(gl.TEXTURE_2D, texture);
        gl?.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    }, [gl]);

    const loadTexture = useCallback((source: TexImageSource, textureId: TextureId, texture: WebGLTexture): void => {
        gl?.activeTexture(gl[textureId]);
        textImage2d(source, texture);
        gl?.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl?.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl?.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }, [gl, textImage2d]);

    const executeLoadImageAction = useCallback(
            ({src, imageId }: ImageAction,
            context: Context,
            onLoad: ExecutionStep[]) => {
        const image = new Image();
        image.src = src;
        const imageLoaded = () => {
            images.current[imageId] = {
                src: image,
                activated: false,
            };
            context.executePipeline(onLoad, context);
        };
        image.addEventListener("load", imageLoaded, { once: true });
        context.cleanupActions.push(() => image.removeEventListener("load", imageLoaded));
    }, [images]);

    const executeVideoAction = useCallback(({ src, imageId, volume }: VideoAction, context: Context) => {
        const video = document.createElement("video");
        video.src = src;
        video.loop = true;
        if (volume !== undefined) {
            video.volume = volume;
        }
        video.play();
        const videoPlaying = () => {
            images.current[imageId] = {
                src: video,
                activated: false,
            };
        };
        video.addEventListener("playing", videoPlaying, { once: true });
        context.cleanupActions.push(() => {
            video.pause();
            video.removeEventListener("playing", videoPlaying);
        });
    }, [images]);

    const getTexture = useCallback((textureId: TextureId) => {
        if (!textureBuffers.current[textureId]) {
            const texture = gl?.createTexture();
            if (!texture) {
                return;
            }
            textureBuffers.current[textureId] = texture;
        }
        return textureBuffers.current[textureId];
    }, [textureBuffers, gl]);

    const executeLoadTextureAction = useCallback(({ imageId, textureId }: TextureAction): void => {
        const imageInfo = images.current[imageId];
        if (imageInfo) {
            const texture = getTexture(textureId);
            if (texture) {
                if (imageInfo.activated) {
                    textImage2d(imageInfo.src, texture);
                } else {
                    loadTexture(imageInfo.src, textureId, texture);
                    imageInfo.activated = true;
                }    
            }
        }
    }, [loadTexture, textImage2d, images, getTexture]);

    return {
        executeLoadImageAction,
        executeVideoAction,
        executeLoadTextureAction,
    }
}