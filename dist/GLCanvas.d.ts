import { CSSProperties } from "react";
import { ProgramConfig, ProgramId } from "./gl/program/program";
import { GlController, OnChange } from "./control/gl-controller";
import { GlAction } from "./pipeline/GlAction";
import { Script } from "./gl/actionscripts/Script";
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
export default function GLCanvas(props?: Props): JSX.Element;
