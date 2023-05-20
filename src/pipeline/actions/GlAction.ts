import { BindBufferAction, BufferDataAction, BufferSubDataAction, CreateBufferAction, EnableVertexAttribArray as EnableVertexAttribArrayAction, VertexAttribDivisor as VertexAttribDivisorAction, VertexAttribPointerAction } from "./BufferAttributeAction";
import { ClearAction } from "./use-clear-action";
import { DrawArraysAction, DrawArraysInstancedAction } from "./draw-vertex-action";
import { UniformAction, UniformTimerAction } from "./UniformAction";
import { CustomAction } from "./custom/use-custom-action";
import { BindVertexAction } from "./BindVertexAction";
import { ImageAction, TextureAction, VideoAction } from "./use-image-action";
import { ActiveProgramAction } from "./use-program-action";
import { ExecuteScriptAction } from "./ExecuteScriptAction";
import { PopContextAction, StoreContextAction } from "./use-store-action";

export type DokGlAction = 
| BindVertexAction
| BufferSubDataAction
| BufferDataAction
| BindVertexAction
| ClearAction
| DrawArraysAction
| DrawArraysInstancedAction
| UniformTimerAction
| UniformAction
| ActiveProgramAction
| CustomAction
| ExecuteScriptAction
| ImageAction
| TextureAction
| VideoAction
| CreateBufferAction
| BindBufferAction
| VertexAttribPointerAction
| VertexAttribDivisorAction
| EnableVertexAttribArrayAction
| StoreContextAction
| PopContextAction;

export type GlAction = string | DokGlAction;
