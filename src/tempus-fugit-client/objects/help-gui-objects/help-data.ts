// GUI Colors
const GUI_BORDER = 0x5d4037;
const GUI_BORDER_HIGHLIGHT = 0xd7ccc8;
const GUI_TAB = 0xfafafa;
const GUI_TAB_SELECTED = 0xbcaaa4;
const GUI_FILL_LIGHT = 0xfafafa;
const GUI_FILL = 0xa96851;
const GUI_FILL_DARK = 0x5c4d4d;
const GUI_SLIDER = 0x915b4a;
const GUI_LABEL_BG = 0xeceff1;
const GUI_TEXT_AREA = 0xf2f1e7;
const GUI_TEXT_AREA_BORDER = 0xcfd8dc;
const GUI_CLOSE = 0xdd6666;

export const op_and = {
    new: true,
    frame: 0,
    panel: [
        {
            type: 'label',
            text: 'Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: 'l&n'
        },
        {
            type: 'text-area',
            text: 'testing this out with two tabs'
        },
        {
            type: 'table',
            table: [
                [0, 1, 0, 0, 0, 0],
                [0, 1, 0, 0, 0, 0],
                [0, 0, 1, 1, 0, 0],
                [0, 1, 0, 0, 0, 0],
            ]
        }]
};
export const op_or = {
    new: true,
    frame: 0,
    panel: [
        {
            type: 'label',
            text: 'Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: 'l&n'
        },
        {
            type: 'text-area',
            text: 'testing this out with two tabs'
        },
        {
            type: 'table',
            table: [
                [0, 1, 0, 0, 0, 0],
                [0, 1, 0, 0, 0, 0],
                [0, 0, 1, 1, 0, 0],
                [0, 1, 0, 0, 0, 0],
            ]
        }]

};
export const op_impl = {
    new: true,
    frame: 0,
    panel: [
        {
            type: 'label',
            text: 'Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: 'l&n'
        },
        {
            type: 'text-area',
            text: 'testing this out with two tabs'
        },
        {
            type: 'table',
            table: [
                [0, 1, 0, 0, 0, 0],
                [0, 1, 0, 0, 0, 0],
                [0, 0, 1, 1, 0, 0],
                [0, 1, 0, 0, 0, 0],
            ]
        }]

};
export const op_biImpl = {

};
export const op_not = {

};
export const op_evPast = {

};
export const op_evFuture = {

};
export const op_glPast = {

};
export const op_glFuture = {

};
export const op_nextPast = {

};
export const op_nextFuture = {

};
export const op_rel = {

};
export const op_until = {

};
