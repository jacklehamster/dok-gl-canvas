import React, { CSSProperties, RefObject, useEffect, useMemo, useState } from "react";
import { useGL } from "./gl/use-gl";
import { useCanvasSize } from "./dimension/use-canvas-size";
import { ProgramConfig, ProgramId } from "./gl/program/program";
import { useProgram } from "./gl/program/use-program";
import { GlConfig, GlController, OnChange } from "./control/gl-controller";
import useActionPipeline from "./pipeline/use-action-pipeline";
import { GlAction } from "./pipeline/GlAction";
import useLoopPipeline from "./pipeline/use-loop-pipeline";

export interface Props {
    pixelRatio?: number;
    onChange?: OnChange;
    style?: CSSProperties;
    webglAttributes?: WebGLContextAttributes;
    initialProgram?: ProgramId;
    programs?: ProgramConfig[];
    controller?: GlController;
    actionPipeline?: GlAction[];
    actionLoop?: GlAction[];
}

export default function GLCanvas(props?: Props): JSX.Element {
    const { pixelRatio = devicePixelRatio, onChange, controller, initialProgram, webglAttributes, style,
        actionLoop,
        actionPipeline,
    } = props ?? {};
    const canvasRef: RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>(null);
    const gl = useGL({ canvasRef, webglAttributes });
    const { usedProgram, getAttributeLocation, getUniformLocation, setActiveProgram } = useProgram({ gl, initialProgram, programs: props?.programs });
    const { width, height } = useCanvasSize({ gl, canvasRef, pixelRatio })
    const [change, setChange] = useState<OnChange | undefined>(() => onChange);
    const [loopActions, setLoopActions] = useState(actionLoop);
    const [pipelineActions, setPipelineActions] = useState(actionPipeline);

    const glConfig: GlConfig | undefined = useMemo(() => (gl ? {
        gl, getUniformLocation, getAttributeLocation,
    }: undefined), [gl, getUniformLocation, getAttributeLocation]);

    const { executePipeline, clear, drawVertices } = useActionPipeline({ gl, getAttributeLocation, getUniformLocation, setActiveProgram });
    const loopPipeline = useLoopPipeline({ executePipeline });

    useEffect(() => {
        if (usedProgram && glConfig) {
            const pipelineCleanup = executePipeline(pipelineActions);
            const loopCleanup = loopPipeline(loopActions);
            const cleanup = change?.(glConfig);
            return () => {
                pipelineCleanup();
                loopCleanup();
                cleanup?.();
            };
        }
        return;
    }, [usedProgram, change, glConfig, executePipeline, pipelineActions, loopActions]);

    useEffect(() => {
        if (controller) {
            controller.setOnChange = setChange;
            controller.clear = clear;
            controller.drawVertices = drawVertices;
            controller.setActiveProgram = setActiveProgram;
            controller.setLoopActions = setLoopActions;
            controller.setPipelineActions = setPipelineActions;
        }
    }, [controller, setChange, drawVertices, clear, setActiveProgram, setLoopActions, setPipelineActions]);

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
