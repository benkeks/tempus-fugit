
import { Card } from "../game-objects/card";
import { StandListener } from "../../mechanics/mission";
import { StandDescriptionGUI } from "./stand-description-gui";
import { MissionScene } from "../../scenes/mission-scene";
import { GameStateListener, GameState } from "../game-objects/game-state";


/**
 * @author Florian
 */
export class StandGUILayout extends Phaser.GameObjects.Container implements StandListener, GameStateListener {

    private readonly elementList: Array<Phaser.GameObjects.Sprite | null>;
    private readonly hoverElementList: Array<StandDescriptionGUI | null>;
    private readonly roundList: Array<Phaser.GameObjects.Text | null>;
    public scene: MissionScene;
    private stands: [Card | null, Card | null];
    private spritedStands: [Card | null, Card | null];
    private previewOverlays: Array<Phaser.GameObjects.Rectangle | null>;
    private previewTweens: Array<Phaser.Tweens.Tween | null>;

    constructor(
        scene: MissionScene,
        x = 500,
        y = 600

    ) {
        super(scene, x, y);
        this.scene = scene;
        this.stands = [null, null];
        this.elementList = [null, null];
        this.hoverElementList = [null, null];
        this.roundList = [null, null];
        this.spritedStands = [null, null];
        this.previewOverlays = [null, null];
        this.previewTweens = [null, null];

        this.scene.add.existing(this);
    }

    private destroySlot(index: number): void {
        this.elementList[index]?.destroy();
        this.hoverElementList[index]?.destroy();
        this.roundList[index]?.destroy();

        this.elementList[index] = null;
        this.hoverElementList[index] = null;
        this.roundList[index] = null;
        this.spritedStands[index] = null;
    }

    private createSlot(index: number, stand: Card): void {
        const font = { fontSize: '40px', fontFamily: 'pressStart', color: '#FFFFFF' };
        const x = 200 * index;
        const standImage = this.scene.add.sprite(x, 0, stand.getImage(), 0).setScale(4, 4);
        const desc = new StandDescriptionGUI(this.scene, x, 0, stand);
        desc.depth = 1000;
        desc.setScale(2);
        desc.setVisible(false);
        this.scene.add.existing(desc);

        standImage.setInteractive();
        standImage.on("pointerover", () => {
            desc.fadeInAnimation();
        }, this);

        desc.setInteractive().on("pointerout", () => {
            desc.fadeOutAnimation();
        }, this);

        this.scene.tweens.add({
            targets: standImage,
            duration: 400,
            y: standImage.y - 5,
            ease: "Linear",
            yoyo: true,
            repeat: -1,
            delay: 0,
            loopDelay: 0,
        });

        const text = this.scene.add.text(x, 70, stand.getRoundsRemaining().toString(), font);

        this.elementList[index] = standImage;
        this.hoverElementList[index] = desc;
        this.roundList[index] = text;

        this.add(standImage);
        this.add(text);
        this.add(desc);
    }

    updateStandGUI(stands: [Card | null, Card | null]) {
        this.stands = stands;

        for (let i of [0, 1]) {
            let stand = this.stands[i];
            if (stand == null) {
                this.destroySlot(i);
                this.clearPreviewSlot(i);
                continue;
            }

            if (this.elementList[i] == null) {
                this.createSlot(i, stand);
                this.spritedStands[i] = stand;
            } else if (this.spritedStands[i] !== stand) {
                this.destroySlot(i);
                this.createSlot(i, stand);
                this.spritedStands[i] = stand;
                this.flashSlot(i);
            } else {
                this.roundList[i]?.setText(stand.getRoundsRemaining().toString());
            }
        }

        this.clearPreview();

        this.updateTint(this.scene.tfgame.gameState);
    }

    private flashSlot(index: number): void {
        const sprite = this.elementList[index];
        if (!sprite) return;
        sprite.setTint(0xFFFFAA);
        this.scene.tweens.add({
            targets: sprite,
            scale: { from: 5.5, to: 4 },
            duration: 600,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                if (sprite.active) sprite.clearTint();
            }
        });
    }

    public previewReplacement(index: number): void {
        for (let i of [0, 1]) if (i !== index) this.clearPreviewSlot(i);
        if (this.previewOverlays[index] != null) return;

        const sprite = this.elementList[index];
        if (!sprite) return;

        const x = 200 * index;
        const w = sprite.displayWidth + 16;
        const h = sprite.displayHeight + 16;
        const overlay = this.scene.add.rectangle(x, 0, w, h, 0xff3333, 0.18);
        overlay.setStrokeStyle(4, 0xff3333, 1);

        this.previewOverlays[index] = overlay;
        this.add(overlay);

        this.previewTweens[index] = this.scene.tweens.add({
            targets: overlay,
            alpha: { from: 1, to: 0.35 },
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    public clearPreview(): void {
        for (let i of [0, 1]) this.clearPreviewSlot(i);
    }

    private clearPreviewSlot(index: number): void {
        this.previewTweens[index]?.stop();
        this.previewTweens[index] = null;
        this.previewOverlays[index]?.destroy();
        this.previewOverlays[index] = null;
    }



    Attacking(stand: Card, index: number) {
        for (let i of [0, 1]) {
            if (this.stands[i] === stand) {
                if (this.elementList[i]) {
                    this.scene.createAttackAnimation(this.scene, this.elementList[i], "+");
                }
                break;
            }
        }
    }

    public updateTint(gameState: GameState) {
        for (let i of [0, 1]) {
            if (this.stands[i] == null || this.elementList[i] == null) continue;

            if (!gameState.evaluate(this.stands[i])) {
                this.elementList[i]?.setTint(0x333333);
            } else {
                this.elementList[i]?.clearTint();
            }
        }
    }

    roundChanged(gameState: import("../game-objects/game-state").GameState, lastRound: number, activeRound: number) {
        this.updateTint(gameState);
    }
    async variableChanged(gameState: import("../game-objects/game-state").GameState, oldVariable: import("../../temporal-logic/variable").Variable, variable: import("../../temporal-logic/variable").Variable, valueChanges: { [state: number]: boolean; }) {
        this.updateTint(gameState);
    }
    energyChanged(gameState: import("../game-objects/game-state").GameState, oldEnergy: number, newEnergy: number, oldMaxEnergy: number, newMaxEnergy: number): void {
    }
    activated(gameState: import("../game-objects/game-state").GameState) {
    }

}