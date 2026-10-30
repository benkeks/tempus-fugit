import type { Enemy } from "../objects/game-objects/enemy";
import type { Player } from "../objects/game-objects/player";

export type CardActionTarget = Enemy | Player | null;

export interface CardActionAnimator {
    has(key: string): boolean;
    play(key: string, targets: readonly CardActionTarget[], impact: () => void, complete: () => void): void;
}
