/**
 * Automated Headless Simulation Test for RE:TIME
 * Tests syntax, level layouts, physics resolution, rewind engine, and entity loops.
 */

const fs = require('fs');
const path = require('path');

// Mock browser globals for headless verification
global.window = {
    addEventListener: () => {},
    innerWidth: 1024,
    innerHeight: 576
};
global.document = {
    getElementById: (id) => {
        return {
            addEventListener: () => {},
            classList: { add: () => {}, remove: () => {} },
            style: {},
            getContext: () => ({
                fillRect: () => {},
                strokeRect: () => {},
                beginPath: () => {},
                moveTo: () => {},
                lineTo: () => {},
                stroke: () => {},
                fill: () => {},
                arc: () => {},
                closePath: () => {},
                save: () => {},
                restore: () => {},
                translate: () => {},
                scale: () => {},
                createLinearGradient: () => ({ addColorStop: () => {} }),
                createRadialGradient: () => ({ addColorStop: () => {} }),
                fillText: () => {}
            })
        };
    },
    querySelectorAll: () => []
};
global.localStorage = {
    _data: {},
    getItem: (k) => global.localStorage._data[k] || null,
    setItem: (k, v) => { global.localStorage._data[k] = v; }
};

// Load code files in order
const vm = require('vm');
function loadScript(filePath) {
    const code = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
    vm.runInThisContext(code);
}

try {
    console.log('--- TEST 1: Loading all scripts ---');
    loadScript('js/constants.js');
    loadScript('js/storage.js');
    loadScript('js/particles.js');
    loadScript('js/player.js');
    loadScript('js/objects.js');
    loadScript('js/enemies.js');
    loadScript('js/rewind.js');
    loadScript('js/levels.js');
    loadScript('js/renderer.js');
    loadScript('js/ui.js');
    loadScript('js/game.js');
    console.log('✓ All scripts evaluated successfully without syntax errors!');

    console.log('\n--- TEST 2: Verifying 15 Levels Structure ---');
    if (LEVELS.length !== 15) {
        throw new Error(`Expected 15 levels, got ${LEVELS.length}`);
    }
    LEVELS.forEach((lvl, idx) => {
        const id = idx + 1;
        if (lvl.id !== id) throw new Error(`Level index mismatch at ${id}`);
        if (!lvl.spawn || lvl.spawn.x === undefined || lvl.spawn.y === undefined) throw new Error(`Level ${id} missing spawn`);
        if (!lvl.exit || lvl.exit.x === undefined || lvl.exit.y === undefined) throw new Error(`Level ${id} missing exit`);
        if (!lvl.solids || lvl.solids.length === 0) throw new Error(`Level ${id} missing solids`);
        if (!lvl.fragments || lvl.fragments.length !== 3) throw new Error(`Level ${id} expected 3 fragments, got ${lvl.fragments.length}`);
        console.log(`✓ Level ${id.toString().padStart(2, '0')}: "${lvl.title}" (Capítulo ${lvl.chapter}) verified.`);
    });

    console.log('\n--- TEST 3: Simulating Gameplay & Rewind Engine ---');
    const mockCanvas = document.getElementById('game-canvas');
    const game = new Game(mockCanvas);
    const ui = new UIManager(game);
    game.setUI(ui);

    // Test each level loading and running 60 ticks
    for (let i = 1; i <= 15; i++) {
        game.loadLevel(i);
        if (game.state !== CONSTANTS.STATES.PLAYING) throw new Error(`Level ${i} failed to enter PLAYING state`);

        // Simulate 60 ticks of physics
        for (let t = 0; t < 60; t++) {
            game.update();
        }
    }
    console.log('✓ Successfully simulated physics ticks for all 15 levels!');

    console.log('\n--- TEST 4: Deep Testing Rewind Functionality ---');
    game.loadLevel(3); // Level with box, button, door
    const initialPlayerX = game.player.x;

    // Move player right for 30 ticks
    game.input.keys['KeyD'] = true;
    for (let t = 0; t < 30; t++) {
        game.update();
    }
    game.input.keys['KeyD'] = false;
    const movedPlayerX = game.player.x;
    console.log(`Player moved from X: ${initialPlayerX} to X: ${movedPlayerX}`);
    if (movedPlayerX <= initialPlayerX) throw new Error('Player did not move forward with KeyD');

    // Verify history recorded
    console.log(`Recorded snapshots: ${game.rewindEngine.history.length}`);
    if (game.rewindEngine.history.length < 25) throw new Error('Rewind history not recording correctly');

    // Trigger Rewind by holding KeyR
    game.input.keys['KeyR'] = true;
    for (let t = 0; t < 25; t++) {
        game.update();
    }
    game.input.keys['KeyR'] = false;
    game.update(); // Release tick

    const rewoundPlayerX = game.player.x;
    console.log(`Player rewound back to X: ${rewoundPlayerX}`);
    if (rewoundPlayerX >= movedPlayerX) throw new Error('Rewind did not restore player to past position');
    if (game.state !== CONSTANTS.STATES.PLAYING) throw new Error('Did not return to PLAYING state after releasing R');

    console.log('✓ Rewind accurately reverted position and resumed play seamlessly!');

    console.log('\n--- ALL AUTOMATED GAMEPLAY TESTS PASSED PERFECTLY! ---');
} catch (err) {
    console.error('TEST ERROR:', err);
    process.exit(1);
}
