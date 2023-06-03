import React, { CSSProperties, RefObject, useEffect, useMemo, useState } from "react";
import { useGL } from "./gl/use-gl";
import { useCanvasSize } from "./dimension/use-canvas-size";
import { ProgramConfig } from "./gl/program/program";
import { useProgram } from "./gl/program/use-program";
import { GlConfig, GlController } from "./control/gl-controller";
import { Script } from "dok-actions";
import { GlAction, useGlAction } from "./gl/actions/GlAction";
import { CustomAction } from "./pipeline/actions/custom/use-custom-action";

export interface Props {
    pixelRatio?: number;
    style?: CSSProperties;
    webglAttributes?: WebGLContextAttributes;
    programs?: ProgramConfig[];
    controller?: GlController;
    scripts?: Script<GlAction|CustomAction>[];
}

export default function GLCanvas(props?: Props): JSX.Element {
    const {
        pixelRatio = devicePixelRatio,
        controller,
        webglAttributes,
        programs: initialPrograms,
        style,
        scripts = []
    } = props ?? {};
    const canvasRef: RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>(null);
    const gl = useGL({ canvasRef, webglAttributes });
    const { width, height } = useCanvasSize({ gl, canvasRef, pixelRatio });
    const [programs, setPrograms] = useState<ProgramConfig[]>(initialPrograms ?? []);
    const { usedProgram, getAttributeLocation, getUniformLocation, setActiveProgram } = useProgram({ gl, programs });

    const glConfig: GlConfig | undefined = useMemo(() => (gl ? {
        gl, getUniformLocation, getAttributeLocation,
    }: undefined), [gl, getUniformLocation, getAttributeLocation]);

    const { getScriptProcessor } = useGlAction({ gl, getAttributeLocation, getUniformLocation, setActiveProgram });

    const processor = useMemo(() => getScriptProcessor(scripts), [scripts, getScriptProcessor]);

    const ready = useMemo(() => !!(gl && usedProgram && width && height && glConfig), [gl, usedProgram, width, height, glConfig]);
    useEffect((): void | (() => void) => {
        if (ready) {
            const initCleanup = processor?.runByTags(["init"]);
            const loopCleanup = processor?.loopByTags(["loop"]);

            return () => {
                initCleanup?.();
                loopCleanup?.();
            };
        }
    }, [usedProgram, glConfig, ready, processor]);

    useEffect(() => {
        if (controller) {
            controller.setActiveProgram = setActiveProgram;
            controller.setPrograms = setPrograms;
        }
    }, [
        controller,
        setActiveProgram,
        setPrograms,
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
