import React from "react";
import ReactDOMClient from "react-dom";
import Control from "./control/control";
import { Controller } from "./control/controller";

export default class ReactHook {
    static hookup<Props>(hud: HTMLDivElement, Node: () => JSX.Element, props?: Props, controller?: Controller): void {
        ReactDOMClient.render(<Control controller={controller}><Node {...props} /></Control>, hud);
    }
}

