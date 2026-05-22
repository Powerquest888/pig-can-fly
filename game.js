// ============================================================
// PIG CAN FLY — Phaser 3 Side-Scrolling Arcade Game
// ============================================================

const GAME_W = 1280;
const GAME_H = 720;
const GROUND_Y = 620;
const GROUND_H = 100;
const PIG_X = 200;
const BASE_SCROLL_SPEED = 300;
const GRAVITY = 1200;
const JUMP_VEL = -520;
const DOUBLE_JUMP_VEL = -460;

const FRUIT_TYPES = ['apple', 'orange', 'banana', 'pineapple', 'strawberry', 'grapes'];
const FRUIT_COLORS = {
    apple: 0xff4444,
    orange: 0xff8833,
    banana: 0xffee44,
    pineapple: 0xffcc00,
    strawberry: 0xff5577,
    grapes: 0x9944cc
};
const FRUIT_EMOJIS = {
    apple: '🍎', orange: '🍊', banana: '🍌',
    pineapple: '🍍', strawberry: '🍓', grapes: '🍇'
};

const OBSTACLE_TYPES = ['haystack', 'gate', 'bush', 'tractor', 'boulder'];

const POWER_INFO = {
    apple:      { name: 'Lightfoot',    duration: 15000, color: 0xffd700 },
    banana:     { name: 'Flight',       duration: 20000, color: 0x66bbff },
    orange:     { name: 'Stoneskin',    duration: 12000, color: 0x888888 },
    strawberry: { name: 'Speed Burst',  duration: 10000, color: 0xff4400 },
    pineapple:  { name: 'Spike Shield', duration: 12000, color: 0x44bb44 },
    grapes:     { name: 'Magnet',       duration: 15000, color: 0xaa44ff }
};

// ============================================================
// BOOT SCENE — generate all assets programmatically
// ============================================================
class BootScene extends Phaser.Scene {
    constructor() { super('Boot'); }

    preload() {
        // Load pig sprites
        this.load.image('pig_run', 'assets/sprites/pigrun.png');
        this.load.image('pig_mouth_open', 'assets/sprites/pigmouthopen.png');
        this.load.image('pig_fly_closed', 'assets/sprites/pigflymouthclose.png');
    }

    create() {
        this.generateAssets();
        this.scene.start('Menu');
    }

    generateAssets() {
        const g = this.make.graphics({ add: false });

        // --- Sky gradient ---
        this.generateSky(g);

        // --- Parallax layers ---
        this.generateClouds(g);
        this.generateHills(g);
        this.generateGround(g);

        // --- Fruits ---
        FRUIT_TYPES.forEach(f => this.generateFruit(g, f));

        // --- Obstacles ---
        this.generateObstacles(g);

        // --- Particles ---
        this.generateParticle(g);

        // --- UI elements ---
        this.generatePowerIcons(g);

        g.destroy();
    }

    generateSky(g) {
        g.clear();
        for (let y = 0; y < GAME_H; y++) {
            const t = y / GAME_H;
            const r = Math.floor(135 + t * 50);
            const gr = Math.floor(195 + t * 30);
            const b = Math.floor(235 - t * 20);
            g.fillStyle(Phaser.Display.Color.GetColor(r, gr, b));
            g.fillRect(0, y, GAME_W, 1);
        }
        g.generateTexture('sky', GAME_W, GAME_H);
    }

    generateClouds(g) {
        g.clear();
        const cw = 2560;
        for (let i = 0; i < 12; i++) {
            const cx = Phaser.Math.Between(50, cw - 50);
            const cy = Phaser.Math.Between(30, 200);
            const s = Phaser.Math.FloatBetween(0.6, 1.2);
            g.fillStyle(0xffffff, 0.85);
            g.fillEllipse(cx, cy, 120 * s, 50 * s);
            g.fillEllipse(cx - 40 * s, cy + 10, 80 * s, 40 * s);
            g.fillEllipse(cx + 40 * s, cy + 10, 90 * s, 45 * s);
            g.fillStyle(0xffffff, 0.6);
            g.fillEllipse(cx + 10, cy - 10, 100 * s, 35 * s);
        }
        g.generateTexture('clouds', cw, 250);
    }

    generateHills(g) {
        g.clear();
        const hw = 2560;
        const hh = 300;
        // Distant hills
        g.fillStyle(0x7cb87c, 0.7);
        g.beginPath();
        g.moveTo(0, hh);
        for (let x = 0; x <= hw; x += 2) {
            const y = hh - 80 - Math.sin(x * 0.004) * 50 - Math.sin(x * 0.007) * 30 - Math.sin(x * 0.013) * 15;
            g.lineTo(x, y);
        }
        g.lineTo(hw, hh);
        g.closePath();
        g.fillPath();

        // Closer hills
        g.fillStyle(0x5da05d, 0.8);
        g.beginPath();
        g.moveTo(0, hh);
        for (let x = 0; x <= hw; x += 2) {
            const y = hh - 40 - Math.sin(x * 0.006 + 1) * 35 - Math.sin(x * 0.011 + 2) * 20;
            g.lineTo(x, y);
        }
        g.lineTo(hw, hh);
        g.closePath();
        g.fillPath();

        g.generateTexture('hills', hw, hh);
    }

    generateGround(g) {
        g.clear();
        const gw = 2560;

        // Dirt path
        g.fillStyle(0xc4955a);
        g.fillRect(0, 0, gw, GROUND_H);

        // Grass top edge
        g.fillStyle(0x6abf4b);
        g.fillRect(0, 0, gw, 12);

        // Grass tufts
        g.fillStyle(0x7dd35f);
        for (let x = 0; x < gw; x += 15) {
            const h = Phaser.Math.Between(5, 14);
            g.fillTriangle(x, 12, x + 4, 12 - h, x + 8, 12);
        }

        // Subtle dirt texture
        for (let i = 0; i < 200; i++) {
            g.fillStyle(0xb08545, 0.3);
            const rx = Phaser.Math.Between(0, gw);
            const ry = Phaser.Math.Between(15, GROUND_H - 5);
            g.fillCircle(rx, ry, Phaser.Math.Between(1, 3));
        }

        // Small flowers
        for (let x = 0; x < gw; x += Phaser.Math.Between(60, 120)) {
            const colors = [0xffdddd, 0xffffdd, 0xddddff, 0xffccee];
            g.fillStyle(Phaser.Math.RND.pick(colors));
            g.fillCircle(x, 8, 3);
            g.fillStyle(0xffff88);
            g.fillCircle(x, 8, 1.5);
        }

        g.generateTexture('ground', gw, GROUND_H);
    }

    generateFruit(g, type) {
        g.clear();
        const s = 40;
        const c = s / 2;

        switch (type) {
            case 'apple':
                g.fillStyle(0xff3333);
                g.fillCircle(c, c + 4, 14);
                g.fillCircle(c - 4, c + 2, 12);
                g.fillCircle(c + 4, c + 2, 12);
                g.fillStyle(0x44aa22);
                g.fillRect(c - 1, c - 12, 3, 8);
                g.fillEllipse(c + 6, c - 8, 8, 5);
                // Highlight
                g.fillStyle(0xffffff, 0.4);
                g.fillCircle(c - 4, c - 2, 4);
                break;
            case 'orange':
                g.fillStyle(0xff8800);
                g.fillCircle(c, c + 2, 15);
                g.fillStyle(0xffaa33, 0.5);
                g.fillCircle(c - 3, c - 2, 6);
                g.fillStyle(0x44aa22);
                g.fillRect(c - 1, c - 14, 3, 6);
                g.fillEllipse(c + 5, c - 11, 7, 4);
                g.fillStyle(0xffffff, 0.3);
                g.fillCircle(c - 4, c - 3, 4);
                break;
            case 'banana':
                g.fillStyle(0xffdd22);
                // Curved banana shape using arcs
                g.beginPath();
                g.arc(c, c + 15, 20, -2.3, -0.8, false);
                g.arc(c, c + 15, 14, -0.8, -2.3, true);
                g.closePath();
                g.fillPath();
                g.fillStyle(0x886611);
                g.fillCircle(c + 10, c - 2, 2);
                g.fillCircle(c - 12, c + 8, 2);
                g.fillStyle(0xffffff, 0.3);
                g.fillEllipse(c - 2, c + 2, 8, 4);
                break;
            case 'pineapple':
                g.fillStyle(0xddaa00);
                g.fillEllipse(c, c + 4, 22, 28);
                // Cross-hatch pattern
                g.lineStyle(1, 0xcc8800, 0.5);
                for (let i = -8; i <= 8; i += 4) {
                    g.lineBetween(c - 11, c + i, c + 11, c + i + 6);
                    g.lineBetween(c - 11, c + i + 6, c + 11, c + i);
                }
                // Crown
                g.fillStyle(0x33aa22);
                g.fillTriangle(c - 6, c - 10, c - 3, c - 22, c, c - 10);
                g.fillTriangle(c - 2, c - 10, c + 1, c - 24, c + 4, c - 10);
                g.fillTriangle(c + 2, c - 10, c + 5, c - 20, c + 8, c - 10);
                break;
            case 'strawberry':
                g.fillStyle(0xff2255);
                g.fillTriangle(c - 12, c - 4, c + 12, c - 4, c, c + 16);
                g.fillCircle(c, c - 2, 13);
                // Seeds
                g.fillStyle(0xffee88);
                for (let i = 0; i < 6; i++) {
                    const a = (i / 6) * Math.PI * 2;
                    g.fillCircle(c + Math.cos(a) * 7, c + Math.sin(a) * 5, 1.5);
                }
                // Leaves
                g.fillStyle(0x33aa22);
                g.fillEllipse(c - 5, c - 12, 8, 5);
                g.fillEllipse(c + 5, c - 12, 8, 5);
                g.fillEllipse(c, c - 13, 6, 6);
                g.fillStyle(0xffffff, 0.3);
                g.fillCircle(c - 4, c - 4, 3);
                break;
            case 'grapes':
                g.fillStyle(0x8833bb);
                const positions = [
                    [0, -6], [-6, 0], [6, 0], [-3, 6], [3, 6], [0, 12],
                    [-9, 6], [9, 6], [-6, 12], [6, 12]
                ];
                positions.forEach(([ox, oy]) => {
                    g.fillCircle(c + ox, c + oy, 5);
                });
                g.fillStyle(0xaa55dd, 0.5);
                positions.slice(0, 4).forEach(([ox, oy]) => {
                    g.fillCircle(c + ox - 1, c + oy - 1, 2);
                });
                g.fillStyle(0x33aa22);
                g.fillRect(c - 1, c - 14, 2, 8);
                g.fillEllipse(c + 4, c - 11, 6, 4);
                break;
        }

        g.generateTexture('fruit_' + type, s, s);
    }

    generateObstacles(g) {
        // Haystack
        g.clear();
        g.fillStyle(0xccaa44);
        g.fillTriangle(0, 80, 40, 0, 80, 80);
        g.fillStyle(0xddbb55);
        g.fillTriangle(5, 78, 40, 8, 75, 78);
        g.lineStyle(1, 0xaa8833, 0.5);
        for (let i = 10; i < 80; i += 8) {
            g.lineBetween(10, i, 70, i);
        }
        g.fillStyle(0xbb9933);
        g.fillRect(0, 75, 80, 5);
        g.generateTexture('obs_haystack', 80, 80);

        // Gate
        g.clear();
        g.fillStyle(0x885533);
        g.fillRect(0, 0, 8, 120);
        g.fillRect(52, 0, 8, 120);
        g.fillStyle(0x996644);
        g.fillRect(0, 10, 60, 10);
        g.fillRect(0, 50, 60, 10);
        g.fillRect(0, 90, 60, 10);
        // Cross brace
        g.lineStyle(3, 0x774422);
        g.lineBetween(4, 10, 56, 100);
        g.lineBetween(56, 10, 4, 100);
        // Post caps
        g.fillStyle(0x664422);
        g.fillCircle(4, 0, 6);
        g.fillCircle(56, 0, 6);
        g.generateTexture('obs_gate', 60, 120);

        // Bush
        g.clear();
        g.fillStyle(0x44882b);
        g.fillEllipse(60, 35, 120, 60);
        g.fillStyle(0x55993b);
        g.fillEllipse(40, 30, 70, 50);
        g.fillEllipse(85, 30, 65, 45);
        g.fillStyle(0x66aa44);
        g.fillEllipse(55, 25, 50, 30);
        // Berries
        g.fillStyle(0xcc3344);
        [15, 45, 75, 100].forEach(x => {
            g.fillCircle(x, Phaser.Math.Between(20, 40), 3);
        });
        g.generateTexture('obs_bush', 120, 55);

        // Tractor
        g.clear();
        // Body
        g.fillStyle(0xcc3333);
        g.fillRect(20, 20, 80, 50);
        g.fillRect(10, 10, 50, 20);
        // Roof
        g.fillStyle(0x333333);
        g.fillRect(15, 0, 40, 15);
        // Big rear wheel
        g.fillStyle(0x333333);
        g.fillCircle(30, 80, 25);
        g.fillStyle(0x555555);
        g.fillCircle(30, 80, 18);
        g.fillStyle(0x333333);
        g.fillCircle(30, 80, 8);
        // Front wheel
        g.fillCircle(85, 80, 16);
        g.fillStyle(0x555555);
        g.fillCircle(85, 80, 11);
        g.fillStyle(0x333333);
        g.fillCircle(85, 80, 5);
        // Exhaust
        g.fillStyle(0x444444);
        g.fillRect(15, -5, 6, 18);
        // Window
        g.fillStyle(0x88ccff);
        g.fillRect(22, 13, 28, 14);
        // Details
        g.fillStyle(0xffcc00);
        g.fillCircle(100, 40, 5);
        g.generateTexture('obs_tractor', 110, 105);

        // Boulder
        g.clear();
        g.fillStyle(0x888888);
        g.fillCircle(35, 35, 32);
        g.fillStyle(0x999999);
        g.fillCircle(30, 28, 24);
        g.fillStyle(0x777777);
        g.fillCircle(40, 42, 20);
        // Cracks
        g.lineStyle(1, 0x666666, 0.6);
        g.lineBetween(20, 25, 35, 40);
        g.lineBetween(35, 40, 50, 35);
        g.lineBetween(28, 38, 38, 50);
        // Moss
        g.fillStyle(0x77aa55, 0.5);
        g.fillEllipse(25, 45, 15, 8);
        g.generateTexture('obs_boulder', 70, 70);
    }

    generateParticle(g) {
        g.clear();
        g.fillStyle(0xffffff);
        g.fillCircle(4, 4, 4);
        g.generateTexture('particle', 8, 8);

        g.clear();
        g.fillStyle(0xffdd44);
        // Draw a star shape manually
        const cx = 8, cy = 8, points = 5, outerR = 8, innerR = 3;
        g.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = (i * Math.PI / points) - Math.PI / 2;
            const sx = cx + Math.cos(angle) * r;
            const sy = cy + Math.sin(angle) * r;
            if (i === 0) g.moveTo(sx, sy);
            else g.lineTo(sx, sy);
        }
        g.closePath();
        g.fillPath();
        g.generateTexture('star', 16, 16);

        // Debris chunk
        g.clear();
        g.fillStyle(0xaa8844);
        g.fillRect(0, 0, 12, 10);
        g.fillStyle(0x997733);
        g.fillRect(2, 2, 8, 6);
        g.generateTexture('debris', 12, 10);

        // Dust puff
        g.clear();
        g.fillStyle(0xddccaa, 0.6);
        g.fillCircle(8, 8, 8);
        g.generateTexture('dust', 16, 16);
    }

    generatePowerIcons(g) {
        Object.entries(POWER_INFO).forEach(([fruit, info]) => {
            g.clear();
            g.fillStyle(info.color, 0.8);
            g.fillRoundedRect(0, 0, 36, 36, 6);
            g.lineStyle(2, 0xffffff, 0.8);
            g.strokeRoundedRect(0, 0, 36, 36, 6);
            g.generateTexture('power_icon_' + fruit, 36, 36);
        });
    }
}

// ============================================================
// AUDIO MANAGER — Procedural audio using Web Audio API
// ============================================================
class AudioManager {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.musicPlaying = false;
        this.musicGain = null;
        this.musicNodes = [];
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.4;
            this.masterGain.connect(this.ctx.destination);
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio not available');
        }
    }

    playNote(freq, duration, type = 'sine', volume = 0.3, delay = 0) {
        if (!this.initialized) return;
        const t = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + duration);
    }

    playJump() {
        this.playNote(400, 0.15, 'sine', 0.25);
        this.playNote(600, 0.1, 'sine', 0.2, 0.05);
    }

    playDoubleJump() {
        this.playNote(500, 0.1, 'sine', 0.25);
        this.playNote(700, 0.1, 'sine', 0.2, 0.05);
        this.playNote(900, 0.08, 'sine', 0.15, 0.1);
    }

    playFruitCollect() {
        this.playNote(800, 0.08, 'sine', 0.2);
        this.playNote(1000, 0.08, 'sine', 0.2, 0.06);
        this.playNote(1200, 0.12, 'sine', 0.15, 0.12);
    }

    playPowerActivate() {
        [523, 659, 784, 1047].forEach((f, i) => {
            this.playNote(f, 0.2, 'sine', 0.2, i * 0.08);
        });
    }

    playSmash() {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;
        // Noise burst for crash
        const bufferSize = this.ctx.sampleRate * 0.3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        noise.connect(gain);
        gain.connect(this.masterGain);
        noise.start(t);
        this.playNote(150, 0.2, 'square', 0.15);
    }

    playDeath() {
        [400, 350, 300, 200].forEach((f, i) => {
            this.playNote(f, 0.2, 'sawtooth', 0.15, i * 0.12);
        });
    }

    playGameOver() {
        const notes = [523, 493, 440, 392, 349, 330, 294, 262];
        notes.forEach((f, i) => {
            this.playNote(f, 0.3, 'sine', 0.15, i * 0.15);
        });
    }

    startMusic() {
        if (!this.initialized || this.musicPlaying) return;
        this.musicPlaying = true;
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.08;
        this.musicGain.connect(this.masterGain);
        this._playMusicLoop();
    }

    _playMusicLoop() {
        if (!this.musicPlaying) return;
        const melody = [
            523, 587, 659, 523, 659, 698, 784, 0,
            784, 698, 659, 587, 523, 587, 659, 523,
            440, 494, 523, 587, 659, 587, 523, 440,
            349, 392, 440, 523, 494, 440, 392, 349
        ];
        const bass = [262, 262, 330, 330, 349, 349, 392, 392];
        const beatLen = 0.2;

        melody.forEach((f, i) => {
            if (f > 0) this.playNote(f, beatLen * 0.8, 'sine', 0.06, i * beatLen);
        });
        bass.forEach((f, i) => {
            this.playNote(f, beatLen * 3.5, 'triangle', 0.04, i * beatLen * 4);
        });

        const loopLen = melody.length * beatLen * 1000;
        this._musicTimer = setTimeout(() => this._playMusicLoop(), loopLen);
    }

    stopMusic() {
        this.musicPlaying = false;
        if (this._musicTimer) clearTimeout(this._musicTimer);
        if (this.musicGain) {
            this.musicGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
        }
    }
}

const audioMgr = new AudioManager();

// ============================================================
// MENU SCENE
// ============================================================
class MenuScene extends Phaser.Scene {
    constructor() { super('Menu'); }

    create() {
        // Sky background
        this.add.image(GAME_W / 2, GAME_H / 2, 'sky');

        // Hills
        this.add.image(GAME_W / 2, GAME_H - 150, 'hills').setScale(0.6).setAlpha(0.7);

        // Ground
        this.add.tileSprite(GAME_W / 2, GAME_H - GROUND_H / 2, GAME_W, GROUND_H, 'ground');

        // Title
        const titleStyle = {
            fontSize: '72px', fontFamily: 'Georgia, serif',
            color: '#ffffff', stroke: '#885522', strokeThickness: 8,
            shadow: { offsetX: 3, offsetY: 3, color: '#00000055', blur: 8, fill: true }
        };
        this.add.text(GAME_W / 2, 140, '🐷 Pig Can Fly 🐷', titleStyle).setOrigin(0.5);

        // Animated pig
        this.pig = this.add.image(GAME_W / 2, 360, 'pig_run').setScale(2);
        this.pigTimer = 0;

        // High score
        const hs = localStorage.getItem('pigcanfly_highscore') || 0;
        this.add.text(GAME_W / 2, 460, `High Score: ${hs}`, {
            fontSize: '28px', fontFamily: 'Georgia, serif',
            color: '#ffe8cc', stroke: '#663300', strokeThickness: 4
        }).setOrigin(0.5);

        // Start prompt
        this.prompt = this.add.text(GAME_W / 2, 540, '[ TAP or SPACEBAR to Start ]', {
            fontSize: '30px', fontFamily: 'Georgia, serif',
            color: '#ffffff', stroke: '#444444', strokeThickness: 3
        }).setOrigin(0.5);

        // Controls info
        this.add.text(GAME_W / 2, 610, 'Spacebar / Tap = Jump  •  Double Jump in mid-air!', {
            fontSize: '18px', fontFamily: 'Arial, sans-serif',
            color: '#ddeedd'
        }).setOrigin(0.5);

        // Input
        this.input.keyboard.on('keydown-SPACE', () => this.startGame());
        this.input.on('pointerdown', () => this.startGame());
    }

    startGame() {
        audioMgr.init();
        this.scene.start('Game');
    }

    update(time) {
        // Bob the pig
        this.pig.y = 360 + Math.sin(time * 0.003) * 15;
        this.pig.rotation = Math.sin(time * 0.004) * 0.08;
        // Pulse the prompt
        this.prompt.alpha = 0.5 + Math.sin(time * 0.005) * 0.5;
    }
}

// ============================================================
// GAME SCENE — Main gameplay
// ============================================================
class GameScene extends Phaser.Scene {
    constructor() { super('Game'); }

    create() {
        this.score = 0;
        this.scrollSpeed = BASE_SCROLL_SPEED;
        this.gameOver = false;
        this.pigOnGround = true;
        this.jumpCount = 0;
        this.fruitCounts = {};
        FRUIT_TYPES.forEach(f => this.fruitCounts[f] = 0);
        this.totalFruits = 0;
        this.activePower = null;
        this.powerTimer = 0;
        this.powerDuration = 0;
        this.powersUsed = [];
        this.isFlying = false;
        this.pigVelY = 0;
        this.distanceTravelled = 0;
        this.nextObstacleDist = 400;
        this.nextFruitDist = 200;
        this.difficultyTimer = 0;

        // Layers (back to front)
        this.sky = this.add.image(GAME_W / 2, GAME_H / 2, 'sky').setScrollFactor(0);
        this.cloudLayer = this.add.tileSprite(GAME_W / 2, 130, GAME_W, 250, 'clouds').setScrollFactor(0);
        this.hillLayer = this.add.tileSprite(GAME_W / 2, GAME_H - 220, GAME_W, 300, 'hills').setScrollFactor(0);
        this.groundLayer = this.add.tileSprite(GAME_W / 2, GAME_H - GROUND_H / 2, GAME_W, GROUND_H, 'ground').setScrollFactor(0);

        // Obstacle & fruit groups
        this.obstacles = this.add.group();
        this.fruits = this.add.group();
        this.particles = this.add.group();

        // Pig
        this.pig = this.add.image(PIG_X, GROUND_Y - 60, 'pig_run').setScale(1.0);
        this.pig.setOrigin(0.5, 1);

        // Aura graphics (drawn behind pig)
        this.aura = this.add.graphics();
        this.auraTime = 0;

        // Power effect overlays
        this.spikeOverlay = this.add.graphics();
        this.trailParticles = [];

        // HUD
        this.createHUD();

        // Input
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.jumpPressed = false;

        this.input.on('pointerdown', () => {
            this.handleJump();
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            this.handleJump();
        });
        this.input.keyboard.on('keydown-UP', () => {
            this.handleJump();
        });

        // Start music
        audioMgr.startMusic();

        // Pre-spawn some initial fruits
        for (let d = 300; d < 1200; d += Phaser.Math.Between(150, 250)) {
            this.spawnFruit(GAME_W + d);
        }
    }

    createHUD() {
        const hudStyle = {
            fontSize: '24px', fontFamily: 'Georgia, serif',
            color: '#ffffff', stroke: '#333333', strokeThickness: 3
        };
        const smallStyle = {
            fontSize: '18px', fontFamily: 'Arial, sans-serif',
            color: '#ffffff', stroke: '#333333', strokeThickness: 2
        };

        // Score
        this.scoreText = this.add.text(20, 15, 'Score: 0', hudStyle).setScrollFactor(0).setDepth(100);

        // High score
        const hs = localStorage.getItem('pigcanfly_highscore') || 0;
        this.highScoreText = this.add.text(GAME_W - 20, 15, `Best: ${hs}`, hudStyle)
            .setOrigin(1, 0).setScrollFactor(0).setDepth(100);

        // Power icon + timer bar (hidden initially)
        this.powerIcon = this.add.image(GAME_W / 2, 20, 'power_icon_apple')
            .setOrigin(0.5, 0).setScrollFactor(0).setDepth(100).setVisible(false);
        this.powerNameText = this.add.text(GAME_W / 2, 60, '', smallStyle)
            .setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

        // Power timer bar background
        this.powerBarBg = this.add.graphics().setScrollFactor(0).setDepth(99);
        this.powerBarFg = this.add.graphics().setScrollFactor(0).setDepth(100);

        // Fruit counter row
        this.fruitCountTexts = {};
        const fruitY = GAME_H - 35;
        FRUIT_TYPES.forEach((f, i) => {
            const x = 20 + i * 85;
            this.add.image(x, fruitY, 'fruit_' + f).setOrigin(0, 0.5).setScale(0.7)
                .setScrollFactor(0).setDepth(100);
            this.fruitCountTexts[f] = this.add.text(x + 30, fruitY, '0', smallStyle)
                .setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
        });

        // Charge bar
        this.chargeBarBg = this.add.graphics().setScrollFactor(0).setDepth(99);
        this.chargeBarFg = this.add.graphics().setScrollFactor(0).setDepth(100);
        this.chargeText = this.add.text(GAME_W / 2, GAME_H - 12, 'Collect 5 fruits for Super Power!', {
            fontSize: '14px', fontFamily: 'Arial', color: '#ffffcc', stroke: '#333', strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    }

    handleJump() {
        if (this.gameOver) return;

        if (this.isFlying) {
            // During flight mode: nudge upward
            this.pigVelY = -280;
            this.pig.setTexture('pig_mouth_open');
            this.flyTextureTimer = 300;
            audioMgr.playJump();
            return;
        }

        if (this.pigOnGround) {
            // First jump
            this.pigVelY = JUMP_VEL;
            if (this.activePower === 'apple') {
                this.pigVelY = JUMP_VEL * 1.4;
            }
            this.pigOnGround = false;
            this.jumpCount = 1;
            this.pig.setTexture('pig_mouth_open');
            audioMgr.playJump();
        } else if (this.jumpCount < 2) {
            // Double jump
            this.pigVelY = DOUBLE_JUMP_VEL;
            if (this.activePower === 'apple') {
                this.pigVelY = DOUBLE_JUMP_VEL * 1.3;
            }
            this.jumpCount = 2;
            this.pig.setTexture('pig_mouth_open');
            audioMgr.playDoubleJump();
            // Puff particles at pig position
            this.spawnPuff(this.pig.x, this.pig.y - 40, 0xffffff, 5);
        }
    }

    update(time, delta) {
        if (this.gameOver) return;

        const dt = delta / 1000;
        this.difficultyTimer += dt;
        this.distanceTravelled += this.scrollSpeed * dt;

        // Increase difficulty over time
        if (this.difficultyTimer > 1) {
            this.scrollSpeed = Math.min(BASE_SCROLL_SPEED + this.distanceTravelled * 0.01, 700);
            this.difficultyTimer = 0;
        }

        let effectiveSpeed = this.scrollSpeed;
        if (this.activePower === 'strawberry') {
            effectiveSpeed *= 1.8;
        }

        // Score
        this.score = Math.floor(this.distanceTravelled / 10);
        this.scoreText.setText('Score: ' + this.score);

        // Parallax scrolling
        this.cloudLayer.tilePositionX += effectiveSpeed * 0.15 * dt;
        this.hillLayer.tilePositionX += effectiveSpeed * 0.4 * dt;
        this.groundLayer.tilePositionX += effectiveSpeed * dt;

        // --- Pig physics ---
        if (this.isFlying) {
            // Banana flight mode
            const gravity = 200;
            this.pigVelY += gravity * dt;
            this.pig.y += this.pigVelY * dt;

            // Keep pig in middle zone
            if (this.pig.y < 80) {
                this.pig.y = 80;
                this.pigVelY = 0;
            }
            if (this.pig.y > GROUND_Y - 60) {
                this.pig.y = GROUND_Y - 60;
                this.pigVelY = 0;
            }

            // Texture switching
            if (this.flyTextureTimer > 0) {
                this.flyTextureTimer -= delta;
            } else {
                this.pig.setTexture('pig_fly_closed');
            }

            // Bob gently
            this.pig.rotation = Phaser.Math.Clamp(this.pigVelY * 0.0005, -0.3, 0.3);
        } else {
            // Normal ground physics
            if (!this.pigOnGround) {
                let grav = GRAVITY;
                if (this.activePower === 'apple') grav *= 0.65;
                this.pigVelY += grav * dt;
                this.pig.y += this.pigVelY * dt;

                // Rotation based on velocity
                this.pig.rotation = Phaser.Math.Clamp(this.pigVelY * 0.0004, -0.3, 0.4);

                if (this.pig.y >= GROUND_Y) {
                    this.pig.y = GROUND_Y;
                    this.pigVelY = 0;
                    this.pigOnGround = true;
                    this.jumpCount = 0;
                    this.pig.rotation = 0;
                    this.pig.setTexture('pig_run');
                    // Landing dust
                    this.spawnPuff(this.pig.x, GROUND_Y - 5, 0xddccaa, 3);
                }
            } else {
                // Running bob
                this.pig.y = GROUND_Y;
                this.pig.rotation = Math.sin(time * 0.015) * 0.03;
                this.pig.setTexture('pig_run');
            }
        }

        // --- Move obstacles ---
        this.obstacles.children.each(obs => {
            obs.x -= effectiveSpeed * dt;
            if (obs.x < -150) {
                obs.destroy();
            }
        });

        // --- Move fruits ---
        this.fruits.children.each(fruit => {
            fruit.x -= effectiveSpeed * dt;
            // Bob animation
            fruit.y = fruit.baseY + Math.sin(time * 0.005 + fruit.x * 0.01) * 8;

            // Magnet effect
            if (this.activePower === 'grapes') {
                const dx = this.pig.x - fruit.x;
                const dy = (this.pig.y - 40) - fruit.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 250 && dist > 5) {
                    const force = 400 / dist;
                    fruit.x += dx * force * dt;
                    fruit.baseY += dy * force * dt;
                }
            }

            if (fruit.x < -50) {
                fruit.destroy();
            }
        });

        // --- Move particles ---
        this.particles.children.each(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 400 * dt;
            p.alpha -= dt * 1.5;
            if (p.rotation !== undefined) p.rotation += p.rotSpeed * dt;
            if (p.alpha <= 0 || p.y > GAME_H + 50) p.destroy();
        });

        // --- Spawn obstacles ---
        this.nextObstacleDist -= effectiveSpeed * dt;
        if (this.nextObstacleDist <= 0) {
            this.spawnObstacle();
            const minGap = Math.max(250, 500 - this.distanceTravelled * 0.005);
            this.nextObstacleDist = Phaser.Math.Between(minGap, minGap + 300);
        }

        // --- Spawn fruits ---
        this.nextFruitDist -= effectiveSpeed * dt;
        if (this.nextFruitDist <= 0) {
            this.spawnFruit(GAME_W + 50);
            this.nextFruitDist = Phaser.Math.Between(120, 280);
        }

        // --- Collision detection ---
        this.checkCollisions();

        // --- Power timer ---
        if (this.activePower) {
            this.powerTimer -= delta;
            if (this.powerTimer <= 0) {
                this.deactivatePower();
            }
            this.updatePowerBar();
        }

        // --- Aura effect ---
        this.drawAura(time);

        // --- Speed burst trail ---
        if (this.activePower === 'strawberry' && Math.random() < 0.3) {
            this.spawnPuff(this.pig.x - 30, this.pig.y - 40, 0xff4400, 1);
        }
    }

    spawnObstacle() {
        const type = Phaser.Math.RND.pick(OBSTACLE_TYPES);
        const key = 'obs_' + type;
        const obs = this.add.image(GAME_W + 60, GROUND_Y, key);
        obs.setOrigin(0.5, 1);
        obs.obstacleType = type;

        // Scale based on type for better gameplay
        switch (type) {
            case 'haystack': obs.setScale(1.2); break;
            case 'gate': obs.setScale(1.1); break;
            case 'bush': obs.setScale(1.3); break;
            case 'tractor': obs.setScale(1.2); break;
            case 'boulder': obs.setScale(1.1); break;
        }

        // Sometimes spawn clusters
        if (Math.random() < 0.2 && this.distanceTravelled > 2000) {
            const type2 = Phaser.Math.RND.pick(OBSTACLE_TYPES);
            const obs2 = this.add.image(GAME_W + 200, GROUND_Y, 'obs_' + type2);
            obs2.setOrigin(0.5, 1);
            obs2.obstacleType = type2;
            obs2.setScale(1.1);
            this.obstacles.add(obs2);
        }

        this.obstacles.add(obs);
    }

    spawnFruit(x) {
        const type = Phaser.Math.RND.pick(FRUIT_TYPES);
        const heightRange = this.isFlying ? [150, GROUND_Y - 100] : [GROUND_Y - 200, GROUND_Y - 50];
        const y = Phaser.Math.Between(heightRange[0], heightRange[1]);
        const fruit = this.add.image(x, y, 'fruit_' + type);
        fruit.setScale(1.0);
        fruit.fruitType = type;
        fruit.baseY = y;
        this.fruits.add(fruit);
    }

    checkCollisions() {
        const pigBounds = {
            x: this.pig.x - 35,
            y: this.pig.y - 90,
            w: 70,
            h: 85
        };

        // Fruit collection
        this.fruits.children.each(fruit => {
            if (!fruit.active) return;
            const dx = Math.abs(fruit.x - this.pig.x);
            const dy = Math.abs(fruit.y - (this.pig.y - 45));
            if (dx < 40 && dy < 45) {
                this.collectFruit(fruit);
            }
        });

        // Obstacle collision
        if (this.isFlying) return; // Flying = immune to ground obstacles

        this.obstacles.children.each(obs => {
            if (!obs.active) return;
            const obsBounds = obs.getBounds();
            // Shrink hitbox slightly for fairness
            const margin = 10;
            if (this.pig.x + 25 > obsBounds.left + margin &&
                this.pig.x - 25 < obsBounds.right - margin &&
                this.pig.y > obsBounds.top + margin &&
                this.pig.y - 80 < obsBounds.bottom) {

                if (this.activePower === 'orange' || this.activePower === 'pineapple' || this.activePower === 'strawberry') {
                    // Smash through!
                    this.smashObstacle(obs);
                } else {
                    this.die();
                }
            }
        });
    }

    collectFruit(fruit) {
        const type = fruit.fruitType;
        this.fruitCounts[type]++;
        this.totalFruits++;

        // Update HUD
        this.fruitCountTexts[type].setText('' + this.fruitCounts[type]);

        // Sparkle effect
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const p = this.add.image(fruit.x, fruit.y, 'star');
            p.setScale(Phaser.Math.FloatBetween(0.3, 0.7));
            p.setTint(FRUIT_COLORS[type]);
            p.vx = Math.cos(angle) * 120;
            p.vy = Math.sin(angle) * 120 - 50;
            p.rotSpeed = Phaser.Math.FloatBetween(-5, 5);
            p.setDepth(50);
            this.particles.add(p);
        }

        audioMgr.playFruitCollect();
        fruit.destroy();

        // Check for super power activation
        if (this.totalFruits >= 5 && !this.activePower) {
            this.activateSuperPower();
        }

        // Update charge bar
        this.updateChargeBar();
    }

    activateSuperPower() {
        // Find dominant fruit
        let maxCount = 0;
        let dominant = null;
        let lastCollected = null;

        FRUIT_TYPES.forEach(f => {
            if (this.fruitCounts[f] > maxCount) {
                maxCount = this.fruitCounts[f];
                dominant = f;
            }
        });

        // Tie-breaking: use last fruit type from counts > 0
        // (simplified: dominant is already set, ties naturally broken by iteration order
        //  but we prefer the one with highest count)
        this.activePower = dominant;
        const info = POWER_INFO[dominant];
        this.powerTimer = info.duration;
        this.powerDuration = info.duration;
        this.powersUsed.push(info.name);

        // Reset fruit counts
        FRUIT_TYPES.forEach(f => this.fruitCounts[f] = 0);
        this.totalFruits = 0;
        FRUIT_TYPES.forEach(f => this.fruitCountTexts[f].setText('0'));

        // Show power HUD
        this.powerIcon.setTexture('power_icon_' + dominant).setVisible(true);
        this.powerNameText.setText(info.name);

        // Special activation for banana flight
        if (dominant === 'banana') {
            this.isFlying = true;
            this.pigOnGround = false;
            this.pigVelY = -200;
            this.pig.setTexture('pig_mouth_open');
            this.flyTextureTimer = 500;
        }

        // Flash effect
        this.cameras.main.flash(300, 255, 255, 200);
        audioMgr.playPowerActivate();

        this.updateChargeBar();
    }

    deactivatePower() {
        if (this.activePower === 'banana' && this.isFlying) {
            // Gentle descent back to ground
            this.isFlying = false;
            this.pigVelY = 100;
            this.pigOnGround = false;
        }

        this.activePower = null;
        this.powerTimer = 0;
        this.powerIcon.setVisible(false);
        this.powerNameText.setText('');
        this.powerBarBg.clear();
        this.powerBarFg.clear();
        this.pig.clearTint();
    }

    smashObstacle(obs) {
        // Explosion effect
        for (let i = 0; i < 12; i++) {
            const p = this.add.image(obs.x + Phaser.Math.Between(-20, 20),
                obs.y - Phaser.Math.Between(10, 60), 'debris');
            p.setScale(Phaser.Math.FloatBetween(0.5, 1.5));
            p.vx = Phaser.Math.Between(-200, 200);
            p.vy = Phaser.Math.Between(-400, -100);
            p.rotSpeed = Phaser.Math.FloatBetween(-10, 10);
            p.setDepth(50);
            this.particles.add(p);
        }

        // Dust cloud
        for (let i = 0; i < 8; i++) {
            const p = this.add.image(obs.x + Phaser.Math.Between(-30, 30),
                obs.y - Phaser.Math.Between(0, 40), 'dust');
            p.setScale(Phaser.Math.FloatBetween(1, 2.5));
            p.vx = Phaser.Math.Between(-100, 100);
            p.vy = Phaser.Math.Between(-150, -50);
            p.rotSpeed = 0;
            p.setAlpha(0.7);
            p.setDepth(49);
            this.particles.add(p);
        }

        // Star burst
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const p = this.add.image(obs.x, obs.y - 40, 'star');
            p.setScale(0.8);
            p.setTint(0xffdd44);
            p.vx = Math.cos(angle) * 180;
            p.vy = Math.sin(angle) * 180 - 100;
            p.rotSpeed = Phaser.Math.FloatBetween(-8, 8);
            p.setDepth(51);
            this.particles.add(p);
        }

        audioMgr.playSmash();
        this.score += 50;
        obs.destroy();
    }

    spawnPuff(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const p = this.add.image(x + Phaser.Math.Between(-10, 10),
                y + Phaser.Math.Between(-10, 10), 'dust');
            p.setScale(Phaser.Math.FloatBetween(0.5, 1.2));
            p.setTint(color);
            p.vx = Phaser.Math.Between(-50, 50);
            p.vy = Phaser.Math.Between(-80, -20);
            p.rotSpeed = 0;
            p.setAlpha(0.6);
            p.setDepth(45);
            this.particles.add(p);
        }
    }

    drawAura(time) {
        this.aura.clear();
        this.spikeOverlay.clear();
        if (!this.activePower) return;

        const px = this.pig.x;
        const py = this.pig.y - 50;
        const info = POWER_INFO[this.activePower];
        this.auraTime += 0.05;

        const pulse = 0.3 + Math.sin(this.auraTime * 3) * 0.15;

        switch (this.activePower) {
            case 'apple': // Golden glow
                this.aura.fillStyle(0xffd700, pulse * 0.4);
                this.aura.fillCircle(px, py, 55 + Math.sin(this.auraTime * 2) * 5);
                this.aura.fillStyle(0xffee88, pulse * 0.2);
                this.aura.fillCircle(px, py, 70 + Math.sin(this.auraTime * 3) * 8);
                this.pig.setTint(0xffffcc);
                break;

            case 'banana': // Blue/white wing overlay
                this.aura.fillStyle(0x66bbff, pulse * 0.3);
                this.aura.fillCircle(px, py, 50);
                // Wing-like arcs
                this.aura.lineStyle(3, 0xffffff, pulse);
                for (let i = 0; i < 3; i++) {
                    const offset = Math.sin(this.auraTime * 4 + i) * 10;
                    this.aura.strokeEllipse(px - 20 + offset, py - 10, 30 + i * 10, 20 + i * 8);
                    this.aura.strokeEllipse(px + 20 - offset, py - 10, 30 + i * 10, 20 + i * 8);
                }
                this.pig.setTint(0xccddff);
                break;

            case 'orange': // Grey rocky texture
                this.aura.fillStyle(0x888888, pulse * 0.4);
                this.aura.fillCircle(px, py, 55);
                // Rocky fragments around
                for (let i = 0; i < 6; i++) {
                    const a = (i / 6) * Math.PI * 2 + this.auraTime;
                    const r = 45 + Math.sin(this.auraTime * 2 + i) * 8;
                    this.aura.fillStyle(0x999999, 0.5);
                    this.aura.fillCircle(px + Math.cos(a) * r, py + Math.sin(a) * r, 5);
                }
                this.pig.setTint(0xbbbbbb);
                break;

            case 'strawberry': // Red/orange motion blur
                for (let i = 1; i <= 4; i++) {
                    this.aura.fillStyle(0xff4400, (0.3 - i * 0.06));
                    this.aura.fillEllipse(px - i * 18, py, 40, 60);
                }
                this.pig.setTint(0xffaa88);
                break;

            case 'pineapple': // Green spikes
                this.aura.fillStyle(0x44bb44, pulse * 0.3);
                this.aura.fillCircle(px, py, 50);
                for (let i = 0; i < 8; i++) {
                    const a = (i / 8) * Math.PI * 2 + this.auraTime * 0.5;
                    const r1 = 40;
                    const r2 = 60 + Math.sin(this.auraTime * 3 + i) * 5;
                    this.spikeOverlay.fillStyle(0x33aa22, 0.7);
                    this.spikeOverlay.fillTriangle(
                        px + Math.cos(a - 0.15) * r1, py + Math.sin(a - 0.15) * r1,
                        px + Math.cos(a) * r2, py + Math.sin(a) * r2,
                        px + Math.cos(a + 0.15) * r1, py + Math.sin(a + 0.15) * r1
                    );
                }
                this.pig.setTint(0xccffcc);
                break;

            case 'grapes': // Purple magnetic field
                for (let i = 0; i < 5; i++) {
                    const r = 50 + i * 25 + Math.sin(this.auraTime * 2) * 10;
                    this.aura.lineStyle(1.5, 0xaa44ff, 0.3 - i * 0.05);
                    this.aura.strokeCircle(px, py, r);
                }
                // Magnetic field lines
                for (let i = 0; i < 4; i++) {
                    const a = (i / 4) * Math.PI * 2 + this.auraTime;
                    this.aura.lineStyle(2, 0xcc66ff, 0.4);
                    this.aura.lineBetween(
                        px + Math.cos(a) * 30, py + Math.sin(a) * 30,
                        px + Math.cos(a) * (80 + Math.sin(this.auraTime * 3) * 20),
                        py + Math.sin(a) * (80 + Math.sin(this.auraTime * 3) * 20)
                    );
                }
                this.pig.setTint(0xddccff);
                break;
        }
    }

    updatePowerBar() {
        this.powerBarBg.clear();
        this.powerBarFg.clear();

        if (!this.activePower) return;

        const bx = GAME_W / 2 - 75;
        const by = 58;
        const bw = 150;
        const bh = 8;

        this.powerBarBg.fillStyle(0x333333, 0.7);
        this.powerBarBg.fillRoundedRect(bx, by, bw, bh, 4);

        const ratio = Math.max(0, this.powerTimer / this.powerDuration);
        const color = POWER_INFO[this.activePower].color;
        this.powerBarFg.fillStyle(color, 0.9);
        this.powerBarFg.fillRoundedRect(bx, by, bw * ratio, bh, 4);
    }

    updateChargeBar() {
        this.chargeBarBg.clear();
        this.chargeBarFg.clear();

        const bx = GAME_W / 2 - 100;
        const by = GAME_H - 55;
        const bw = 200;
        const bh = 10;

        this.chargeBarBg.fillStyle(0x333333, 0.5);
        this.chargeBarBg.fillRoundedRect(bx, by, bw, bh, 5);

        const ratio = Math.min(this.totalFruits / 5, 1);
        const color = ratio >= 1 ? 0xffdd44 : 0x66bb66;
        this.chargeBarFg.fillStyle(color, 0.8);
        this.chargeBarFg.fillRoundedRect(bx, by, bw * ratio, bh, 5);

        this.chargeText.setText(this.activePower ?
            POWER_INFO[this.activePower].name + ' Active!' :
            `Fruits: ${this.totalFruits}/5 for Super Power`);
    }

    die() {
        if (this.gameOver) return;
        this.gameOver = true;
        audioMgr.stopMusic();
        audioMgr.playDeath();

        // Death animation: tumble with stars
        this.pig.setTint(0xff6666);
        this.tweens.add({
            targets: this.pig,
            y: this.pig.y - 100,
            rotation: Math.PI * 3,
            duration: 600,
            ease: 'Power2',
            onComplete: () => {
                this.tweens.add({
                    targets: this.pig,
                    y: GROUND_Y + 10,
                    duration: 400,
                    ease: 'Bounce.easeOut',
                    onComplete: () => {
                        // Stars around dead pig
                        for (let i = 0; i < 5; i++) {
                            const angle = (i / 5) * Math.PI * 2;
                            const star = this.add.image(
                                this.pig.x + Math.cos(angle) * 35,
                                this.pig.y - 60 + Math.sin(angle) * 20,
                                'star'
                            );
                            star.setScale(0.5);
                            star.setTint(0xffdd44);
                            this.tweens.add({
                                targets: star,
                                rotation: Math.PI * 2,
                                duration: 1000,
                                repeat: -1
                            });
                        }

                        // Save high score
                        const hs = parseInt(localStorage.getItem('pigcanfly_highscore') || '0');
                        if (this.score > hs) {
                            localStorage.setItem('pigcanfly_highscore', this.score);
                        }

                        audioMgr.playGameOver();

                        // Transition to game over after brief pause
                        this.time.delayedCall(1500, () => {
                            this.scene.start('GameOver', {
                                score: this.score,
                                powersUsed: this.powersUsed
                            });
                        });
                    }
                });
            }
        });
    }
}

// ============================================================
// GAME OVER SCENE
// ============================================================
class GameOverScene extends Phaser.Scene {
    constructor() { super('GameOver'); }

    init(data) {
        this.finalScore = data.score || 0;
        this.powersUsed = data.powersUsed || [];
    }

    create() {
        // Background
        this.add.image(GAME_W / 2, GAME_H / 2, 'sky');
        this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0.4);

        // Panel
        const panel = this.add.graphics();
        panel.fillStyle(0x2a1a0a, 0.85);
        panel.fillRoundedRect(GAME_W / 2 - 250, 80, 500, 520, 20);
        panel.lineStyle(3, 0xcc8844);
        panel.strokeRoundedRect(GAME_W / 2 - 250, 80, 500, 520, 20);

        const titleStyle = {
            fontSize: '52px', fontFamily: 'Georgia, serif',
            color: '#ff8866', stroke: '#441111', strokeThickness: 5
        };
        this.add.text(GAME_W / 2, 130, 'Game Over', titleStyle).setOrigin(0.5);

        const hs = parseInt(localStorage.getItem('pigcanfly_highscore') || '0');
        const isNewHigh = this.finalScore >= hs && this.finalScore > 0;

        // Score display
        const scoreStyle = {
            fontSize: '36px', fontFamily: 'Georgia, serif',
            color: '#ffffcc', stroke: '#333', strokeThickness: 3
        };
        this.add.text(GAME_W / 2, 200, `Score: ${this.finalScore}`, scoreStyle).setOrigin(0.5);
        this.add.text(GAME_W / 2, 245, `Best: ${hs}`, {
            fontSize: '24px', fontFamily: 'Georgia', color: '#ffcc88',
            stroke: '#333', strokeThickness: 2
        }).setOrigin(0.5);

        if (isNewHigh) {
            const newHighText = this.add.text(GAME_W / 2, 285, '⭐ NEW HIGH SCORE! ⭐', {
                fontSize: '28px', fontFamily: 'Georgia', color: '#ffdd44',
                stroke: '#663300', strokeThickness: 3
            }).setOrigin(0.5);
            this.tweens.add({
                targets: newHighText,
                scaleX: 1.1, scaleY: 1.1,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }

        // Powers used
        if (this.powersUsed.length > 0) {
            this.add.text(GAME_W / 2, 330, 'Super Powers Used:', {
                fontSize: '20px', fontFamily: 'Georgia', color: '#aaddaa',
                stroke: '#222', strokeThickness: 2
            }).setOrigin(0.5);

            const uniquePowers = [...new Set(this.powersUsed)];
            const powersText = uniquePowers.map(p => {
                const count = this.powersUsed.filter(x => x === p).length;
                return `${p} x${count}`;
            }).join('  •  ');

            this.add.text(GAME_W / 2, 360, powersText, {
                fontSize: '16px', fontFamily: 'Arial', color: '#ccddcc',
                stroke: '#222', strokeThickness: 2
            }).setOrigin(0.5);
        }

        // Dead pig
        this.pig = this.add.image(GAME_W / 2, 440, 'pig_fly_closed').setScale(1.5);
        this.pig.setTint(0xddbbbb);
        this.pig.rotation = 0.2;

        // Play again button
        const btn = this.add.graphics();
        btn.fillStyle(0x44aa44, 1);
        btn.fillRoundedRect(GAME_W / 2 - 100, 510, 200, 55, 12);
        btn.lineStyle(2, 0x66cc66);
        btn.strokeRoundedRect(GAME_W / 2 - 100, 510, 200, 55, 12);

        const btnText = this.add.text(GAME_W / 2, 537, 'Play Again', {
            fontSize: '28px', fontFamily: 'Georgia', color: '#ffffff',
            stroke: '#226622', strokeThickness: 3
        }).setOrigin(0.5);

        // Make button interactive
        const hitArea = this.add.rectangle(GAME_W / 2, 537, 200, 55).setInteractive();
        hitArea.setAlpha(0.001);
        hitArea.on('pointerover', () => { btn.clear(); btn.fillStyle(0x55cc55); btn.fillRoundedRect(GAME_W / 2 - 100, 510, 200, 55, 12); });
        hitArea.on('pointerout', () => { btn.clear(); btn.fillStyle(0x44aa44); btn.fillRoundedRect(GAME_W / 2 - 100, 510, 200, 55, 12); });
        hitArea.on('pointerdown', () => this.scene.start('Game'));

        this.input.keyboard.on('keydown-SPACE', () => this.scene.start('Game'));
    }
}

// ============================================================
// GAME CONFIG
// ============================================================
const config = {
    type: Phaser.AUTO,
    width: GAME_W,
    height: GAME_H,
    parent: 'game-container',
    backgroundColor: '#87ceeb',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, MenuScene, GameScene, GameOverScene],
    input: {
        activePointers: 2
    },
    render: {
        pixelArt: false,
        antialias: true,
        antialiasGL: true
    }
};

const game = new Phaser.Game(config);
