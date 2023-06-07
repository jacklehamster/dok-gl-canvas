import { useCallback, useEffect, useRef } from "react";
import { clearRecord } from "../../utils/object-utils";

export type TextureId = "TEXTURE0"|"TEXTURE1"|"TEXTURE2"|"TEXTURE3"|"TEXTURE4"|"TEXTURE5"|"TEXTURE6"|"TEXTURE7"|"TEXTURE8"|"TEXTURE9"
|"TEXTURE10"|"TEXTURE11"|"TEXTURE12"|"TEXTURE13"|"TEXTURE14"|"TEXTURE15"|"TEXTURE16"|"TEXTURE17"|"TEXTURE18"|"TEXTURE19"
|"TEXTURE20"|"TEXTURE21"|"TEXTURE22"|"TEXTURE23"|"TEXTURE24"|"TEXTURE25"|"TEXTURE26"|"TEXTURE27"|"TEXTURE28"|"TEXTURE29"
|"TEXTURE30"|"TEXTURE31";

export type Url = string;
export type ImageId = string;

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
        const imagesRecord = images.current;
        const textureRecord = textureBuffers.current;
        return () => {
            clearRecord(imagesRecord);
            clearRecord(textureRecord, texture => gl?.deleteTexture(texture));
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

    const loadImage = useCallback(<T>(
            src: Url,
            imageId: ImageId,
            onLoad?: (param?: T) => void,
            onLoadParam?: T) => {
        const image = new Image();
        image.src = src;
        const imageLoaded = () => {
            images.current[imageId] = {
                src: image,
                activated: false,
            };
            onLoad?.(onLoadParam);
        };
        image.addEventListener("load", imageLoaded, { once: true });
        image.addEventListener("error", (e: ErrorEvent) => {
            console.error("image error", e.error);
        });
        return () => image.removeEventListener("load", imageLoaded);
    }, [images]);

    const loadVideo = useCallback((src: Url, imageId: ImageId, volume?: number): () => void => {
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
        video.addEventListener("error", (e: ErrorEvent) => {
            console.error("video error", e.error);
        });
    
        return () => {
            video.pause();
            video.removeEventListener("playing", videoPlaying);
        };
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

    const executeLoadTextureAction = useCallback((imageId: ImageId, textureId: TextureId): void => {
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

    const hasImageId = useCallback((imageId: ImageId): boolean => {
        return !!images.current[imageId];
    }, [images]);

    return {
        loadImage,
        loadVideo,
        executeLoadTextureAction,
        hasImageId,
    }
}