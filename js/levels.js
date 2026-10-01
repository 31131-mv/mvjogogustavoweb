/**
 * RE:TIME - Level Definitions (15 Complete Levels across 3 Chapters)
 * Grid dimensions: 32 columns x 18 rows (1024 x 576 px, tile size = 32px).
 * Every level is tested for jump distances, puzzle solvability, and rewind utility.
 */

const LEVELS = [
    // ==========================================
    // CAPÍTULO 1: DESPERTAR (Fases 1 a 5)
    // ==========================================

    // Fase 1: Primeiro Contato
    {
        id: 1,
        title: 'Primeiro Contato',
        chapter: 1,
        parTime: 18,
        hint: 'Use [A/D] ou Setas para mover, [Espaço] para pular. Chegue ao Portal.',
        spawn: { x: 64, y: 440 },
        exit: { x: 920, y: 418 },
        solids: [
            // Outer borders
            { x: 0, y: 0, width: 1024, height: 32 },      // Ceiling
            { x: 0, y: 512, width: 1024, height: 64 },    // Ground floor
            { x: 0, y: 0, width: 32, height: 576 },       // Left wall
            { x: 992, y: 0, width: 32, height: 576 },     // Right wall

            // Platform steps
            { x: 256, y: 448, width: 96, height: 64 },
            { x: 448, y: 384, width: 128, height: 32 },
            { x: 672, y: 448, width: 128, height: 64 },
            { x: 800, y: 480, width: 192, height: 32 }
        ],
        spikes: [],
        movingPlatforms: [],
        crumblingPlatforms: [],
        boxes: [],
        buttons: [],
        doors: [],
        lasers: [],
        securityDrones: [],
        chaserDrones: [],
        checkpoints: [
            { id: 'cp1', x: 480, y: 348 }
        ],
        fragments: [
            { id: 'f1', x: 160, y: 470 },
            { id: 'f2', x: 500, y: 320 },
            { id: 'f3', x: 730, y: 410 }
        ]
    },

    // Fase 2: Obstáculos
    {
        id: 2,
        title: 'Obstáculos',
        chapter: 1,
        parTime: 22,
        hint: 'Cuidado com os espinhos! Pule com precisão.',
        spawn: { x: 64, y: 440 },
        exit: { x: 920, y: 418 },
        solids: [
            { x: 0, y: 0, width: 1024, height: 32 },
            { x: 0, y: 512, width: 1024, height: 64 },
            { x: 0, y: 0, width: 32, height: 576 },
            { x: 992, y: 0, width: 32, height: 576 },

            // Stepping platforms over spikes
            { x: 192, y: 448, width: 64, height: 64 },
            { x: 352, y: 384, width: 96, height: 32 },
            { x: 544, y: 352, width: 96, height: 32 },
            { x: 736, y: 416, width: 96, height: 32 }
        ],
        spikes: [
            { x: 256, y: 496, width: 96, height: 16, orientation: 'UP' },
            { x: 448, y: 496, width: 96, height: 16, orientation: 'UP' },
            { x: 640, y: 496, width: 96, height: 16, orientation: 'UP' }
        ],
        movingPlatforms: [],
        crumblingPlatforms: [],
        boxes: [],
        buttons: [],
        doors: [],
        lasers: [],
        securityDrones: [],
        chaserDrones: [],
        checkpoints: [
            { id: 'cp2', x: 580, y: 316 }
        ],
        fragments: [
            { id: 'f1', x: 224, y: 410 },
            { id: 'f2', x: 400, y: 340 },
            { id: 'f3', x: 780, y: 370 }
        ]
    },

    // Fase 3: Ativação
    {
        id: 3,
        title: 'Ativação',
        chapter: 1,
        parTime: 25,
        hint: 'Empurre a caixa sobre o botão para manter a porta aberta.',
        spawn: { x: 64, y: 440 },
        exit: { x: 920, y: 418 },
        solids: [
            { x: 0, y: 0, width: 1024, height: 32 },
            { x: 0, y: 512, width: 1024, height: 64 },
            { x: 0, y: 0, width: 32, height: 576 },
            { x: 992, y: 0, width: 32, height: 576 },

            // Wall dividing room with blast door
            { x: 736, y: 32, width: 32, height: 416 }
        ],
        spikes: [],
        movingPlatforms: [],
        crumblingPlatforms: [],
        boxes: [
            { id: 'b1', x: 280, y: 480 }
        ],
        buttons: [
            { id: 'btn1', x: 512, y: 504, targetId: 'door1', width: 32, height: 8 }
        ],
        doors: [
            { id: 'door1', x: 736, y: 448, width: 32, height: 64 }
        ],
        lasers: [],
        securityDrones: [],
        chaserDrones: [],
        checkpoints: [],
        fragments: [
            { id: 'f1', x: 290, y: 440 },
            { id: 'f2', x: 520, y: 460 },
            { id: 'f3', x: 840, y: 460 }
        ]
    },

    // Fase 4: O Tempo
    {
        id: 4,
        title: 'O Tempo',
        chapter: 1,
        parTime: 28,
        hint: 'Segure [R] para voltar no tempo caso erre ou queira desfazer um passo.',
        spawn: { x: 64, y: 440 },
        exit: { x: 920, y: 258 },
        solids: [
            { x: 0, y: 0, width: 1024, height: 32 },
            { x: 0, y: 512, width: 1024, height: 64 },
            { x: 0, y: 0, width: 32, height: 576 },
            { x: 992, y: 0, width: 32, height: 576 },

            // Level platforms
            { x: 224, y: 448, width: 96, height: 32 },
            { x: 416, y: 384, width: 96, height: 32 },
            { x: 608, y: 320, width: 96, height: 32 },
            { x: 800, y: 320, width: 192, height: 32 }
        ],
        spikes: [
            { x: 160, y: 496, width: 640, height: 16, orientation: 'UP' }
        ],
        movingPlatforms: [],
        crumblingPlatforms: [],
        boxes: [],
        buttons: [],
        doors: [],
        lasers: [
            { id: 'l1', x: 530, y: 150, width: 6, height: 234, cyclePeriod: 140, initialDelay: 0 }
        ],
        securityDrones: [],
        chaserDrones: [],
        checkpoints: [
            { id: 'cp4', x: 450, y: 348 }
        ],
        fragments: [
            { id: 'f1', x: 260, y: 400 },
            { id: 'f2', x: 640, y: 270 },
            { id: 'f3', x: 860, y: 270 }
        ]
    },

    // Fase 5: Primeiro Paradoxo
    {
        id: 5,
        title: 'Primeiro Paradoxo',
        chapter: 1,
        parTime: 32,
        hint: 'Ative o botão distante, corra e use [R] para atravessar com precisão!',
        spawn: { x: 64, y: 440 },
        exit: { x: 920, y: 418 },
        solids: [
            { x: 0, y: 0, width: 1024, height: 32 },
            { x: 0, y: 512, width: 1024, height: 64 },
            { x: 0, y: 0, width: 32, height: 576 },
            { x: 992, y: 0, width: 32, height: 576 },

            // Lower tunnel and upper ledge
            { x: 288, y: 384, width: 128, height: 32 },
            { x: 544, y: 320, width: 128, height: 32 },
            { x: 768, y: 32, width: 32, height: 416 }
        ],
        spikes: [
            { x: 416, y: 496, width: 128, height: 16, orientation: 'UP' }
        ],
        movingPlatforms: [],
        crumblingPlatforms: [],
        boxes: [
            { id: 'b5', x: 580, y: 280 }
        ],
        buttons: [
            { id: 'btn5', x: 330, y: 504, targetId: 'door5', width: 32, height: 8 }
        ],
        doors: [
            { id: 'door5', x: 768, y: 448, width: 32, height: 64 }
        ],
        lasers: [],
        securityDrones: [],
        chaserDrones: [],
        checkpoints: [
            { id: 'cp5', x: 330, y: 348 }
        ],
        fragments: [
            { id: 'f1', x: 330, y: 460 },
            { id: 'f2', x: 600, y: 270 },
            { id: 'f3', x: 860, y: 460 }
        ]
    },

    // ==========================================
    // CAPÍTULO 2: DISTORÇÃO (Fases 6 a 10)
    // ==========================================

    // Fase 6: Movimento
    {
        id: 6,
        title: 'Movimento',
        chapter: 2,
        parTime: 28,
        hint: 'Plataformas cinéticas em movimento. Suba nelas para atravessar o abismo.',
        spawn: { x: 64, y: 440 },
        exit: { x: 920, y: 418 },
        solids: [
            { x: 0, y: 0, width: 1024, height: 32 },
            { x: 0, y: 512, width: 224, height: 64 },
            { x: 800, y: 512, width: 224, height: 64 },
            { x: 0, y: 0, width: 32, height: 576 },
            { x: 992, y: 0, width: 32, height: 576 },

            // Center rest island
            { x: 480, y: 448, width: 96, height: 32 }
        ],
        spikes: [
            { x: 224, y: 560, width: 576, height: 16, orientation: 'UP' }
        ],
        movingPlatforms: [
            { id: 'mp1', x: 240, y: 460, width: 80, height: 16, endX: 430, endY: 460, speed: 1.5 },
            { id: 'mp2', x: 600, y: 420, width: 80, height: 16, endX: 760, endY: 420, speed: 1.6 }
        ],
        crumblingPlatforms: [],
        boxes: [],
        buttons: [],
        doors: [],
        lasers: [],
        securityDrones: [],
        chaserDrones: [],
        checkpoints: [
            { id: 'cp6', x: 512, y: 412 }
        ],
        fragments: [
            { id: 'f1', x: 330, y: 400 },
            { id: 'f2', x: 520, y: 390 },
            { id: 'f3', x: 680, y: 360 }
        ]
    },

    // Fase 7: Energia
    {
        id: 7,
        title: 'Energia',
        chapter: 2,
        parTime: 32,
        hint: 'Observe o ciclo dos lasers pulsantes. Use o rewind se ficar sem saída.',
        spawn: { x: 64, y: 440 },
        exit: { x: 920, y: 226 },
        solids: [
            { x: 0, y: 0, width: 1024, height: 32 },
            { x: 0, y: 512, width: 1024, height: 64 },
            { x: 0, y: 0, width: 32, height: 576 },
            { x: 992, y: 0, width: 32, height: 576 },

            // Tiered floors
            { x: 224, y: 416, width: 128, height: 32 },
            { x: 448, y: 352, width: 128, height: 32 },
            { x: 672, y: 288, width: 128, height: 32 },
            { x: 864, y: 288, width: 128, height: 32 }
        ],
        spikes: [],
        movingPlatforms: [],
        crumblingPlatforms: [],
        boxes: [],
        buttons: [],
        doors: [],
        lasers: [
            { id: 'l7a', x: 370, y: 180, width: 6, height: 236, cyclePeriod: 120, initialDelay: 0 },
            { id: 'l7b', x: 600, y: 120, width: 6, height: 232, cyclePeriod: 120, initialDelay: 60 }
        ],
        securityDrones: [],
        chaserDrones: [],
        checkpoints: [
            { id: 'cp7', x: 490, y: 316 }
        ],
        fragments: [
            { id: 'f1', x: 270, y: 370 },
            { id: 'f2', x: 500, y: 300 },
            { id: 'f3', x: 720, y: 240 }
        ]
    },

    // Fase 8: Segurança
    {
        id: 8,
        title: 'Segurança',
        chapter: 2,
        parTime: 30,
        hint: 'Drones de segurança patrulham áreas fixas. Pule por cima deles!',
        spawn: { x: 64, y: 440 },
        exit: { x: 920, y: 418 },
        solids: [
            { x: 0, y: 0, width: 1024, height: 32 },
            { x: 0, y: 512, width: 1024, height: 64 },
            { x: 0, y: 0, width: 32, height: 576 },
            { x: 992, y: 0, width: 32, height: 576 },

            // Overhead arches to jump onto or avoid drone
            { x: 256, y: 384, width: 96, height: 32 },
            { x: 480, y: 352, width: 96, height: 32 },
            { x: 704, y: 384, width: 96, height: 32 }
        ],
        spikes: [
            { x: 352, y: 496, width: 128, height: 16, orientation: 'UP' }
        ],
        movingPlatforms: [],
        crumblingPlatforms: [],
        boxes: [],
        buttons: [],
        doors: [],
        lasers: [],
        securityDrones: [
            { id: 'sd1', x: 180, y: 470, minX: 100, maxX: 240, speed: 1.5 },
            { id: 'sd2', x: 600, y: 470, minX: 580, maxX: 720, speed: 1.8 }
        ],
        chaserDrones: [],
        checkpoints: [
            { id: 'cp8', x: 512, y: 316 }
        ],
        fragments: [
            { id: 'f1', x: 290, y: 340 },
            { id: 'f2', x: 520, y: 300 },
            { id: 'f3', x: 740, y: 340 }
        ]
    },

    // Fase 9: Pressão
    {
        id: 9,
        title: 'Pressão',
        chapter: 2,
        parTime: 35,
        hint: 'Drone perseguidor! Ele reage à sua presença. Despiste-o e rebobine se encurralado.',
        spawn: { x: 64, y: 440 },
        exit: { x: 920, y: 418 },
        solids: [
            { x: 0, y: 0, width: 1024, height: 32 },
            { x: 0, y: 512, width: 1024, height: 64 },
            { x: 0, y: 0, width: 32, height: 576 },
            { x: 992, y: 0, width: 32, height: 576 },

            // Barrier wall with bypass tunnel
            { x: 512, y: 128, width: 32, height: 288 },
            { x: 320, y: 384, width: 96, height: 32 },
            { x: 672, y: 384, width: 96, height: 32 }
        ],
        spikes: [],
        movingPlatforms: [],
        crumblingPlatforms: [],
        boxes: [],
        buttons: [],
        doors: [],
        lasers: [],
        securityDrones: [],
        chaserDrones: [
            { id: 'cd1', x: 600, y: 220, detectionRadius: 260, speed: 2.1 }
        ],
        checkpoints: [
            { id: 'cp9', x: 350, y: 348 }
        ],
        fragments: [
            { id: 'f1', x: 350, y: 460 },
            { id: 'f2', x: 520, y: 80 },
            { id: 'f3', x: 710, y: 340 }
        ]
    },

    // Fase 10: Contradição
    {
        id: 10,
        title: 'Contradição',
        chapter: 2,
        parTime: 40,
        hint: 'Combine plataformas móveis, botões, caixas e rewind para vencer.',
        spawn: { x: 64, y: 440 },
        exit: { x: 920, y: 226 },
        solids: [
            { x: 0, y: 0, width: 1024, height: 32 },
            { x: 0, y: 512, width: 1024, height: 64 },
            { x: 0, y: 0, width: 32, height: 576 },
            { x: 992, y: 0, width: 32, height: 576 },

            // Upper ledge and gate
            { x: 800, y: 288, width: 192, height: 32 },
            { x: 768, y: 32, width: 32, height: 416 }
        ],
        spikes: [
            { x: 256, y: 496, width: 256, height: 16, orientation: 'UP' }
        ],
        movingPlatforms: [
            { id: 'mp10', x: 280, y: 430, width: 80, height: 16, endX: 480, endY: 430, speed: 1.5 }
        ],
        crumblingPlatforms: [],
        boxes: [
            { id: 'b10', x: 600, y: 480 }
        ],
        buttons: [
            { id: 'btn10', x: 680, y: 504, targetId: 'door10', width: 32, height: 8 }
        ],
        doors: [
            { id: 'door10', x: 768, y: 448, width: 32, height: 64 }
        ],
        lasers: [],
        securityDrones: [
            { id: 'sd10', x: 380, y: 360, minX: 280, maxX: 500, speed: 1.6 }
        ],
        chaserDrones: [],
        checkpoints: [
            { id: 'cp10', x: 560, y: 476 }
        ],
        fragments: [
            { id: 'f1', x: 380, y: 390 },
            { id: 'f2', x: 620, y: 440 },
            { id: 'f3', x: 850, y: 240 }
        ]
    },

    // ==========================================
    // CAPÍTULO 3: COLAPSO (Fases 11 a 15)
    // ==========================================

    // Fase 11: Instabilidade
    {
        id: 11,
        title: 'Instabilidade',
        chapter: 3,
        parTime: 30,
        hint: 'As plataformas holográficas se desintegram ao toque! Seja rápido ou use [R].',
        spawn: { x: 64, y: 440 },
        exit: { x: 920, y: 418 },
        solids: [
            { x: 0, y: 0, width: 1024, height: 32 },
            { x: 0, y: 512, width: 160, height: 64 },
            { x: 864, y: 512, width: 160, height: 64 },
            { x: 0, y: 0, width: 32, height: 576 },
            { x: 992, y: 0, width: 32, height: 576 },

            // Center solid pillar
            { x: 480, y: 384, width: 64, height: 128 }
        ],
        spikes: [
            { x: 160, y: 560, width: 704, height: 16, orientation: 'UP' }
        ],
        movingPlatforms: [],
        crumblingPlatforms: [
            { id: 'cp11a', x: 224, y: 448, width: 64, height: 16 },
            { id: 'cp11b', x: 352, y: 416, width: 64, height: 16 },
            { id: 'cp11c', x: 608, y: 416, width: 64, height: 16 },
            { id: 'cp11d', x: 736, y: 448, width: 64, height: 16 }
        ],
        boxes: [],
        buttons: [],
        doors: [],
        lasers: [],
        securityDrones: [],
        chaserDrones: [],
        checkpoints: [
            { id: 'cp11', x: 500, y: 348 }
        ],
        fragments: [
            { id: 'f1', x: 250, y: 400 },
            { id: 'f2', x: 500, y: 300 },
            { id: 'f3', x: 760, y: 400 }
        ]
    },

    // Fase 12: Perseguição
    {
        id: 12,
        title: 'Perseguição',
        chapter: 3,
        parTime: 36,
        hint: 'Multiplos drones ativos! Use as plataformas verticais para manobrá-los.',
        spawn: { x: 64, y: 440 },
        exit: { x: 920, y: 194 },
        solids: [
            { x: 0, y: 0, width: 1024, height: 32 },
            { x: 0, y: 512, width: 1024, height: 64 },
            { x: 0, y: 0, width: 32, height: 576 },
            { x: 992, y: 0, width: 32, height: 576 },

            // Multi-tier ledges
            { x: 224, y: 416, width: 96, height: 32 },
            { x: 416, y: 320, width: 96, height: 32 },
            { x: 640, y: 256, width: 96, height: 32 },
            { x: 832, y: 256, width: 160, height: 32 }
        ],
        spikes: [
            { x: 224, y: 496, width: 200, height: 16, orientation: 'UP' },
            { x: 540, y: 496, width: 200, height: 16, orientation: 'UP' }
        ],
        movingPlatforms: [],
        crumblingPlatforms: [],
        boxes: [],
        buttons: [],
        doors: [],
        lasers: [],
        securityDrones: [
            { id: 'sd12a', x: 300, y: 470, minX: 150, maxX: 400, speed: 1.7 }
        ],
        chaserDrones: [
            { id: 'cd12a', x: 750, y: 180, detectionRadius: 280, speed: 2.2 }
        ],
        checkpoints: [
            { id: 'cp12', x: 440, y: 284 }
        ],
        fragments: [
            { id: 'f1', x: 250, y: 370 },
            { id: 'f2', x: 450, y: 260 },
            { id: 'f3', x: 680, y: 200 }
        ]
    },

    // Fase 13: Sem Margem
    {
        id: 13,
        title: 'Sem Margem',
        chapter: 3,
        parTime: 45,
        hint: 'Puzzle temporal de precisão: ative o portão, posicione a caixa e rebobine.',
        spawn: { x: 64, y: 440 },
        exit: { x: 920, y: 418 },
        solids: [
            { x: 0, y: 0, width: 1024, height: 32 },
            { x: 0, y: 512, width: 1024, height: 64 },
            { x: 0, y: 0, width: 32, height: 576 },
            { x: 992, y: 0, width: 32, height: 576 },

            // Central partition with high gate
            { x: 544, y: 32, width: 32, height: 384 },
            { x: 288, y: 384, width: 96, height: 32 },
            { x: 704, y: 384, width: 96, height: 32 }
        ],
        spikes: [
            { x: 192, y: 496, width: 96, height: 16, orientation: 'UP' }
        ],
        movingPlatforms: [
            { id: 'mp13', x: 384, y: 384, width: 80, height: 16, endX: 480, endY: 280, speed: 1.4 }
        ],
        crumblingPlatforms: [],
        boxes: [
            { id: 'b13', x: 320, y: 340 }
        ],
        buttons: [
            { id: 'btn13', x: 740, y: 504, targetId: 'door13', width: 32, height: 8 }
        ],
        doors: [
            { id: 'door13', x: 544, y: 416, width: 32, height: 96 }
        ],
        lasers: [
            { id: 'l13', x: 650, y: 220, width: 6, height: 196, cyclePeriod: 120, initialDelay: 30 }
        ],
        securityDrones: [],
        chaserDrones: [],
        checkpoints: [
            { id: 'cp13', x: 320, y: 348 }
        ],
        fragments: [
            { id: 'f1', x: 330, y: 330 },
            { id: 'f2', x: 440, y: 230 },
            { id: 'f3', x: 830, y: 460 }
        ]
    },

    // Fase 14: Ruptura
    {
        id: 14,
        title: 'Ruptura',
        chapter: 3,
        parTime: 48,
        hint: 'O setor está em colapso! Combine tudo o que aprendeu.',
        spawn: { x: 64, y: 440 },
        exit: { x: 920, y: 226 },
        solids: [
            { x: 0, y: 0, width: 1024, height: 32 },
            { x: 0, y: 512, width: 160, height: 64 },
            { x: 864, y: 288, width: 160, height: 32 },
            { x: 0, y: 0, width: 32, height: 576 },
            { x: 992, y: 0, width: 32, height: 576 },

            // Stepping blocks
            { x: 480, y: 352, width: 64, height: 32 }
        ],
        spikes: [
            { x: 160, y: 560, width: 832, height: 16, orientation: 'UP' }
        ],
        movingPlatforms: [
            { id: 'mp14', x: 580, y: 352, width: 80, height: 16, endX: 740, endY: 352, speed: 1.6 }
        ],
        crumblingPlatforms: [
            { id: 'cr14a', x: 224, y: 448, width: 64, height: 16 },
            { id: 'cr14b', x: 352, y: 400, width: 64, height: 16 },
            { id: 'cr14c', x: 780, y: 320, width: 64, height: 16 }
        ],
        boxes: [],
        buttons: [],
        doors: [],
        lasers: [
            { id: 'l14', x: 420, y: 150, width: 6, height: 230, cyclePeriod: 100, initialDelay: 0 }
        ],
        securityDrones: [
            { id: 'sd14', x: 260, y: 320, minX: 200, maxX: 360, speed: 1.8 }
        ],
        chaserDrones: [
            { id: 'cd14', x: 700, y: 180, detectionRadius: 260, speed: 2.3 }
        ],
        checkpoints: [
            { id: 'cp14', x: 500, y: 316 }
        ],
        fragments: [
            { id: 'f1', x: 250, y: 390 },
            { id: 'f2', x: 500, y: 280 },
            { id: 'f3', x: 720, y: 290 }
        ]
    },

    // Fase 15: O Último Segundo
    {
        id: 15,
        title: 'O Último Segundo',
        chapter: 3,
        parTime: 55,
        hint: 'O colapso temporal do núcleo! Domine o tempo para alcançar a saída final!',
        spawn: { x: 64, y: 440 },
        exit: { x: 920, y: 162 },
        solids: [
            { x: 0, y: 0, width: 1024, height: 32 },
            { x: 0, y: 512, width: 192, height: 64 },
            { x: 864, y: 224, width: 160, height: 32 },
            { x: 0, y: 0, width: 32, height: 576 },
            { x: 992, y: 0, width: 32, height: 576 },

            // Core Chamber structures
            { x: 352, y: 416, width: 96, height: 32 },
            { x: 544, y: 32, width: 32, height: 416 }, // Central containment wall
            { x: 704, y: 320, width: 96, height: 32 }
        ],
        spikes: [
            { x: 192, y: 560, width: 800, height: 16, orientation: 'UP' }
        ],
        movingPlatforms: [
            { id: 'mp15a', x: 224, y: 460, width: 80, height: 16, endX: 320, endY: 460, speed: 1.5 },
            { id: 'mp15b', x: 760, y: 260, width: 80, height: 16, endX: 840, endY: 260, speed: 1.5 }
        ],
        crumblingPlatforms: [
            { id: 'cr15a', x: 460, y: 448, width: 64, height: 16 },
            { id: 'cr15b', x: 610, y: 384, width: 64, height: 16 }
        ],
        boxes: [
            { id: 'b15', x: 380, y: 370 }
        ],
        buttons: [
            { id: 'btn15', x: 380, y: 408, targetId: 'door15', width: 32, height: 8 }
        ],
        doors: [
            { id: 'door15', x: 544, y: 448, width: 32, height: 64 }
        ],
        lasers: [
            { id: 'l15a', x: 670, y: 120, width: 6, height: 260, cyclePeriod: 110, initialDelay: 0 }
        ],
        securityDrones: [
            { id: 'sd15', x: 260, y: 380, minX: 200, maxX: 340, speed: 1.8 }
        ],
        chaserDrones: [
            { id: 'cd15', x: 720, y: 180, detectionRadius: 280, speed: 2.4 }
        ],
        checkpoints: [
            { id: 'cp15', x: 380, y: 380 }
        ],
        fragments: [
            { id: 'f1', x: 260, y: 410 },
            { id: 'f2', x: 640, y: 330 },
            { id: 'f3', x: 750, y: 180 }
        ]
    }
];
