import React, { useEffect, useState } from "react";
import { ReactElement } from "react";
import { Controller } from "./controller";

export interface Props {
    controller: Controller | undefined;
    children?: ReactElement | ReactElement[] | string;
}

export default function Control({ controller, children }: Props) {
    const [active, setActive] = useState(true);
    useEffect(() => {
        if (controller) {
            controller.setActive = setActive;
        }
    }, [controller]);
    return <div>{active && children}</div>;
}