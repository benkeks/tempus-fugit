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
            text: 'The spell is composed of two runes or runic combination. The sorcerer must evoke both simultaneously to cast the spell.'
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
            text: 'For this example all of the runes need to be activated for the spell to be castable'
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
            text: 'In this case both of the sub formulas need to be fulfilled'
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
            text: 'Some spells can be performed with different runes for the same result. In this case it is enough to evoke at least one of the runes or runic combinations.'
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
            text: 'This formula is very easy to fulfill. Either one of the runes can be active or even both'
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
            text: 'Here we have to combinations, wither of which can be valid (or both) for the whole to be valid. The first is valid if nature {nature} is not evoked or if both nature {nature} und transformation {transform} are evoked. For the second both light {light} and strength {strength} must be evoked or not evoked at the same time. Here nature {nature} and transform {transform} are both evoked to make the formula valid.'
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
            text: 'The two runic combinations are bound in such a way that if the first one has not been evoked the spell may be evoked, however if the first one has been evoked then the second one must also be evoked for the sorcerer to cast the spell. '
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
            text: 'In this case the combination is always valid if light {light} is not active, otherwise the two runes need to be evoked at the same time.'
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
            text: 'In this case this is valid if the first formula isn\'t or if both are valid. So either nature {nature} and transform {transform} are not evoked or they both are which implies light {light} and strength {strength} are not. Here we have the former situation.'
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
            text: 'The two runic combinations are bound to each other. Either both of them or neither of them must be evoked for the sorcerer to be able to cast the spell.'
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
            text: 'Both runic combinations must be in the same state, wither both active or both inactive. As such both the highlighted combinations are valid'
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
            text: 'Here if nature {nature} or strength {strength} are evoked then transform {transform} must have been evoked the whole time for the spell to be castable'
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
            text: 'The runic combination must not be invoked.'
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
            text: 'The expression must not be evoked'
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
            text: 'The whole expression means that light {light} and transform {transform} can not be equally active at the same time in the future'
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
            text: 'This spell peeks into the past near and far. If the runic combination was invoked at some point in the past the sorcerer may cast this spell.'
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
            text: 'The runes are fulfilled on the first time step, therefore the runic combination is fulfilled in the present'
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
            text: 'This formula says that at some point in the past light {light} must have been evoked with nature {nature} or strength {strength} (or both). Here both apply'
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
            text: 'This spell transcends time and looks in the future near and far. The runic combination must be evoked at some point in the future for the sorcerer to be able to cast this spell.'
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
            text: 'At some point in the future the combination must be fulfilled (this can be done with other spells) so that the spell can be cast in the present. '
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
            text: 'This says that in some point in the future either light {light} was not evoked or if it was a nature {nature} was evoked immediately before it. Here either of the conditions would be fulfilled'
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
            text: 'This spell peeks far into the past. The runic combination must have been active until this point for the sorcerer to be able to cast this spell.'
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
            text: 'This means that in no point in the past all three of the runes were evoked at the same time'
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
            text: 'The spell requires continues stream of runic energy, the sorcerer must keep the necessary runes evoked from this point on to be able to cast the spell.'
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
            text: 'In all future time states the formula must be valid, what this example means is that strength {strength} and transformation {transform} can not be active at the same time'
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
            text: 'All future states must have either a strength {strength} and transformation {transform} rune or a nature {nature} without a light {light}'
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
            text: 'This spell peeks into the near past, if the runic combination was evoked by the sorcerer than the spell can be cast. '
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
            text: 'This spell transcends time, it requires future evocation of runes. The sorcerer is capable of manipulating time with temporal magic to evoke runes in the future.'
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
            text: 'The next time step must have both strength {strength} and light {light} evoked (this can be done with cards)'
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
            text: 'In the next time step if nature {nature} and strength {strength} are both active then light {light} must not be'
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
            text: 'The two runic combinations are bound to each other. Either both of them or neither of them must be evoked for the sorcerer to be able to cast the spell.'
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
            text: 'Nature {nature} must have been evoked at least until light {light} and transform {transform} are evoked together, it can however remain invoked and the runic combination is still fulfilled'
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
            text: 'Light {light} or nature {nature} must be evoked at least until the point where strength {strength} and nature {nature} are first evoked together (they may remain evoked afterwards).'
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
            text: 'Parenthesis define a runic combination. They can also be nested in each other to form more complex combinations.'
        },
    ]
};
