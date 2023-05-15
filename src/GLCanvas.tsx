import React, { CSSProperties, RefObject, useEffect, useMemo, useState } from "react";
import { useGL } from "./gl/use-gl";
import { useCanvasSize } from "./dimension/use-canvas-size";
import { ProgramConfig } from "./gl/program/program";
import { useProgram } from "./gl/program/use-program";
import { GlConfig, GlController } from "./control/gl-controller";
import useActionPipeline from "./pipeline/use-action-pipeline";
import { GlAction } from "./pipeline/actions/GlAction";
import useLoopPipeline from "./pipeline/use-loop-pipeline";
import { Script, useActionScripts } from "./gl/actionscripts/Script";

export interface Props {
    pixelRatio?: number;
    style?: CSSProperties;
    webglAttributes?: WebGLContextAttributes;
    programs?: ProgramConfig[];
    actionScripts?: Script[];
    actionPipeline?: GlAction[];
    actionLoop?: GlAction[];
    controller?: GlController;
}

export default function GLCanvas(props?: Props): JSX.Element {
    const {
        pixelRatio = devicePixelRatio,
        controller,
        webglAttributes,
        programs: initialPrograms,
        style,
        actionScripts = [],
        actionLoop = [],
        actionPipeline = [],
    } = props ?? {};
    const canvasRef: RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>(null);
    const gl = useGL({ canvasRef, webglAttributes });
    const { width, height } = useCanvasSize({ gl, canvasRef, pixelRatio });
    const [loopActions, setLoopActions] = useState<string|GlAction[]>(actionLoop);
    const [pipelineActions, setPipelineActions] = useState<string|GlAction[]>(actionPipeline);
    const [scripts, setScripts] = useState<Script[]>(actionScripts);
    const [programs, setPrograms] = useState<ProgramConfig[]>(initialPrograms ?? []);
    const { usedProgram, getAttributeLocation, getUniformLocation, setActiveProgram } = useProgram({ gl, programs });

    const glConfig: GlConfig | undefined = useMemo(() => (gl ? {
        gl, getUniformLocation, getAttributeLocation,
    }: undefined), [gl, getUniformLocation, getAttributeLocation]);

    const { getScript } = useActionScripts({ scripts });

    const { context, executePipeline, convertActions } = useActionPipeline({
        gl,
        getAttributeLocation,
        getUniformLocation,
        setActiveProgram,
        getScript,
    });
    const loopPipeline = useLoopPipeline({ executePipeline });

    useEffect((): void | (() => void) => {
        if (usedProgram && glConfig && context) {
            const pipelineSteps = convertActions(getScript(pipelineActions));
            const loopSteps = convertActions(getScript(loopActions));

            executePipeline(pipelineSteps, context);
            loopPipeline(loopSteps, context);
            return () => {
                context.cleanupActions.forEach(cleanup => cleanup());
                context.cleanupActions.length = 0;
            };
        }
    }, [usedProgram, glConfig, executePipeline, loopPipeline, pipelineActions, loopActions, getScript, context, convertActions]);

    useEffect(() => {
        if (controller) {
            controller.setActiveProgram = setActiveProgram;
            controller.setLoopActions = setLoopActions;
            controller.setPipelineActions = setPipelineActions;
            controller.setScripts = setScripts;
            controller.setPrograms = setPrograms;
        }
    }, [
        controller,
        setActiveProgram,
        setLoopActions,
        setPipelineActions,
        setScripts,
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
