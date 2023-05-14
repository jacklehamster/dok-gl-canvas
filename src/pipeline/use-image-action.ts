import { useCallback, useRef } from "react";
import { GlAction } from "./GlAction";

type TextureId = "TEXTURE0"|"TEXTURE1"|"TEXTURE2"|"TEXTURE3"|"TEXTURE4"|"TEXTURE5"|"TEXTURE6"|"TEXTURE7"|"TEXTURE8"|"TEXTURE9"
|"TEXTURE10"|"TEXTURE11"|"TEXTURE12"|"TEXTURE13"|"TEXTURE14"|"TEXTURE15"|"TEXTURE16"|"TEXTURE17"|"TEXTURE18"|"TEXTURE19"
|"TEXTURE20"|"TEXTURE21"|"TEXTURE22"|"TEXTURE23"|"TEXTURE24"|"TEXTURE25"|"TEXTURE26"|"TEXTURE27"|"TEXTURE28"|"TEXTURE29"
|"TEXTURE30"|"TEXTURE31";

export interface ImageAction {
    action: "load-image";
    src: string;
    imageId: string;
    onLoad?: GlAction[];
}

export interface VideoAction {
    action: "load-video";
    src: string;
    imageId: string;
    onFrame?: GlAction[];
}

export interface TextureAction {
    action: "load-texture";
    imageId: string;
    textureId: TextureId;
}

interface Props {
    gl?: WebGL2RenderingContext;
}

export default function useImageAction({ gl }: Props) {
    const images = useRef<Record<string, TexImageSource>>({});

    const loadTexture = useCallback((source: TexImageSource, textureId: TextureId): () => void => {
        if (!gl) {
            return () => {};
        }
        const texture = gl.createTexture();
        gl.activeTexture(gl[textureId]);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        return () => gl.deleteTexture(texture);
    }, [gl]);

    const executeLoadImageAction = useCallback(
            ({src, imageId, onLoad = [] }: ImageAction,
            executePipeline: (actions: GlAction[]) => void) => {
        const image = new Image();
        image.src = src;
        images.current[imageId] = image;
        image.addEventListener("load", () => {
            executePipeline(onLoad);
        });
        return () => {
            delete images.current[imageId];
        };
    }, [images]);

    const executeVideoAction = useCallback(({ src, imageId }: VideoAction) => {
        const video = document.createElement("video");
        video.src = src;
        video.loop = true;
        video.play();
        video.addEventListener("playing", () => {
            images.current[imageId] = video;
        });
        return () => {
            delete images.current[imageId];
            video.pause();
        };
    }, [images]);

    const executeLoadTextureAction = useCallback(({ imageId, textureId }: TextureAction): () => void => {
        const image = images.current[imageId];
        if (image) {
            const cleanup = loadTexture(image, textureId);
            return () => cleanup();
        }
        return () => {};
    }, [loadTexture, images]);

    return {
        executeLoadImageAction,
        executeVideoAction,
        executeLoadTextureAction,
    }
}