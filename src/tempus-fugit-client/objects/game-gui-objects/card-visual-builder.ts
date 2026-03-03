import { Card } from "../game-objects/card";
import { FormulaGUI } from "./formula-gui";

export type CardVisualBuildResult = {
    title: Phaser.GameObjects.Text;
    effectText: Phaser.GameObjects.Text;
    image: Phaser.GameObjects.Image;
};

export function buildCardVisual(
    container: Phaser.GameObjects.Container,
    card: Card,
    width: number,
    height: number
): CardVisualBuildResult {
    const scene = container.scene;
    let rectBackgroundColor = 0x999999;
    let rectOutlineColor = 0xe5e5e5;
    let font1: Object = { fontSize: '24px', fontFamily: 'pressStart', color: '#000000' };
    let font2: Object = { fontSize: '24px', fontFamily: 'pressStart', color: '#000000' };
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

    let lineColor = rectOutlineColor;
    let formulaLine1 = scene.add.line(0, 0, 0, 50 - height / 2, width, 50 - height / 2, lineColor, 1);
    formulaLine1.setLineWidth(2);
    container.add(formulaLine1);
    formulaLine1.setOrigin(0, 0);
    formulaLine1.setPosition(-(width / 2), 0);

    let formulaLine2 = scene.add.line(0, 0, 0, 80 - height / 2, width, 80 - height / 2, lineColor, 1);
    formulaLine2.setLineWidth(2);
    container.add(formulaLine2);
    formulaLine2.setOrigin(0, 0);
    formulaLine2.setPosition(-(width / 2), 0);

    let formulaLine3 = scene.add.line(0, 0, 0, 200 - height / 2, width, 200 - height / 2, lineColor, 1);
    formulaLine3.setLineWidth(2);
    container.add(formulaLine3);
    formulaLine3.setOrigin(0, 0);
    formulaLine3.setPosition(-(width / 2), 0);

    let padding = 5;
    let maxTextWidth = width;

    let title = scene.add.text(0, 0, card.getName(), font1);
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

    let effectText = scene.add.text(0, 0, card.getDescription(), font2);
    container.add(effectText);
    effectText.setScale(0.6);
    effectText.setLineSpacing(5);
    effectText.style.setWordWrapWidth(maxTextWidth + 100, true);
    effectText.setOrigin(0.5, 0);
    effectText.setPosition(0, padding + 200 - height / 2);

    let image = scene.add.image(0, 0, card.getImage());
    image.setDisplaySize(140, 120);
    container.add(image);
    image.setOrigin(0.5, 0);
    image.setPosition(0, 80 - height / 2);

    while (effectText.height > 90)
        effectText.setFontSize(Number(String(effectText.style.fontSize).substring(0, 2)) - 1);

    while (title.height > 75)
        title.setFontSize(Number(String(title.style.fontSize).substring(0, 2)) - 1);

    return { title, effectText, image };
}