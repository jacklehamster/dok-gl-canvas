import React, { CSSProperties, RefObject, useEffect, useMemo } from "react";
import { useGL } from "./gl/use-gl";
import { useCanvasSize } from "./dimension/use-canvas-size";
import { useProgram } from "./gl/program/use-program";
import { GlConfig, GlController } from "./control/gl-controller";
import { Script } from "dok-actions";
import { useGlAction } from "./gl/actions/use-gl-actions";
import { ProgramConfig } from "dok-gl-actions/dist/program/program";
import { GlAction } from "dok-gl-actions";

export interface Props {
    pixelRatio?: number;
    style?: CSSProperties;
    webglAttributes?: WebGLContextAttributes;
    programs?: ProgramConfig[];
    controller?: GlController;
    scripts?: Script<GlAction>[];
}

export default function GLCanvas(props?: Props): JSX.Element {
    const {
        pixelRatio = devicePixelRatio,
        controller,
        webglAttributes,
        programs,
        style,
        scripts = []
    } = props ?? {};
    const canvasRef: RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>(null);
    const gl = useGL({ canvasRef, webglAttributes });
    const { width, height } = useCanvasSize({ gl, canvasRef, pixelRatio });
    const { getAttributeLocation, getUniformLocation, activateProgram, activeProgram } = useProgram({ gl, programs });

    const glConfig: GlConfig | undefined = useMemo(() => (gl ? {
        gl, getUniformLocation, getAttributeLocation,
    }: undefined), [gl, getUniformLocation, getAttributeLocation]);

    const { getScriptProcessor } = useGlAction({ gl, getAttributeLocation, getUniformLocation, activateProgram });

    const processor = useMemo(() => getScriptProcessor(scripts), [
        scripts, getScriptProcessor,
    ]);
    
    const ready = useMemo(() => !!(gl && activeProgram && width && height && glConfig), [gl, activeProgram, width, height, glConfig]);

    useEffect((): void | (() => void) => {
        if (ready) {
            const cleanup = processor?.runByTags(["main"]);
            return async () => (await cleanup)?.();
        }
    }, [activeProgram, ready, processor]);

    useEffect(() => {
        if (controller) {
            controller.setActiveProgram = activateProgram;
        }
    }, [
        controller,
        activateProgram,
    ]);

    return <canvas ref={canvasRef}
        width={width}
        height={height}
        style={{
            width: "100%",
            height: "100%",
            ...style,
        }}>
    </canvas>;
}
