# Balatro Game Architecture

## Overview

This document describes the architecture of the Balatro game, a card game built with Phaser 3 and TypeScript. The architecture follows a Model-View pattern with a service layer to manage game state.

## Directory Structure

```
src/
├── base/           # Base utilities and classes
├── data/           # Game data and constants
├── managers/       # Manager classes for various game systems
├── models/         # (Legacy - moved to module/gameplay/models)
├── module/         # Feature modules
│   └── gameplay/   # Gameplay module
│       ├── models/     # Data models and business logic
│       ├── objects/    # UI representation objects
│       └── GameplayService.ts  # Singleton service for gameplay
├── scenes/         # Phaser scenes
├── global.d.ts     # Global type definitions
└── main.ts         # Entry point
```

## Architecture Patterns

### Model-View Separation

The architecture separates data models from their visual representation:

- **Models** (in `module/gameplay/models/`): Contain data and business logic
- **Objects** (in `module/gameplay/objects/`): Handle UI representation and user interaction

### Singleton Service

The `GameplayService` is implemented as a singleton that manages all gameplay models and provides a centralized access point for game state.

## Key Components

### Models

1. **Card**: Represents a playing card with suit, rank, value, and state.
2. **Deck**: Manages a collection of cards with operations like shuffle, draw, etc.
3. **Hand**: Manages the player's hand of cards with selection and sorting capabilities.

### Objects

1. **CardObject**: Visual representation of a Card model with animations and interactions.
2. **DeckObject**: Visual representation of the Deck with 3D effects and card drawing.
3. **HandObject**: Visual representation of the Hand with card arrangement and UI controls.

### Service

**GameplayService**: Singleton that manages all gameplay models and provides methods for game operations.

## Data Flow

1. User interacts with UI objects (CardObject, DeckObject, HandObject)
2. Objects call methods on the GameplayService
3. GameplayService updates the appropriate models
4. Objects observe model changes and update their visual representation

## Scene Management

The game uses Phaser's scene system:

- **Game Scene**: Main gameplay scene that initializes the GameplayService and UI objects

## Type System

The game uses TypeScript interfaces and enums to define:

- Card properties (suit, rank)
- Card enhancements
- Deck styles
- Game state

## Future Improvements

- Add more gameplay modules (scoring, achievements, etc.)
- Implement save/load functionality
- Add multiplayer capabilities 