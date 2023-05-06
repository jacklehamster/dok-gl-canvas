import { CSSProperties } from "react";
import { ProgramConfig, ProgramId } from "./gl/program/program";
import { GlController, OnChange } from "./control/gl-controller";
export interface Props {
    pixelRatio?: number;
    onChange?: OnChange;
    style?: CSSProperties;
    webglAttributes?: WebGLContextAttributes;
    initialProgram?: ProgramId;
    programs?: ProgramConfig[];
    controller?: GlController;
}
export default function GLCanvas(props?: Props): JSX.Element;
