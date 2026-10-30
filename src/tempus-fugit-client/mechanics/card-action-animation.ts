import type { Enemy } from "../objects/game-objects/enemy";
import type { Player } from "../objects/game-objects/player";
import type { Card } from "../objects/game-objects/card";

export type CardActionTarget = Enemy | Player | null;

export interface CardActionAnimator {
    has(key: string): boolean;
    play(card: Card, targets: readonly CardActionTarget[], impact: () => void, complete: () => void): void;
}
