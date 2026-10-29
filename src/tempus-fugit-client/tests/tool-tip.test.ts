import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToolTip } from "../objects/game-gui-objects/tool-tip";

const {fadeIn, fadeOut} = vi.hoisted(() => ({fadeIn: vi.fn(), fadeOut: vi.fn()}));

vi.mock("../objects/game-gui-objects/list-gui", () => ({
    ListGUI: class {
        public scene: unknown;
        public visible = true;
        constructor(scene: unknown) { this.scene = scene; }
        disableInteractive() {}
        setDepth() {}
        setVisible(visible: boolean) { this.visible = visible; }
        fadeIn(duration: number, scale: boolean) { fadeIn(duration, scale); }
        fadeOut() { fadeOut(); }
        destroy() { this.scene = undefined; }
    },
}));

function createTooltip() {
    const handlers = new Map<string, () => void>();
    const callbacks: Array<() => void> = [];
    const timerRemovals = vi.fn();
    const scene = {
        add: {existing: vi.fn()},
        time: {
            delayedCall(delay: number, callback: () => void, args: [], scope: ToolTip) {
                const run = () => callback.apply(scope, args);
                callbacks.push(run);
                const timer = setTimeout(run, delay);
                const remove = () => { timerRemovals(); clearTimeout(timer); };
                return {remove, destroy: remove};
            },
        },
    };
    const target = {
        setInteractive() { return this; },
        on(event: string, callback: () => void, scope: ToolTip) {
            handlers.set(event, callback.bind(scope));
            return this;
        },
    };
    // The test double exposes only the Phaser methods used by ToolTip.
    const tooltip = new ToolTip(
        scene as unknown as Phaser.Scene,
        0, 0,
        target as unknown as Phaser.GameObjects.GameObject,
    );
    return {tooltip, handlers, callbacks, timerRemovals};
}

beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
});
afterEach(() => vi.useRealTimers());

describe("Tooltip lifecycle", () => {
    it("still shows a living tooltip after its hover delay", () => {
        const {handlers} = createTooltip();
        handlers.get("pointerover")();
        vi.advanceTimersByTime(199);
        expect(fadeIn).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(fadeIn).toHaveBeenCalledExactlyOnceWith(200, false);
    });

    it("cancels a pending popup and running fade when disabled on enemy death", () => {
        const {tooltip, handlers, timerRemovals} = createTooltip();
        const stop = vi.fn();
        tooltip.tween = {stop} as unknown as Phaser.Tweens.Tween;
        handlers.get("pointerover")();
        tooltip.enabled = false;
        vi.advanceTimersByTime(500);
        expect(timerRemovals).toHaveBeenCalledOnce();
        expect(stop).toHaveBeenCalledOnce();
        expect(tooltip.visible).toBe(false);
        expect(fadeIn).not.toHaveBeenCalled();
    });

    it("does not leave older hover timers behind after repeated pointer-over events", () => {
        const {tooltip, handlers} = createTooltip();
        handlers.get("pointerover")();
        vi.advanceTimersByTime(100);
        handlers.get("pointerover")();
        tooltip.destroy(true);
        vi.advanceTimersByTime(1000);
        expect(fadeIn).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
    });

    it("cancels the popup when its enemy disappears before the delay ends", () => {
        const {tooltip, handlers, timerRemovals} = createTooltip();
        handlers.get("pointerover")();
        vi.advanceTimersByTime(100);
        tooltip.destroy(true);
        vi.advanceTimersByTime(100);
        expect(timerRemovals).toHaveBeenCalledOnce();
        expect(fadeIn).not.toHaveBeenCalled();
    });

    it("ignores an already-queued popup callback after disable or destruction", () => {
        const {tooltip, handlers, callbacks} = createTooltip();
        handlers.get("pointerover")();
        tooltip.enabled = false;
        callbacks[0]();
        expect(fadeIn).not.toHaveBeenCalled();

        tooltip.destroy(true);
        tooltip.enabled = true;
        callbacks[0]();
        expect(fadeIn).not.toHaveBeenCalled();
    });

    it("does not schedule hover popups while disabled", () => {
        const {tooltip, handlers, callbacks} = createTooltip();
        tooltip.enabled = false;
        handlers.get("pointerover")();
        expect(callbacks).toHaveLength(0);
    });
});
