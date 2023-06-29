import ReactHook from "./ReactHook";
import GLCanvasExport, { Props } from "./GLCanvas";
import { Controller } from "./control/controller";
import { GlController } from "./control/gl-controller";

export function hookupCanvas(div: HTMLDivElement, props?: Props, controller?: Controller & GlController) {
  ReactHook.hookup(div, GLCanvas, { ...props, controller }, controller);
}

export const GLCanvas = GLCanvasExport;

