import { BufferAttributeAction } from "./BufferAttributeAction";
import { ClearAction } from "./use-clear-action";
import { DrawArraysAction, DrawArraysInstancedAction } from "./draw-vertex-action";
import { UniformAction, UniformTimerAction } from "./UniformAction";
import { CustomAction } from "./custom/use-custom-action";
import { BindVertexAction } from "./BindVertexAction";
import { ExecuteScriptAction } from "./ExecuteScriptAction";
import { ImageAction, TextureAction, VideoAction } from "./use-image-action";
import { ActiveProgramAction } from "./use-program-action";
export interface GlExecuteAction {
    execute?(action: GlAction, time: number): void;
}
export declare type GlAction = string | GlExecuteAction & (BufferAttributeAction | BindVertexAction | ClearAction | DrawArraysAction | DrawArraysInstancedAction | UniformTimerAction | UniformAction | ActiveProgramAction | CustomAction | ExecuteScriptAction | ImageAction | TextureAction | VideoAction);
