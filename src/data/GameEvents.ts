export const GameEvents = {
    // Card events
    CARD_SELECTED: 'card:selected',
    CARD_DESELECTED: 'card:deselected',
    CARD_FLIPPED: 'card:flipped',
    CARD_ENHANCED: 'card:enhanced',

    // Hand events
    HAND_UPDATED: 'hand:updated',
    HAND_SORTED: 'hand:sorted',
    HAND_CLEARED: 'hand:cleared',

    // Deck events
    DECK_SHUFFLED: 'deck:shuffled',
    DECK_EMPTY: 'deck:empty',
    CARDS_DRAWN: 'deck:cardsDrawn',

    // Game state events
    GAME_STATE_CHANGED: 'game:stateChanged',
    GAME_STARTED: 'game:started',
    GAME_PAUSED: 'game:paused',
    GAME_RESUMED: 'game:resumed',
    GAME_ENDED: 'game:ended',

    // Score events
    SCORE_UPDATED: 'score:updated',
    HIGH_SCORE_ACHIEVED: 'score:highScore',

    // UI events
    UI_BUTTON_CLICKED: 'ui:buttonClicked',
    UI_DIALOG_OPENED: 'ui:dialogOpened',
    UI_DIALOG_CLOSED: 'ui:dialogClosed',
} as const;

// Type for event names
export type GameEventType = keyof typeof GameEvents; 