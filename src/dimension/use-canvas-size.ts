import React, { RefObject, useEffect, useState } from "react";
import ResizeObserver from "resize-observer-polyfill";

interface Props {
    gl?: WebGL2RenderingContext;
    canvasRef: RefObject<HTMLCanvasElement>;
    pixelRatio: number;    
}

interface State {
    width: number;
    height: number;
}

export function useCanvasSize({ gl, canvasRef, pixelRatio }: Props): State {
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    React.useLayoutEffect((): (void | (() => void)) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const resize = () => {
                const { width, height } = canvas.getBoundingClientRect();
                setWidth(pixelRatio * width);
                setHeight(pixelRatio * height);
            };
            const resizeObserver = new ResizeObserver(resize);
            resizeObserver.observe(canvas);
            const observer = new MutationObserver(resize);
            observer.observe(canvas, { attributes: true, attributeFilter: ["style"] });
            return () => {
                setWidth(0);
                setHeight(0);
                resizeObserver.disconnect();
                observer.disconnect();
            };
        }
    }, [pixelRatio, canvasRef]);

    useEffect(() => {
        gl?.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }, [gl, width, height]);

    return {
        width,
        height,
    };
}