import React from "react";
import * as ReactDOMClient from "react-dom/client";
import Control from "./control/control";
import { Controller } from "./control/controller";

export default class ReactHook {
    static hookup<Props>(hud: HTMLDivElement, Node: () => JSX.Element, props?: Props, controller?: Controller): void {
        const hudRoot = ReactDOMClient.createRoot(hud);
        hudRoot.render(<Control controller={controller}><Node {...props} /></Control>);
    }
}

