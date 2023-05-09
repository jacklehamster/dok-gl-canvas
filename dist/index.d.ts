import GLCanvasExport, { Props } from "./GLCanvas";
import { Controller } from "./control/controller";
import { GlController } from "./control/gl-controller";
export * from "./pipeline/GlAction";
export declare function hookupCanvas(div: HTMLDivElement, props?: Props, controller?: Controller & GlController): void;
export declare const GLCanvas: typeof GLCanvasExport;
