import React, { RefObject, useMemo, useState } from "react";

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
    }, [canvasRef, webglAttributes]);

    const glProxy = useMemo(() => {
        if (window.location.search.indexOf("proxy") < 0) {
            return gl;
        }
        const proxy = gl ? new Proxy<WebGL2RenderingContext>(gl, {
            get(target, prop) {
                const t = target as any;
                const result = t[prop];
                if (typeof(result) === "function") {
                    const f = (...params: any[]) => {
                        const returnValue = result.apply(t, params);
                        console.log(`gl.${String(prop)}(`, params, ') = ', returnValue);
                        return returnValue;
                    };
                    return f;    
                } else {
                    console.log(`gl.${String(prop)} = `, result);
                    return result;
                }
            },
        }) : undefined;
        return proxy;
    }, [gl]);

    return glProxy;
}