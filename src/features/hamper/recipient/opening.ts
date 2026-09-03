export type OpeningStage = 0 | 1 | 2 | 3;
/** Exactly one state transition per intentional, unlocked activation. */
export function nextOpeningStage(stage: OpeningStage, busy: boolean): OpeningStage { return busy || stage === 3 ? stage : (stage + 1) as OpeningStage; }
