import { CSSProperties } from "react";
import { GlController } from "./control/gl-controller";
import { Script } from "dok-actions";
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
export default function GLCanvas(props?: Props): JSX.Element;
