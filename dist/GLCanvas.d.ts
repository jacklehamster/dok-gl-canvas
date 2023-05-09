import { CSSProperties } from "react";
import { ProgramConfig, ProgramId } from "./gl/program/program";
import { GlController, OnChange } from "./control/gl-controller";
import { GlAction } from "./pipeline/GlAction";
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
export default function GLCanvas(props?: Props): JSX.Element;
