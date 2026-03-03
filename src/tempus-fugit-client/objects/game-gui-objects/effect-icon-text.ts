type IconReplacement = {
    patterns: (string | RegExp)[];
    texture: string;
    fallback: string;
};

function escapeRegexPattern(pattern: string): string {
    return pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function ensureFrameTexture(
    scene: Phaser.Scene,
    spriteSheetKey: string,
    frameIndex: number,
    targetKey: string,
    targetWidth?: number,
    targetHeight?: number
): void {
    if (scene.textures.exists(targetKey) || !scene.textures.exists(spriteSheetKey)) return;

    const sourceTexture: any = scene.textures.get(spriteSheetKey);
    const frame: any = sourceTexture.get(frameIndex.toString());
    if (!frame || !frame.source || !frame.source.image) return;

    const drawWidth = targetWidth ?? frame.cutWidth;
    const drawHeight = targetHeight ?? frame.cutHeight;
    const canvasTexture = scene.textures.createCanvas(targetKey, drawWidth, drawHeight);
    const context = canvasTexture.getContext();

    context.clearRect(0, 0, drawWidth, drawHeight);
    const scale = Math.min(drawWidth / frame.cutWidth, drawHeight / frame.cutHeight);
    const fittedWidth = Math.round(frame.cutWidth * scale);
    const fittedHeight = Math.round(frame.cutHeight * scale);
    const offsetX = Math.floor((drawWidth - fittedWidth) / 2);
    const offsetY = Math.floor((drawHeight - fittedHeight) / 2);
    context.drawImage(
        frame.source.image,
        frame.cutX,
        frame.cutY,
        frame.cutWidth,
        frame.cutHeight,
        offsetX,
        offsetY,
        fittedWidth,
        fittedHeight
    );
    canvasTexture.refresh();
}

function ensureImageTexture(
    scene: Phaser.Scene,
    sourceKey: string,
    targetKey: string,
    targetWidth: number,
    targetHeight: number
): void {
    if (scene.textures.exists(targetKey) || !scene.textures.exists(sourceKey)) return;

    const sourceTexture: any = scene.textures.get(sourceKey);
    const sourceImage: any = sourceTexture.getSourceImage();
    if (!sourceImage) return;

    const canvasTexture = scene.textures.createCanvas(targetKey, targetWidth, targetHeight);
    const context = canvasTexture.getContext();
    context.clearRect(0, 0, targetWidth, targetHeight);
    const srcWidth = sourceImage.width;
    const srcHeight = sourceImage.height;
    const scale = Math.min(targetWidth / srcWidth, targetHeight / srcHeight);
    const fittedWidth = Math.round(srcWidth * scale);
    const fittedHeight = Math.round(srcHeight * scale);
    const offsetX = Math.floor((targetWidth - fittedWidth) / 2);
    const offsetY = Math.floor((targetHeight - fittedHeight) / 2);
    context.drawImage(sourceImage, offsetX, offsetY, fittedWidth, fittedHeight);
    canvasTexture.refresh();
}

export function ensureInlineEffectTextures(scene: Phaser.Scene): void {
    ensureImageTexture(scene, "swordFont", "inline_atk", 20, 22);
    ensureImageTexture(scene, "heartFont", "inline_hp", 18, 18);
    ensureImageTexture(scene, "energyFont", "inline_energy", 18, 18);
    ensureFrameTexture(scene, "runes", 0, "rune_nature", 18, 20);
    ensureFrameTexture(scene, "runes", 1, "rune_strength", 18, 20);
    ensureFrameTexture(scene, "runes", 2, "rune_light", 18, 20);
    ensureFrameTexture(scene, "runes", 3, "rune_transform", 18, 20);
}

export function formatEffectDescription(
    scene: Phaser.Scene,
    description: string,
    useBBCode: boolean
): string {
    ensureInlineEffectTextures(scene);

    const replacements: IconReplacement[] = [
        { patterns: ["{atk}", "⚔"], texture: "inline_atk", fallback: "⚔" },
        { patterns: ["{hp}", "❤", "♥"], texture: "inline_hp", fallback: "❤" },
        { patterns: ["{energy}", "✦"], texture: "inline_energy", fallback: "✦" },
        { patterns: ["{light}", "{l}"], texture: "rune_light", fallback: "light" },
        { patterns: ["{transform}", "{t}"], texture: "rune_transform", fallback: "transform" },
        { patterns: ["{nature}", "{n}"], texture: "rune_nature", fallback: "nature" },
        { patterns: ["{strength}", "{s}"], texture: "rune_strength", fallback: "strength" }
    ];

    let text = description;
    for (const replacement of replacements) {
        const replacementValue = useBBCode && scene.textures.exists(replacement.texture)
            ? `[img=${replacement.texture}]`
            : replacement.fallback;

        for (const pattern of replacement.patterns) {
            if (typeof pattern === "string") {
                text = text.replace(new RegExp(escapeRegexPattern(pattern), "g"), replacementValue);
            } else {
                text = text.replace(pattern, replacementValue);
            }
        }
    }

    return text;
}
