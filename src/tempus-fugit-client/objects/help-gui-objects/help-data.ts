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
            type: 'text-area',
            text: 'The spell is composed of two runes or runic combinations. The sorcerer must evoke both simultaneously to cast the spell.'
        },
        {
            type: 'label',
            text: ' Basic Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: 'l&n&s&t'
        },
        {
            type: 'text-area',
            text: 'In this example, all runes must be active for the spell to be cast.'
        },
        {
            type: 'table',
            table: [
                [0, 10, 0, 11, 0, 0],
                [0, 10, 0, 11, 0, 0],
                [0, 0, 10, 11, 0, 0],
                [0, 10, 0, 11, 0, 0],
            ]
        },
        {
            type: 'label',
            text: 'Advanced Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: '(l|t)&(n|s)'
        },
        {
            type: 'text-area',
            text: 'In this case, both sub-formulas must be satisfied.'
        },
        {
            type: 'table',
            table: [
                [0, 10, 10, 1, 0, 0],
                [0, 0, 0, 11, 0, 0],
                [0, 0, 10, 11, 0, 0],
                [0, 10, 0, 1, 0, 0],
            ]
        },
    ]
};
export const op_or = {
    new: true,
    frame: 1,
    panel: [
        {
            type: 'text-area',
            text: 'Some spells can be performed in different ways while producing the same result. In this case, it is enough to evoke at least one of the runes or runic combinations.'
        },
        {
            type: 'label',
            text: ' Basic Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: 'l|t'
        },
        {
            type: 'text-area',
            text: 'This formula is easy to satisfy: Either rune can be active, or even both.'
        },
        {
            type: 'table',
            table: [
                [0, 0, 0, 11, 0, 0],
                [0, 0, 0, 1, 0, 0],
                [0, 0, 10, 1, 0, 0],
                [0, 0, 0, 1, 0, 0],
            ]
        },
        {
            type: 'label',
            text: 'Advanced Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: '(n-t)|(l=s)'
        },
        {
            type: 'text-area',
            text: 'Here we have two combinations, and either one can be valid, or both. The first is valid if nature {nature} is not evoked, or if both nature {nature} and transform {transform} are evoked. In the second, light {light} and strength {strength} must either both be evoked or both be inactive. Here, nature {nature} and transform {transform} are both evoked, so the formula is valid.'
        },
        {
            type: 'table',
            table: [
                [0, 10, 10, 1, 0, 0],
                [0, 0, 0, 11, 0, 0],
                [0, 0, 10, 11, 0, 0],
                [0, 10, 0, 1, 0, 0],
            ]
        },
    ]

};
export const op_impl = {
    new: true,
    frame: 2,
    panel: [
        {
            type: 'text-area',
            text: 'The two runic combinations are linked in such a way that if the first is not evoked, the spell may still be cast. If the first is evoked, however, the second must also be evoked.'
        },
        {
            type: 'label',
            text: ' Basic Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: 'l-s'
        },
        {
            type: 'text-area',
            text: 'In this case, the combination is always valid if light {light} is not active. Otherwise, the two runes must be evoked at the same time.'
        },
        {
            type: 'table',
            table: [
                [0, 10, 0, 11, 0, 0],
                [0, 0, 10, 1, 0, 0],
                [0, 0, 10, 1, 0, 0],
                [0, 0, 0, 11, 0, 0],
            ]
        },
        {
            type: 'label',
            text: 'Advanced Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: '(n&t)-(!s&!l)'
        },
        {
            type: 'text-area',
            text: 'This formula is valid if the first sub-formula is not satisfied, or if both sub-formulas are satisfied. So either nature {nature} and transform {transform} are not evoked, or they both are, which implies that light {light} and strength {strength} are not. Here, we have the former situation.'
        },
        {
            type: 'table',
            table: [
                [0, 10, 10, 11, 0, 0],
                [0, 0, 0, 1, 0, 0],
                [0, 0, 10, 1, 0, 0],
                [0, 10, 0, 1, 0, 0],
            ]
        },
    ]

};
export const op_biImpl = {
    new: true,
    frame: 3,
    panel: [
        {
            type: 'text-area',
            text: 'The two runic combinations are bound to each other. Either both must be evoked, or neither must be evoked, for the sorcerer to cast the spell.'
        },
        {
            type: 'label',
            text: ' Basic Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: '(l&n)=s'
        },
        {
            type: 'text-area',
            text: 'Both runic combinations must be in the same state: either both active or both inactive. As a result, both highlighted combinations are valid.'
        },
        {
            type: 'table',
            table: [
                [0, 0, 1, 11, 0, 0],
                [0, 10, 11, 1, 0, 0],
                [0, 0, 1, 11, 0, 0],
                [10, 0, 1, 11, 0, 0],
            ]
        },
        {
            type: 'label',
            text: 'Advanced Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: 'Ht=(n|s)'
        },
        {
            type: 'text-area',
            text: 'Here, if nature {nature} or strength {strength} is evoked, then transform {transform} must have been evoked the whole time for the spell to be cast.'
        },
        {
            type: 'table',
            table: [
                [0, 10, 10, 1, 0, 0],
                [10, 10, 10, 11, 0, 0],
                [0, 0, 10, 11, 0, 0],
                [0, 10, 0, 1, 0, 0],
            ]
        },
    ]
};
export const op_not = {
    new: true,
    frame: 4,
    panel: [
        {
            type: 'text-area',
            text: 'The runic combination must not be evoked.'
        },
        {
            type: 'label',
            text: ' Basic Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: '!t'
        },
        {
            type: 'text-area',
            text: 'The expression must not be evoked.'
        },
        {
            type: 'table',
            table: [
                [0, 0, 10, 11, 0, 0],
                [0, 0, 0, 1, 0, 0],
                [0, 10, 0, 11, 0, 0],
                [0, 0, 10, 11, 0, 0],
            ]
        },
        {
            type: 'label',
            text: 'Advanced Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: 'G(!(l=t))'
        },
        {
            type: 'text-area',
            text: 'This expression means that light {light} and transform {transform} cannot be equally active at the same time in the future.'
        },
        {
            type: 'table',
            table: [
                [0, 10, 10, 1, 10, 0],
                [0, 0, 0, 11, 0, 10],
                [0, 0, 10, 11, 0, 0],
                [0, 10, 0, 1, 0, 0],
            ]
        },
    ]
};
export const op_evPast = {
    new: true,
    frame: 5,
    panel: [
        {
            type: 'text-area',
            text: 'This spell reaches into the past, both near and far. If the runic combination was evoked at some point in the past, the sorcerer may cast this spell.'
        },
        {
            type: 'label',
            text: ' Basic Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: 'F(t&n)'
        },
        {
            type: 'text-area',
            text: 'The runic combination is already satisfied in the first time step, so it is valid in the present.'
        },
        {
            type: 'table',
            table: [
                [0, 0, 0, 0, 1, 0],
                [0, 10, 0, 0, 1, 0],
                [0, 10, 0, 10, 11, 0],
                [0, 0, 0, 10, 1, 0],
            ]
        },
        {
            type: 'label',
            text: 'Advanced Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: 'F((l&n)|(l&s))'
        },
        {
            type: 'text-area',
            text: 'This formula says that at some point in the past, light {light} must have been evoked together with nature {nature}, strength {strength}, or both. Here, both apply.'
        },
        {
            type: 'table',
            table: [
                [0, 10, 10, 1, 0, 0],
                [0, 0, 0, 1, 0, 0],
                [0, 0, 10, 1, 0, 0],
                [0, 10, 0, 1, 0, 0],
            ]
        },
    ]
};
export const op_evFuture = {
    new: true,
    frame: 6,
    panel: [
        {
            type: 'text-area',
            text: 'This spell transcends time and looks into the future, both near and far. The runic combination must be evoked at some point in the future for the sorcerer to cast this spell.'
        },
        {
            type: 'label',
            text: ' Basic Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: 'E(n-s)'
        },
        {
            type: 'text-area',
            text: 'At some point in the future, the combination must be satisfied, which can be achieved with other spells, so that this spell can be cast in the present.'
        },
        {
            type: 'table',
            table: [
                [0, 0, 0, 1, 0, 0],
                [0, 10, 0, 11, 0, 0],
                [0, 10, 10, 1, 10, 0],
                [0, 0, 10, 1, 10, 0],
            ]
        },
        {
            type: 'label',
            text: 'Advanced Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: 'E(l-Yn)'
        },
        {
            type: 'text-area',
            text: 'This says that at some point in the future, either light {light} is not evoked, or, if it is evoked, nature {nature} was evoked immediately before it. Here, either condition would be enough.'
        },
        {
            type: 'table',
            table: [
                [0, 10, 11, 10, 10, 0],
                [0, 0, 1, 10, 0, 0],
                [0, 0, 1, 10, 0, 0],
                [0, 10, 11, 1, 0, 0],
            ]
        },
    ]
};
export const op_glPast = {
    new: true,
    frame: 7,
    panel: [
        {
            type: 'text-area',
            text: 'This spell reaches far into the past. The runic combination must have remained active up to this point for the sorcerer to cast this spell.'
        },
        {
            type: 'label',
            text: ' Basic Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: 'Hl'
        },
        {
            type: 'text-area',
            text: ''
        },
        {
            type: 'table',
            table: [
                [10, 10, 10, 10, 11, 0],
                [0, 0, 0, 0, 1, 0],
                [0, 0, 10, 0, 1, 0],
                [0, 0, 0, 0, 11, 0],
            ]
        },
        {
            type: 'label',
            text: 'Advanced Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: 'H!(l&n&s)'
        },
        {
            type: 'text-area',
            text: 'This means that at no point in the past were all three runes evoked at the same time.'
        },
        {
            type: 'table',
            table: [
                [0, 0, 10, 1, 0, 0],
                [0, 0, 10, 11, 0, 0],
                [0, 10, 10, 1, 0, 0],
                [0, 10, 0, 1, 0, 0],
            ]
        },
    ]
};
export const op_glFuture = {
    new: true,
    frame: 8,
    panel: [
        {
            type: 'text-area',
            text: 'This spell requires a continuous stream of runic energy. The sorcerer must keep the necessary runes evoked from this point on to cast the spell.'
        },
        {
            type: 'label',
            text: ' Basic Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: 'G(!s|!t)'
        },
        {
            type: 'text-area',
            text: 'The formula must remain valid in all future time states. In this example, that means strength {strength} and transform {transform} cannot be active at the same time.'
        },
        {
            type: 'table',
            table: [
                [0, 10, 0, 1, 0, 0],
                [0, 0, 10, 1, 10, 0],
                [0, 0, 0, 11, 0, 0],
                [0, 0, 0, 1, 0, 10],
            ]
        },
        {
            type: 'label',
            text: 'Advanced Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: 'G((s&t)|(n&!l))'
        },
        {
            type: 'text-area',
            text: 'All future states must contain either strength {strength} together with transform {transform}, or nature {nature} without light {light}.'
        },
        {
            type: 'table',
            table: [
                [0, 11, 0, 10, 0, 0],
                [0, 1, 0, 10, 10, 0],
                [0, 1, 10, 10, 0, 10],
                [0, 11, 0, 10, 10, 0],
            ]
        },
    ]
};
export const op_nextPast = {
    new: true,
    frame: 9,
    panel: [
        {
            type: 'text-area',
            text: 'This spell reaches into the near past. If the runic combination was evoked in the previous step, the spell can be cast.'
        },
        {
            type: 'label',
            text: ' Basic Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: 'Y(l|n)'
        },
        {
            type: 'text-area',
            text: 'One time step in the past either light {light} or nature {nature} should be active for this combination to be valid in the present.'
        },
        {
            type: 'table',
            table: [
                [0, 10, 0, 0, 1, 0],
                [0, 0, 10, 10, 1, 0],
                [0, 0, 0, 10, 1, 0],
                [0, 0, 0, 0, 11, 0],
            ]
        },
        {
            type: 'label',
            text: 'Advanced Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: 'Y(l-(s&n))'
        },
        {
            type: 'text-area',
            text: 'The previous step either had a light {light}, strength {strength} and nature {nature} or no light {light}.'
        },
        {
            type: 'table',
            table: [
                [0, 0, 10, 1, 0, 0],
                [0, 0, 0, 1, 0, 0],
                [0, 0, 10, 11, 0, 0],
                [0, 10, 10, 1, 0, 0],
            ]
        },
    ]
};
export const op_nextFuture = {
    new: true,
    frame: 10,
    panel: [
        {
            type: 'text-area',
            text: 'This spell transcends time and requires the future evocation of runes. The sorcerer can manipulate time with temporal magic to evoke runes in the future.'
        },
        {
            type: 'label',
            text: ' Basic Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: 'X(s&l)'
        },
        {
            type: 'text-area',
            text: 'In the next time step, both strength {strength} and light {light} must be evoked. This can be done with cards.'
        },
        {
            type: 'table',
            table: [
                [0, 10, 0, 11, 10, 0],
                [0, 10, 0, 11, 0, 0],
                [0, 10, 10, 1, 0, 0],
                [0, 0, 0, 1, 10, 0],
            ]
        },
        {
            type: 'label',
            text: 'Advanced Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: 'X((n&s)-!l)'
        },
        {
            type: 'text-area',
            text: 'In the next time step, if nature {nature} and strength {strength} are both active, then light {light} must not be active.'
        },
        {
            type: 'table',
            table: [
                [0, 10, 10, 1, 0, 0],
                [0, 0, 0, 11, 0, 0],
                [0, 0, 10, 11, 10, 0],
                [0, 10, 0, 1, 10, 0],
            ]
        },
    ]
};

export const op_until = {
    new: true,
    frame: 12,
    panel: [
        {
            type: 'text-area',
            text: 'The two runic combinations are bound to each other. One must remain valid until the other becomes valid.'
        },
        {
            type: 'label',
            text: ' Basic Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: 'nU(l&t)'
        },
        {
            type: 'text-area',
            text: 'Nature {nature} must remain evoked at least until light {light} and transform {transform} are evoked together. It may remain evoked afterwards and the runic combination will still be satisfied.'
        },
        {
            type: 'table',
            table: [
                [0, 0, 0, 0, 11, 0],
                [0, 0, 0, 0, 11, 0],
                [10, 10, 10, 0, 1, 0],
                [0, 0, 0, 0, 1, 0],
            ]
        },
        {
            type: 'label',
            text: 'Advanced Example',
            color: GUI_LABEL_BG
        },
        {
            type: 'formula',
            string: '(l|n)U(s&n)'
        },
        {
            type: 'text-area',
            text: 'Light {light} or nature {nature} must remain evoked until the point where strength {strength} and nature {nature} are first evoked together. They may remain evoked afterwards.'
        },
        {
            type: 'table',
            table: [
                [0, 10, 10, 1, 0, 0],
                [0, 0, 0, 11, 0, 0],
                [0, 0, 10, 11, 0, 0],
                [0, 0, 0, 11, 0, 0],
            ]
        },
    ]
};
export const op_klammer = {
    new: true,
    frame: 13,
    panel: [
        {
            type: 'text-area',
            text: 'Parentheses define a runic combination. They can also be nested to form more complex combinations.'
        },
    ]
};
