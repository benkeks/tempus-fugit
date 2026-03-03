import { Card } from "../game-objects/card";
import { FormulaGUI } from "./formula-gui";

export type CardVisualBuildResult = {
    title: Phaser.GameObjects.Text;
    effectText: Phaser.GameObjects.GameObject;
    image: Phaser.GameObjects.Image;
};

type IconReplacement = {
    patterns: (string | RegExp)[];
    texture: string;
    fallback: string;
};

const EFFECT_ICON_REPLACEMENTS: IconReplacement[] = [
    { patterns: ["{atk}", "⚔"], texture: "inline_atk", fallback: "⚔" },
    { patterns: ["{hp}", "❤", "♥"], texture: "inline_hp", fallback: "❤" },
    { patterns: ["{energy}", "✦"], texture: "inline_energy", fallback: "✦" },
    { patterns: ["{light}", "{l}"], texture: "rune_light", fallback: "light" },
    { patterns: ["{transform}", "{t}"], texture: "rune_transform", fallback: "transform" },
    { patterns: ["{nature}", "{n}"], texture: "rune_nature", fallback: "nature" },
    { patterns: ["{strength}", "{s}"], texture: "rune_strength", fallback: "strength" }
];

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

function ensureInlineEffectTextures(scene: Phaser.Scene): void {
    ensureImageTexture(scene, "swordFont", "inline_atk", 20, 22);
    ensureImageTexture(scene, "heartFont", "inline_hp", 18, 18);
    ensureImageTexture(scene, "energyFont", "inline_energy", 18, 18);
}

function ensureRuneTextures(scene: Phaser.Scene): void {
    ensureFrameTexture(scene, "runes", 0, "rune_nature", 18, 20);
    ensureFrameTexture(scene, "runes", 1, "rune_strength", 18, 20);
    ensureFrameTexture(scene, "runes", 2, "rune_light", 18, 20);
    ensureFrameTexture(scene, "runes", 3, "rune_transform", 18, 20);
}

function formatEffectDescription(scene: Phaser.Scene, description: string, useBBCode: boolean): string {
    ensureInlineEffectTextures(scene);
    ensureRuneTextures(scene);
    let text = description;

    for (const replacement of EFFECT_ICON_REPLACEMENTS) {
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

export function buildCardVisual(
    container: Phaser.GameObjects.Container,
    card: Card,
    width: number,
    height: number
): CardVisualBuildResult {
    const scene = container.scene;
    const rectBackgroundColor = 0x999999;
    const rectOutlineColor = 0xe5e5e5;
    const fontStyle: Object = { fontSize: '24px', fontFamily: 'pressStart', color: '#000000' };
    container.setSize(width, height);

    let graphics = scene.add.graphics();
    graphics.lineStyle(8, rectOutlineColor, 1);
    let outline = graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    container.add(outline);
    container.sendToBack(outline);

    graphics.fillStyle(rectBackgroundColor, 1);
    let roundRect = graphics.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    container.add(roundRect);
    container.sendToBack(roundRect);

    [50, 80, 200].forEach((y) => {
        const line = scene.add.line(0, 0, 0, y - height / 2, width, y - height / 2, rectOutlineColor, 1);
        line.setLineWidth(2);
        container.add(line);
        line.setOrigin(0, 0);
        line.setPosition(-(width / 2), 0);
    });

    let padding = 5;
    let maxTextWidth = width;

    let title = scene.add.text(0, 0, card.getName(), fontStyle);
    title.setLineSpacing(5);
    title.setScale(0.6);
    container.add(title);
    title.style.setWordWrapWidth(maxTextWidth + 100, true);
    title.setOrigin(0.5, 0);
    title.setPosition(0, padding - height / 2);

    let margin = 2;
    let formulaString = card.getFormulaGuiString();
    let formulaGUI;
    if (formulaString.length > 8) {
        formulaGUI = new FormulaGUI(scene, formulaString, 0, 0, 0, false).setScale(0.8);
        container.add(formulaGUI);
        formulaGUI.setPosition(-6 * formulaString.length, padding + 48 - height / 2);
    } else {
        formulaGUI = new FormulaGUI(scene, formulaString, 0, 0, margin, false);
        container.add(formulaGUI);
        formulaGUI.setPosition(-8 * formulaString.length, padding + 48 - height / 2);
    }

    const hasBBCode = Boolean((scene as any).rexUI && (scene as any).rexUI.add && (scene as any).rexUI.add.BBCodeText);
    const effectDescription = formatEffectDescription(scene, card.getDescription(), hasBBCode);
    let effectText: any;

    if (hasBBCode) {
        // @ts-ignore
        effectText = scene.rexUI.add.BBCodeText(0, 0, effectDescription, {
            fontFamily: 'pressStart',
            fontSize: '24px',
            color: '#000000',
            wrap: {
                mode: 'word',
                width: maxTextWidth + 100
            }
        });
    } else {
        effectText = scene.add.text(0, 0, effectDescription, fontStyle);
        effectText.style.setWordWrapWidth(maxTextWidth + 100, true);
    }

    container.add(effectText);
    effectText.setScale(0.6);
    if (typeof effectText.setLineSpacing === 'function') effectText.setLineSpacing(5);
    else effectText.lineSpacing = 5;
    effectText.setOrigin(0.5, 0);
    effectText.setPosition(0, padding + 200 - height / 2);

    let image = scene.add.image(0, 0, card.getImage());
    image.setDisplaySize(140, 120);
    container.add(image);
    image.setOrigin(0.5, 0);
    image.setPosition(0, 80 - height / 2);

    let effectFontSize = 24;
    while (effectText.height > 90 && effectFontSize > 10) {
        effectFontSize -= 1;
        effectText.setFontSize(effectFontSize);
    }

    while (title.height > 75)
        title.setFontSize(Number(String(title.style.fontSize).substring(0, 2)) - 1);

    return { title, effectText, image };
}