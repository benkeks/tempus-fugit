import { Card } from "../objects/game-objects/card";
import { Deck } from "../objects/game-objects/deck";
import { Player } from "../objects/game-objects/player";

interface ProgressDataV1 {
    version: number;
    missionStates: boolean[];
    unlockedCardKeys: string[];
    customDeckCardKeys: string[];
    playerMaxHP: number;
    playerBaseAttack: number;
    newCardNames: string[];
    tutorialShown: boolean;
    deckBuilderTutorialShown: boolean;
    lastPlayedLevelIndex: number;
    musicMuted: boolean;
}

export class ProgressStore {
    private static readonly STORAGE_KEY = "tempus-fugit.progress.v1";

    public static getMusicMuted(missionCount: number = 9): boolean {
        let loaded = this.load(missionCount);
        if (!loaded) return false;
        return loaded.musicMuted;
    }

    public static setMusicMuted(muted: boolean, missionCount: number = 9): void {
        if (typeof window === "undefined" || !window.localStorage) return;

        let existing = this.load(missionCount);
        let progress: ProgressDataV1 = existing ? { ...existing } : this.defaultData(missionCount);
        progress.musicMuted = muted;

        try {
            window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
        } catch (e) {
            return;
        }
    }

    public static getLastPlayedLevelIndex(missionCount: number): number | undefined {
        let loaded = this.load(missionCount);
        if (!loaded) return undefined;
        if (typeof loaded.lastPlayedLevelIndex !== "number") return undefined;

        return loaded.lastPlayedLevelIndex;
    }

    public static getTutorialFlags(missionCount: number): { tutorialShown: boolean, deckBuilderTutorialShown: boolean } {
        let loaded = this.load(missionCount);
        if (!loaded) {
            return {
                tutorialShown: false,
                deckBuilderTutorialShown: false
            };
        }

        return {
            tutorialShown: loaded.tutorialShown,
            deckBuilderTutorialShown: loaded.deckBuilderTutorialShown
        };
    }

    public static clear(): void {
        if (typeof window === "undefined" || !window.localStorage) return;

        try {
            window.localStorage.removeItem(this.STORAGE_KEY);
        } catch (e) {
            return;
        }
    }

    private static defaultData(missionCount: number): ProgressDataV1 {
        return {
            version: 1,
            missionStates: Array(missionCount).fill(false),
            unlockedCardKeys: [],
            customDeckCardKeys: [],
            playerMaxHP: 125,
            playerBaseAttack: 2,
            newCardNames: [],
            tutorialShown: false,
            deckBuilderTutorialShown: false,
            lastPlayedLevelIndex: -1,
            musicMuted: false
        };
    }

    public static load(missionCount: number): ProgressDataV1 | undefined {
        if (typeof window === "undefined" || !window.localStorage) return undefined;

        try {
            let raw = window.localStorage.getItem(this.STORAGE_KEY);
            if (!raw) return undefined;

            let parsed = JSON.parse(raw);
            if (!parsed || parsed.version !== 1) return undefined;

            let defaults = this.defaultData(missionCount);
            return {
                version: 1,
                missionStates: Array.isArray(parsed.missionStates) ? parsed.missionStates.slice(0, missionCount) : defaults.missionStates,
                unlockedCardKeys: Array.isArray(parsed.unlockedCardKeys) ? parsed.unlockedCardKeys : defaults.unlockedCardKeys,
                customDeckCardKeys: Array.isArray(parsed.customDeckCardKeys) ? parsed.customDeckCardKeys : defaults.customDeckCardKeys,
                playerMaxHP: typeof parsed.playerMaxHP === "number" ? parsed.playerMaxHP : defaults.playerMaxHP,
                playerBaseAttack: typeof parsed.playerBaseAttack === "number" ? parsed.playerBaseAttack : defaults.playerBaseAttack,
                newCardNames: Array.isArray(parsed.newCardNames) ? parsed.newCardNames : defaults.newCardNames,
                tutorialShown: typeof parsed.tutorialShown === "boolean" ? parsed.tutorialShown : defaults.tutorialShown,
                deckBuilderTutorialShown: typeof parsed.deckBuilderTutorialShown === "boolean" ? parsed.deckBuilderTutorialShown : defaults.deckBuilderTutorialShown,
                lastPlayedLevelIndex: typeof parsed.lastPlayedLevelIndex === "number" ? parsed.lastPlayedLevelIndex : defaults.lastPlayedLevelIndex,
                musicMuted: typeof parsed.musicMuted === "boolean" ? parsed.musicMuted : defaults.musicMuted
            };
        } catch (e) {
            return undefined;
        }
    }

    public static save(player: Player, customDeck: Deck, newCardNames: Set<string>, missionCount: number,
                       options?: { tutorialShown?: boolean, deckBuilderTutorialShown?: boolean, lastPlayedLevelIndex?: number, musicMuted?: boolean }): void {
        if (typeof window === "undefined" || !window.localStorage) return;

        let existing = this.load(missionCount);

        let unlockedCardKeys = Object.keys(player.cardTypes)
            .map(cardName => player.cardTypes[cardName])
            .filter(card => card !== undefined)
            .map(card => card.key || card.name);

        let customDeckCardKeys = Object.keys(customDeck.deck)
            .map(cardName => customDeck.deck[cardName])
            .filter(card => card !== undefined)
            .map(card => card.key || card.name);

        let progress: ProgressDataV1 = {
            version: 1,
            missionStates: [...player.missionStates].slice(0, missionCount),
            unlockedCardKeys: [...new Set(unlockedCardKeys)],
            customDeckCardKeys: [...new Set(customDeckCardKeys)],
            playerMaxHP: player.maxHP,
            playerBaseAttack: player.baseAttack,
            newCardNames: [...newCardNames],
            tutorialShown: options && options.tutorialShown !== undefined
                ? options.tutorialShown
                : (existing ? existing.tutorialShown : false),
            deckBuilderTutorialShown: options && options.deckBuilderTutorialShown !== undefined
                ? options.deckBuilderTutorialShown
                : (existing ? existing.deckBuilderTutorialShown : false),
            lastPlayedLevelIndex: options && options.lastPlayedLevelIndex !== undefined
                ? options.lastPlayedLevelIndex
                : (existing ? existing.lastPlayedLevelIndex : -1),
            musicMuted: options && options.musicMuted !== undefined
                ? options.musicMuted
                : (existing ? existing.musicMuted : false)
        };

        try {
            window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
        } catch (e) {
            return;
        }
    }

    public static applyToPlayerAndDeck(player: Player, customDeck: Deck, missionCount: number): Set<string> {
        let loaded = this.load(missionCount);
        if (!loaded) return new Set<string>();

        player.missionStates = loaded.missionStates;
        while (player.missionStates.length < missionCount) {
            player.missionStates.push(false);
        }

        player.maxHP = loaded.playerMaxHP;
        player.baseAttack = loaded.playerBaseAttack;
        player.currentHP = player.maxHP;

        player.cardTypes = {};
        loaded.unlockedCardKeys.forEach(key => {
            if (Card.cards[key]) {
                let card = Card.cards[key].copy();
                player.cardTypes[card.name] = card;
            }
        });

        customDeck.deck = {};
        loaded.customDeckCardKeys.forEach(key => {
            if (Card.cards[key]) {
                let card = Card.cards[key].copy();
                customDeck.deck[card.name] = card;
            }
        });

        return new Set<string>(loaded.newCardNames);
    }
}
