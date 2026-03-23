import { Card } from "../game-objects/card";
import { FormulaGUI } from "./formula-gui";
import { formatEffectDescription } from "./effect-icon-text";

export type CardVisualBuildResult = {
    title: Phaser.GameObjects.Text;
    effectText: Phaser.GameObjects.GameObject;
    image: Phaser.GameObjects.Image;
};

function findTopLevelAndSplit(guiStr: string): number {
    let depth = 0;
    for (let i = 0; i < guiStr.length; i++) {
        if (guiStr[i] === '(') depth++;
        else if (guiStr[i] === ')') depth--;
        else if (guiStr[i] === '&' && depth === 0)
            return i;
    }
    return -1;
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

    const longFormula = card.getFormulaGuiString().length > 12;
    (longFormula ? [48, 100, 210] : [48, 78, 190]).forEach((y) => {
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
    const splitAfter = longFormula ? findTopLevelAndSplit(formulaString) : -1;
    let formulaGUI: FormulaGUI;
    if (formulaString.length > 8) {
        formulaGUI = new FormulaGUI(scene, formulaString, 0, 0, 0, false, true, splitAfter).setScale(0.8) as FormulaGUI;
        container.add(formulaGUI);
        const row1Len = splitAfter >= 0 ? splitAfter : formulaString.length;
        formulaGUI.setPosition(-6.4 * row1Len, padding + 46 - height / 2);
    } else {
        formulaGUI = new FormulaGUI(scene, formulaString, 0, 0, margin, false);
        container.add(formulaGUI);
        formulaGUI.setPosition(-8 * formulaString.length, padding + 46 - height / 2);
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
    effectText.setPosition(0, padding + (longFormula ? 210 : 190) - height / 2);

    let image = scene.add.image(0, 0, card.getImage());
    image.setDisplaySize(140, 115);
    container.add(image);
    image.setOrigin(0.5, 0);
    image.setPosition(0, (longFormula ? 97 : 75) - height / 2);

    let effectFontSize = 24;
    while (effectText.height > 100 && effectFontSize > 10) {
        effectFontSize -= 1;
        effectText.setFontSize(effectFontSize);
    }

    while (title.height > 75)
        title.setFontSize(Number(String(title.style.fontSize).substring(0, 2)) - 1);

    return { title, effectText, image };
}