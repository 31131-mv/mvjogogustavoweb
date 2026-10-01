/**
 * RE:TIME - Global Constants & Configurations
 */
const CONSTANTS = {
    // Screen & Tile Dimensions
    CANVAS_WIDTH: 1024,
    CANVAS_HEIGHT: 576,
    TILE_SIZE: 32,
    COLS: 32,
    ROWS: 18,

    // Game States
    STATES: {
        MENU: 'MENU',
        LEVEL_SELECT: 'LEVEL_SELECT',
        HOW_TO_PLAY: 'HOW_TO_PLAY',
        OPTIONS: 'OPTIONS',
        PLAYING: 'PLAYING',
        REWINDING: 'REWINDING',
        PAUSED: 'PAUSED',
        DEAD: 'DEAD',
        GAME_OVER: 'GAME_OVER',
        LEVEL_COMPLETE: 'LEVEL_COMPLETE'
    },

    // Physics
    PHYSICS: {
        GRAVITY: 0.52,
        MAX_FALL: 10.5,
        PLAYER_SPEED: 3.2,
        PLAYER_ACCEL: 0.55,
        PLAYER_DECEL: 0.65,
        AIR_DECEL: 0.2,
        JUMP_FORCE: -9.5,
        VARIABLE_JUMP_FALL_MULT: 0.5, // If releasing jump button early
        COYOTE_TIME: 7, // frames
        JUMP_BUFFER: 7, // frames
        BOX_PUSH_SPEED: 1.8,
        BOX_WEIGHT: 0.7
    },

    // Rewind Mechanics
    REWIND: {
        MAX_SECONDS: 5.0,
        FPS: 60,
        MAX_FRAMES: 300, // 5 seconds * 60 FPS
        MAX_ENERGY: 100,
        DEPLETION_PER_SEC: 20, // 5 seconds total capacity
        RECOVERY_PER_SEC: 15,
        PLAYBACK_SPEED: 1.25 // Smooth rewind rate
    },

    // Gameplay Rules
    GAMEPLAY: {
        INITIAL_LIVES: 3,
        INVULNERABLE_TIME: 90, // 1.5 seconds post-respawn
        CRUMBLE_DELAY: 35, // frames before disappearing platform drops
        CRUMBLE_RESPAWN: 180 // frames to reappear
    },

    // Visual Color Palette
    COLORS: {
        BG_DARK: '#080a14',
        BG_MID: '#101526',
        BG_LIGHT: '#19213a',
        GRID: '#1a2238',
        CYAN: '#00f3ff',
        CYAN_DIM: 'rgba(0, 243, 255, 0.4)',
        CYAN_GLOW: 'rgba(0, 243, 255, 0.2)',
        PURPLE: '#7928ca',
        PURPLE_BRIGHT: '#b842ff',
        PURPLE_GLOW: 'rgba(184, 66, 255, 0.25)',
        ORANGE: '#ff7b00',
        ORANGE_GLOW: 'rgba(255, 123, 0, 0.3)',
        RED: '#ff2d55',
        GREEN: '#00ff88',
        WHITE: '#e6f7ff',
        TEXT_MUTED: '#7282a5'
    },

    // Chapter Information
    CHAPTERS: [
        { id: 1, title: 'Capítulo 1 — Despertar', range: [1, 5], desc: 'Conhecendo as falhas no tecido temporal' },
        { id: 2, title: 'Capítulo 2 — Distorção', range: [6, 10], desc: 'Sistemas de defesa e plataformas cinéticas' },
        { id: 3, title: 'Capítulo 3 — Colapso', range: [11, 15], desc: 'Instabilidade crítica no reator central' }
    ]
};
