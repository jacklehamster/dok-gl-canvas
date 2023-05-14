import { BufferAttributeAction } from "./BufferAttributeAction";
import { ClearAction } from "./use-clear-action";
import { DrawVertexAction } from "./draw-vertex-action";
import { UniformAction, UniformTimerAction } from "./UniformAction";
import { CustomAction } from "./custom/use-custom-action";
import { BindVertexAction } from "./BindVertexAction";
import { ExecuteScriptAction } from "./ExecuteScriptAction";
import { ImageAction, TextureAction, VideoAction } from "./use-image-action";
import { ActiveProgramAction } from "./use-program-action";

export interface GlExecuteAction {
    execute?(action: GlAction, time: number): void;
}

export type GlAction = string | GlExecuteAction & (
                        BufferAttributeAction
                        | BindVertexAction
                        | ClearAction
                        | DrawVertexAction
                        | UniformTimerAction
                        | UniformAction
                        | ActiveProgramAction
                        | CustomAction
                        | ExecuteScriptAction
                        | ImageAction
                        | TextureAction
                        | VideoAction
                        );
