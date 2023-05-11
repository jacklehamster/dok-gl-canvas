import { BufferAttributeAction } from "./BufferAttributeAction";
import { ClearAction } from "./use-clear-action";
import { DrawVertexAction } from "./draw-vertex-action";
import { UniformTimerAction } from "./UniformAction";
import { ActiveProgramAction } from "../gl/program/use-program";
import { CustomAction } from "./custom/use-custom-action";
import { BindVertexAction } from "./BindVertexAction";
export declare type GlAction = BufferAttributeAction | BindVertexAction | ClearAction | DrawVertexAction | UniformTimerAction | ActiveProgramAction | CustomAction;
