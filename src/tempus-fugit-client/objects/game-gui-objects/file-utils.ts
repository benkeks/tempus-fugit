import BitmapFontData = Phaser.Types.GameObjects.BitmapText.BitmapFontData;

export class FontUtils {

    public static readonly ALIGN_TOP = 0;
    public static readonly ALIGN_CENTER = 1;
    public static readonly ALIGN_BOTTOM = 2;

    // -------------------------------------------------------------------------
    /**
     * Add sprite into bitmap font, position it and assign it character code.
     * Then you can print it along with other font characters.
     *
     * @param {Phaser.Game} game - Phaser game
     * @param {string} fontName - name of font (the same as used in cache as key)
     * @param {(string|number)} frame - new sprite character frame
     * @param {number} newCharCode - char code to assign to sprite character
     * @param {(number|string)} [referenceChar = "0"] - reference character to position sprite character against
     * @param {number} [align = FontUtils.ALIGN_CENTER] - align to top, center or bottom of reference character
     * @param {number} [originY = 0.5] - origin of sprite character on y axis
     */
    public static addSpriteIntoFont(game: Phaser.Game, fontName: string, frame: string | number, newCharCode: number,
                                    referenceChar: number | string = "0",
                                    align: number = FontUtils.ALIGN_CENTER, originY: number = 0.5): void {

        // if reference char is string, convert it to number
        if (typeof referenceChar === "string") {
            referenceChar = referenceChar.charCodeAt(0);
        }

        // get font characters and reference character
        let font = game.cache.bitmapFont.get(fontName);
        let fontChars = (font.data as BitmapFontData).chars;
        let refChar = fontChars[referenceChar];

        if (refChar == null) {
            throw new Error(`Reference character ${String.fromCharCode(referenceChar)} with code ${referenceChar} is mssing in font. Try another.`);
        }

        // get frame of new sprite character
        let f = game.textures.getFrame(font["texture"], frame);
        let fWidth = f.customData["sourceSize"]["w"];
        let fHeight = f.customData["sourceSize"]["h"];

        // calculate y offset of sprite chracter
        let refY = refChar.yOffset +
            (align === FontUtils.ALIGN_CENTER ? refChar.height / 2 :
                align === FontUtils.ALIGN_BOTTOM ? refChar.height : 0);
        let yOffset = Math.round(refY - fHeight * originY);

        // add new sprite character
        fontChars[newCharCode] = {
            x: f.cutX,
            y: f.cutY,
            width: f.cutWidth,
            height: f.cutHeight,
            centerX: Math.floor(fWidth / 2),
            centerY: Math.floor(fHeight / 2),
            xOffset: 0,
            yOffset: yOffset,
            //xAdvance: fWidth + 2,

            data: {},
            kerning: {}
        };
    }
}