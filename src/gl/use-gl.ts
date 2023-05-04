import React, { RefObject, useState } from "react";

interface Props {
    canvasRef: RefObject<HTMLCanvasElement>;
    webglAttributes?: WebGLContextAttributes;
}

const DEFAULT_ATTRIBUTES: WebGLContextAttributes = {
    alpha: true,
    antialias: false,
    depth: true,
    desynchronized: true,
    failIfMajorPerformanceCaveat: undefined,
    powerPreference: "default",
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    stencil: false,
};

export function useGL({ canvasRef, webglAttributes }: Props): WebGL2RenderingContext | undefined {
    const [gl, setGL] = useState<WebGL2RenderingContext | undefined>();

    React.useLayoutEffect(() => {
        const canvas = canvasRef.current;
        setGL(canvas?.getContext?.("webgl2", {
            ...DEFAULT_ATTRIBUTES,
            ...webglAttributes,
        }) ?? undefined);
    }, []);
    return gl;
}