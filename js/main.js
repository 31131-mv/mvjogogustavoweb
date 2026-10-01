/**
 * RE:TIME - Main Entry Point
 * Initializes Canvas, Game, UI Manager, responsive scaling, and the fixed 60Hz loop.
 */

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    // Set fixed virtual resolution for pixel art crispness
    canvas.width = CONSTANTS.CANVAS_WIDTH;
    canvas.height = CONSTANTS.CANVAS_HEIGHT;

    // Instantiate game & UI
    const game = new Game(canvas);
    const ui = new UIManager(game);
    game.setUI(ui);

    // Initial view: Main Menu
    ui.showMainMenu();

    // Responsive canvas container sizing
    function resizeGame() {
        const container = document.getElementById('game-container');
        if (!container) return;

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const targetAspect = CONSTANTS.CANVAS_WIDTH / CONSTANTS.CANVAS_HEIGHT;
        let scale = Math.min(windowWidth / CONSTANTS.CANVAS_WIDTH, windowHeight / CONSTANTS.CANVAS_HEIGHT);

        // Limit maximum upscale for crispness while filling screen nicely
        scale = Math.min(scale, 1.8);

        const newWidth = Math.floor(CONSTANTS.CANVAS_WIDTH * scale);
        const newHeight = Math.floor(CONSTANTS.CANVAS_HEIGHT * scale);

        container.style.width = `${newWidth}px`;
        container.style.height = `${newHeight}px`;
    }

    window.addEventListener('resize', resizeGame);
    resizeGame();

    // 60FPS Game Loop with fixed delta
    let lastTime = performance.now();
    const frameTime = 1000 / 60;
    let accumulator = 0;

    function gameLoop(now) {
        const delta = Math.min(now - lastTime, 100); // Clamp to prevent spiral of death
        lastTime = now;
        accumulator += delta;

        while (accumulator >= frameTime) {
            game.update();
            accumulator -= frameTime;
        }

        game.render();
        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
});
