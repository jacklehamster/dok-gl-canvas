import { BufferAttributeAction } from "./BufferAttributeAction";
import { ClearAction } from "./use-clear-action";
import { DrawVertexAction } from "./draw-vertex-action";
import { UniformTimerAction } from "./UniformAction";
import { ActiveProgramAction } from "../gl/program/use-program";
export declare type GlAction = BufferAttributeAction | ClearAction | DrawVertexAction | UniformTimerAction | ActiveProgramAction;
