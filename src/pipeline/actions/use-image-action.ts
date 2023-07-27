import { useCallback, useEffect, useMemo, useRef } from "react";
import { clearRecord } from "../../utils/object-utils";
import { Context } from "dok-gl-actions";

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

const MAX_TEXTURE_SIZE = 4096;

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

    const tempCanvas = useRef(document.createElement("canvas"));
    const tempContext = useMemo(() => {
        const context = tempCanvas.current.getContext("2d");
        if (context) {
            context.imageSmoothingEnabled = true;
        }
        return context;
    }, [tempCanvas]);
    useEffect(() => {
        if (window.location.search.indexOf("debug-canvas") >= 0 && tempCanvas.current) {
            document.body.appendChild(tempCanvas.current);
        }
    }, [tempCanvas]);

    const applyTexImage2d = useCallback((
            source: TexImageSource,
            [srcX, srcY, srcWidth, srcHeight],
            [dstX, dstY, dstWidth, dstHeight]) => {
        if (!srcWidth && !srcHeight && !dstWidth && !dstHeight) {
            gl?.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
            gl?.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl?.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        } else {
            if (!tempContext) {
                return;
            }
            const canvas = tempContext?.canvas;
            if (source instanceof ImageData) {
                canvas.width = dstWidth || source.width;
                canvas.height = dstHeight || source.height;
                tempContext.putImageData(source, 0, 0);
                if (srcX || srcY) {
                    console.warn("Offset not available when sending imageData");
                }
            } else {
                const sourceWidth = srcWidth || (source as {width:number}).width;
                const sourceHeight = srcHeight || (source as {height:number}).height;
                canvas.width = dstWidth || sourceWidth;
                canvas.height = dstHeight || sourceHeight;
                tempContext.drawImage(source, srcX, srcY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
            }
    
            gl?.texSubImage2D(gl.TEXTURE_2D, 0, dstX, dstY, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        }
    }, [gl, tempContext]);

    const loadTexture = useCallback((
            source: TexImageSource,
            textureId: TextureId,
            texture: WebGLTexture,
            sourceRect: [number, number, number, number],
            destRect: [number, number, number, number]): void => {
        gl?.activeTexture(gl[textureId]);
        gl?.bindTexture(gl.TEXTURE_2D, texture);
        applyTexImage2d(source, sourceRect, destRect);
        gl?.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }, [gl, applyTexImage2d]);

    const loadImage = useCallback((
            src: Url,
            imageId: ImageId,
            onLoad?: (image: HTMLImageElement) => void) => {
        const image = new Image();
        image.src = src;
        const imageLoaded = () => {
            images.current[imageId] = {
                src: image,
                activated: false,
            };
            onLoad?.(image);
        };
        image.addEventListener("load", imageLoaded, { once: true });
        image.addEventListener("error", (e: ErrorEvent) => {
            console.error("image error", e.error);
        });
        return () => image.removeEventListener("load", imageLoaded);
    }, [images]);

    const loadVideo = useCallback(
        (src: Url | "webcam",
        imageId: ImageId,
        volume: number | undefined,
        context: Context,
        onLoad?: (video: HTMLVideoElement) => void,
    ): void => {
        const video = document.createElement("video");
        video.loop = true;
        if (volume !== undefined) {
            video.volume = volume;
        }
        const startVideo = () => video.play();
        const videoPlaying = () => {
            images.current[imageId] = {
                src: video,
                activated: false,
            };
            onLoad?.(video);
        };

        video.addEventListener("loadedmetadata", startVideo);
        video.addEventListener("playing", videoPlaying, { once: true });
        video.addEventListener("error", (e: ErrorEvent) => console.error("video error", e.error));

        let cancelled = false;
        if (src === "webcam") {
            navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
                if (cancelled) {
                    return;
                }
                video.srcObject = stream;
                context.addCleanup(() => {
                    stream.getTracks().forEach(track => track.stop());
                });
            });
        } else {
            video.src = src;
        }

        context.addCleanup(() => {
            cancelled = true;
            video.pause();
            video.removeEventListener("playing", videoPlaying);
            video.removeEventListener("loadmetadata", startVideo);
        });
    }, [images]);

    const getTexture = useCallback((textureId: TextureId) => {
        if (!textureBuffers.current[textureId]) {
            const texture = gl?.createTexture();
            if (!texture) {
                return;
            }
            gl?.bindTexture(gl.TEXTURE_2D, texture);
            gl?.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, MAX_TEXTURE_SIZE, MAX_TEXTURE_SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            textureBuffers.current[textureId] = texture;
        }
        return textureBuffers.current[textureId];
    }, [textureBuffers, gl]);

    const initTexture = useCallback((
        texture?: TextureId,
        width?: GLsizei,
        height?: GLsizei,
    ) => {
        if (texture) {
            getTexture(texture);
            gl?.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width ?? MAX_TEXTURE_SIZE, height ?? MAX_TEXTURE_SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);    
        } else {
            console.warn("Invalid texture to init");
        }
    }, [getTexture, gl]);

    const executeLoadTextureAction = useCallback((
            imageId: ImageId,
            textureId: TextureId | undefined, 
            sourceRect: [number, number, number, number],
            destRect: [number, number, number, number]): void => {
        if (!textureId) {
            console.warn("Invalid texture Id");
            return;
        }
        const imageInfo = images.current[imageId];
        if (imageInfo) {
            const texture = getTexture(textureId);
            if (texture) {
                if (imageInfo.activated) {
                    gl?.bindTexture(gl.TEXTURE_2D, texture);
                    applyTexImage2d(imageInfo.src, sourceRect, destRect);
                } else {
                    loadTexture(imageInfo.src, textureId, texture, sourceRect, destRect);
                    imageInfo.activated = true;
                }    
            }
        }
    }, [getTexture, gl, applyTexImage2d, loadTexture]);

    const hasImageId = useCallback((imageId: ImageId): boolean => {
        return !!images.current[imageId];
    }, [images]);

    return {
        loadImage,
        loadVideo,
        executeLoadTextureAction,
        initTexture,
        hasImageId,
    }
}