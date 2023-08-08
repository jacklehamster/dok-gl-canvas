/// <reference types="react" />
import { Controller } from "./control/controller";
export default class ReactHook {
    static hookup<Props>(hud: HTMLDivElement, Node: () => JSX.Element, props?: Props, controller?: Controller): void;
}
