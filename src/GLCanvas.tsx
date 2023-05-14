import React, { CSSProperties, RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { useGL } from "./gl/use-gl";
import { useCanvasSize } from "./dimension/use-canvas-size";
import { ProgramConfig, ProgramId } from "./gl/program/program";
import { useProgram } from "./gl/program/use-program";
import { GlConfig, GlController, OnChange } from "./control/gl-controller";
import useActionPipeline from "./pipeline/use-action-pipeline";
import { GlAction } from "./pipeline/GlAction";
import useLoopPipeline from "./pipeline/use-loop-pipeline";
import { Script, useActionScripts } from "./gl/actionscripts/Script";

export interface Props {
    pixelRatio?: number;
    onChange?: OnChange;
    style?: CSSProperties;
    webglAttributes?: WebGLContextAttributes;
    initialProgram?: ProgramId;
    programs?: ProgramConfig[];
    actionScripts?: Script[];
    controller?: GlController;
    actionPipeline?: GlAction[];
    actionLoop?: GlAction[];
}

export default function GLCanvas(props?: Props): JSX.Element {
    const {
        pixelRatio = devicePixelRatio,
        onChange,
        controller,
        initialProgram,
        webglAttributes,
        programs,
        actionScripts = [],
        style,
        actionLoop = [],
        actionPipeline = [],
    } = props ?? {};
    const canvasRef: RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>(null);
    const gl = useGL({ canvasRef, webglAttributes });
    const { usedProgram, getAttributeLocation, getUniformLocation, setActiveProgram } = useProgram({ gl, initialProgram, programs });
    const { width, height } = useCanvasSize({ gl, canvasRef, pixelRatio })
    const [change, setChange] = useState<OnChange | undefined>(() => onChange);
    const [loopActions, setLoopActions] = useState<string|GlAction[]>(actionLoop);
    const [pipelineActions, setPipelineActions] = useState<string|GlAction[]>(actionPipeline);

    const glConfig: GlConfig | undefined = useMemo(() => (gl ? {
        gl, getUniformLocation, getAttributeLocation,
    }: undefined), [gl, getUniformLocation, getAttributeLocation]);

    const { getScript } = useActionScripts({ scripts: actionScripts });

    const { executePipeline, getBufferAttribute } = useActionPipeline({
        gl,
        getAttributeLocation,
        getUniformLocation,
        setActiveProgram,
        getScript,
    });
    const loopPipeline = useLoopPipeline({ executePipeline });

    useEffect(() => {
        if (usedProgram && glConfig) {
            const pipelineCleanup = executePipeline(getScript(pipelineActions));
            const loopCleanup = loopPipeline(getScript(loopActions));
            const cleanup = change?.(glConfig);
            return () => {
                pipelineCleanup();
                loopCleanup();
                cleanup?.();
            };
        }
        return;
    }, [usedProgram, change, glConfig, executePipeline, loopPipeline, pipelineActions, loopActions, getScript]);

    const updateOnChange = useCallback((refreshMethod: OnChange) => {
        setChange(() => refreshMethod);
    }, [setChange]);

    const executeScript = useCallback((script: GlAction[] | string) => {
        return executePipeline(getScript(script));
    }, [getScript, executePipeline]);

    useEffect(() => {
        if (controller) {
            controller.setOnChange = updateOnChange;
            controller.setActiveProgram = setActiveProgram;
            controller.setLoopActions = setLoopActions;
            controller.setPipelineActions = setPipelineActions;
            controller.getBufferAttribute = getBufferAttribute;
            controller.executeScript = executeScript;
        }
    }, [
        controller,
        updateOnChange,
        setActiveProgram,
        setLoopActions,
        setPipelineActions,
        getBufferAttribute,
        executeScript,
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
