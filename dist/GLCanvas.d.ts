import { CSSProperties } from "react";
import { ProgramConfig } from "./gl/program/program";
import { GlController } from "./control/gl-controller";
import { GlAction } from "./pipeline/actions/GlAction";
import { Script } from "./gl/actionscripts/Script";
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
export default function GLCanvas(props?: Props): JSX.Element;
