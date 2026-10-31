import type { Enemy } from "../objects/game-objects/enemy";
import type { Player } from "../objects/game-objects/player";
import type { Card } from "../objects/game-objects/card";

export type CardActionSource = Enemy | Player;
export type CardActionTarget = CardActionSource | null;

// Omit the index to hit all remaining targets; sweeps can hit individual targets as they pass.
export type CardActionImpact = (targetIndex?: number) => void;

export interface CardActionAnimator {
    has(key: string): boolean;
    // Repeat the visuals, not the action's damage or other gameplay effects.
    play(
        card: Card, targets: readonly CardActionTarget[], impact: CardActionImpact, complete: () => void,
        source: CardActionSource, repeat?: boolean,
    ): void;
}
