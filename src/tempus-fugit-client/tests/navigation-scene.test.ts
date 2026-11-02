import { afterAll, describe, expect, it, vi } from "vitest";
import { NavigationScene } from "../scenes/navigation-scene";

vi.hoisted(() => {
    class GameObject {}
    vi.stubGlobal("Phaser", {
        Scene: class {},
        GameObjects: {Container: GameObject, Sprite: GameObject, Group: GameObject},
        Geom: {Rectangle: class {}},
        Textures: {FilterMode: {NEAREST: 0}},
    });

    describe("Overview mage pixel density", () => {
        function createTextureScene() {
            const scene: NavigationScene = Object.create(NavigationScene.prototype);
            const image = {};
            const frame = Object.freeze({cutX: 0, cutY: 0, cutWidth: 32, cutHeight: 64, source: {image}});
            const context = {imageSmoothingEnabled: true, drawImage: vi.fn()};
            const texture = {
                width: 16, height: 32, getContext: () => context,
                refresh: vi.fn(), setFilter: vi.fn(),
            };
            let cached = false;
            const createCanvas = vi.fn((): typeof texture | null => {cached = true; return texture;});
            const getFrame = vi.fn((): typeof frame | undefined => frame);
            const sprite = {setDisplaySize: vi.fn().mockReturnThis(), setDepth: vi.fn().mockReturnThis()};
            const addSprite = vi.fn(() => sprite);
            Object.assign(scene, {
                textures: {getFrame, exists: () => cached, createCanvas},
                add: {sprite: addSprite},
            });
            return {scene, frame, image, context, texture, createCanvas, getFrame, sprite, addSprite};
        }

        it("downsamples to half resolution without smoothing and uses nearest-neighbor rendering", () => {
            const {scene, image, context, texture, createCanvas} = createTextureScene();
            scene["createOverviewMage"](52, 141);
            expect(createCanvas).toHaveBeenCalledExactlyOnceWith("player_overview", 16, 32);
            expect(context.imageSmoothingEnabled).toBe(false);
            expect(context.drawImage).toHaveBeenCalledExactlyOnceWith(image, 0, 0, 32, 64, 0, 0, 16, 32);
            expect(texture.refresh).toHaveBeenCalledOnce();
            expect(texture.setFilter).toHaveBeenCalledExactlyOnceWith(Phaser.Textures.FilterMode.NEAREST);
        });

        it("keeps the same display size and uses a separate texture from the battle mage", () => {
            const {scene, frame, sprite, addSprite} = createTextureScene();
            expect(scene["createOverviewMage"](52, 141)).toBe(sprite);
            expect(addSprite).toHaveBeenCalledExactlyOnceWith(52, 141, "player_overview");
            expect(sprite.setDisplaySize).toHaveBeenCalledExactlyOnceWith(9.6, 19.2);
            expect(sprite.setDepth).toHaveBeenCalledExactlyOnceWith(4);
            expect(frame.cutWidth).toBe(32);
            expect(frame.cutHeight).toBe(64);
        });

        it("reuses the generated texture when the overview is reopened", () => {
            const {scene, context, createCanvas, addSprite} = createTextureScene();
            scene["createOverviewMage"](52, 141);
            scene["createOverviewMage"](83, 166);
            expect(createCanvas).toHaveBeenCalledOnce();
            expect(context.drawImage).toHaveBeenCalledOnce();
            expect(addSprite).toHaveBeenCalledTimes(2);
        });

        it("reports a missing player texture explicitly", () => {
            const {scene, getFrame} = createTextureScene();
            getFrame.mockReturnValue(undefined);
            expect(() => scene["createOverviewMage"](52, 141)).toThrow("Missing player texture for overview mage");
        });

        it("reports a failed canvas allocation explicitly", () => {
            const {scene, createCanvas} = createTextureScene();
            createCanvas.mockReturnValue(null);
            expect(() => scene["createOverviewMage"](52, 141)).toThrow("Could not create overview mage texture");
        });

        it("rejects raw GPU texture data before creating a cached canvas", () => {
            const {scene, frame, createCanvas} = createTextureScene();
            frame.source.image = new Uint8Array(16);
            expect(() => scene["createOverviewMage"](52, 141)).toThrow("Overview mage requires an image-based player texture");
            expect(createCanvas).not.toHaveBeenCalled();
        });
    });
});
vi.mock("../game", () => ({GameInfo: {}}));
vi.mock("../scenes/music-scene", () => ({MusicScene: {instance: {play: vi.fn()}}}));
vi.mock("../objects/tutorial-objects/tutorial-window", () => ({TutorialWindow: class {}}));
afterAll(() => vi.unstubAllGlobals());

function createMap(levelIndex = 0, flipped = false) {
    const scene: NavigationScene = Object.create(NavigationScene.prototype);
    scene.levelCoordinates = [[52, 151], [83, 176], [125, 167], [153, 170], [267, 138],
        [309, 140], [347, 142], [174, 71], [121, 75]];
    scene.currentMageLevelIndex = levelIndex;
    const position = scene.getMagePositionForLevel(levelIndex);
    const mage: Phaser.GameObjects.Sprite = Object.create(null);
    const setFlipX = vi.fn((flip: boolean) => {mage.flipX = flip; return mage;});
    Object.assign(mage, {...position, flipX: flipped, setFlipX});
    const movements: {x: number; y: number; duration: number; onComplete(): void}[] = [];
    const directions: boolean[] = [];
    const add = vi.fn((movement: typeof movements[number]) => {
        movements.push(movement);
        directions.push(mage.flipX);
    });
    Object.assign(scene, {mage, tweens: {add}});
    const advance = () => {
        const movement = movements.shift();
        if (!movement) throw new Error("Missing map movement tween");
        mage.x = movement.x;
        mage.y = movement.y;
        movement.onComplete();
    };
    return {scene, mage, setFlipX, movements, directions, add, advance};
}

describe("Overview mage movement direction", () => {
    it.each([
        [0, 1, false], [1, 0, true], [6, 7, true], [7, 6, false], [-1, 0, false], [0, -1, true],
    ])("faces the horizontal direction from level %i to %i", (from, to, flipped) => {
        const {scene, mage, setFlipX, movements, advance} = createMap(from, !flipped);
        const complete = vi.fn();
        scene.animateMageToLevel(to, complete);
        expect(mage.flipX).toBe(flipped);
        expect(setFlipX).toHaveBeenCalledExactlyOnceWith(flipped);
        expect(movements[0].duration).toBe(220);
        expect(complete).not.toHaveBeenCalled();
        advance();
        expect(complete).toHaveBeenCalledOnce();
        expect({x: mage.x, y: mage.y}).toEqual(scene.getMagePositionForLevel(to));
    });

    it.each([
        [0, 8, [false, false, false, false, false, false, true, true]],
        [7, 3, [false, true, true, true]],
    ])("updates direction at every waypoint from level %i to %i", (from, to, expected) => {
        const {scene, movements, directions, advance} = createMap(from);
        const complete = vi.fn();
        scene.animateMageToLevel(to, complete);
        while (movements.length > 0) advance();
        expect(directions).toEqual(expected);
        expect(complete).toHaveBeenCalledOnce();
    });

    it("keeps its facing for a purely vertical movement", () => {
        const {scene, mage, setFlipX, advance} = createMap(0, true);
        scene.levelCoordinates[1][0] = mage.x;
        scene.animateMageToLevel(1, vi.fn());
        expect(setFlipX).not.toHaveBeenCalled();
        advance();
        expect(mage.flipX).toBe(true);
    });

    it("preserves facing when the selected level is already current", () => {
        const {scene, mage, setFlipX, add} = createMap(0, true);
        const complete = vi.fn();
        scene.animateMageToLevel(0, complete);
        expect(complete).toHaveBeenCalledOnce();
        expect(add).not.toHaveBeenCalled();
        expect(setFlipX).not.toHaveBeenCalled();
        expect(mage.flipX).toBe(true);
    });
});
