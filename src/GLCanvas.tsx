import React, { CSSProperties, RefObject, useEffect, useMemo, useState } from "react";
import { useGL } from "./gl/use-gl";
import { useCanvasSize } from "./dimension/use-canvas-size";
import { ProgramConfig, ProgramId } from "./gl/program/program";
import { useProgram } from "./gl/program/use-program";
import { GlConfig, GlController, OnChange } from "./control/gl-controller";

export interface Props {
    pixelRatio?: number;
    onChange?: OnChange;
    style?: CSSProperties;
    webglAttributes?: WebGLContextAttributes;
    initialProgram?: ProgramId;
    programs?: ProgramConfig[];
    controller?: GlController;
}

export default function GLCanvas(props?: Props): JSX.Element {
    const { pixelRatio = devicePixelRatio, onChange, controller, initialProgram, webglAttributes } = props ?? {};
    const canvasRef: RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>(null);
    const gl = useGL({ canvasRef, webglAttributes });
    const { usedProgram, getAttributeLocation, getUniformLocation } = useProgram({ gl, initialProgram, programs: props?.programs, controller });
    const { width, height } = useCanvasSize({ gl, canvasRef, pixelRatio })
    const [change, setChange] = useState<OnChange | undefined>(() => onChange);

    const glConfig: GlConfig | undefined = useMemo(() => (gl ? {
        gl, getUniformLocation, getAttributeLocation,
    }: undefined), [gl, getUniformLocation, getAttributeLocation]);

    useEffect(() => {
        if (usedProgram && change && glConfig) {
            const cleanup = change(glConfig);
            return () => {
                cleanup?.();
            };
        }
        return;
    }, [usedProgram, change, glConfig]);

    useEffect(() => {
        if (controller) {
            controller.setOnChange = setChange;
        }
    }, [controller, setChange]);

    return <canvas ref={canvasRef}
            width={width}
            height={height}
            style={{
                ...props?.style,
                width: "100%",
                height: "100%",
            }}>
        </canvas>;
}
