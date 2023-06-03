import { CSSProperties } from "react";
import { ProgramConfig } from "./gl/program/program";
import { GlController } from "./control/gl-controller";
import { Script } from "dok-actions";
import { GlAction } from "./gl/actions/GlAction";
import { CustomAction } from "./pipeline/actions/custom/use-custom-action";
export interface Props {
    pixelRatio?: number;
    style?: CSSProperties;
    webglAttributes?: WebGLContextAttributes;
    programs?: ProgramConfig[];
    controller?: GlController;
    scripts?: Script<GlAction | CustomAction>[];
}
export default function GLCanvas(props?: Props): JSX.Element;
