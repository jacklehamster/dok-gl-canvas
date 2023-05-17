import { LocationName } from "./BufferAttributeAction";

export interface UniformAction {
    action: "uniform",
    location: LocationName;
    int?: number;
    float?: number;
}

export interface UniformTimerAction {
    action: "uniform-timer",
    location: LocationName;
}
