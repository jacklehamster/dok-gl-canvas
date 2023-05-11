import { BufferAttributeAction } from "./BufferAttributeAction";
import { ClearAction } from "./use-clear-action";
import { DrawVertexAction } from "./draw-vertex-action";
import { UniformTimerAction } from "./UniformAction";
import { ActiveProgramAction } from "../gl/program/use-program";
import { CustomAction } from "./custom/use-custom-action";
import { BindVertexAction } from "./BindVertexAction";
import { ExecuteScriptAction } from "./ExecuteScriptAction";

export type GlAction = string | BufferAttributeAction
                        | BindVertexAction
                        | ClearAction
                        | DrawVertexAction
                        | UniformTimerAction
                        | ActiveProgramAction
                        | CustomAction
                        | ExecuteScriptAction;
