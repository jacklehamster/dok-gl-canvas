import React from "react";
import { ReactElement } from "react";
import { Controller } from "./controller";
export interface Props {
    controller: Controller | undefined;
    children?: ReactElement | ReactElement[] | string;
}
export default function Control({ controller, children }: Props): React.JSX.Element;
