export type ProgramId = string;

export interface ProgramConfig {
    readonly id: ProgramId;
    readonly vertex: string;
    readonly fragment: string;
}