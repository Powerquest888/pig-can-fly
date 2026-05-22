// ============================================================
//  PIG CAN FLY  –  Phaser 3 browser game
// ============================================================

const W = 1280;
const H = 720;
const GROUND_Y = 620;          // top of ground strip

// ---- world / physics constants ----
const PIG_RUN_H    = 77;   // target display height for run pig body
const PIG_FLY_SCALE = 0.7741; // scale so fly pig body matches run pig
const SCROLL_SPEED_BASE  = 280;  // px/s
const GRAVITY            = 1800;
const JUMP_VELOCITY      = -700;
const JUMP_VELOCITY_HIGH = -950; // Lightfoot power

// ---- fruit types ----
const FRUITS = [
  { name:'Apple',      emoji:'🍎', color:0xe53935, power:'Lightfoot' },
  { name:'Orange',     emoji:'🍊', color:0xfb8c00, power:'Stoneskin' },
  { name:'Banana',     emoji:'🍌', color:0xfdd835, power:'Flight'    },
  { name:'Pineapple',  emoji:'🍍', color:0xc0ca33, power:'Spike'     },
  { name:'Strawberry', emoji:'🍓', color:0xe91e63, power:'Speed'     },
  { name:'Grapes',     emoji:'🍇', color:0x7b1fa2, power:'Magnet'    },
];

// ---- obstacle types ----
const OBSTACLES = [
  { name:'Haystack',  color:0xd4a017, w:70, h:55  },
  { name:'Gate',      color:0x795548, w:90, h:80  },
  { name:'Bush',      color:0x388e3c, w:80, h:50  },
  { name:'Tractor',   color:0xb71c1c, w:120, h:75 },
  { name:'Boulder',   color:0x607d8b, w:75, h:65  },
];

// ---- power durations ----
const POWER_DURATION = {
  Lightfoot: 15000,
  Flight:    20000,
  Stoneskin: 12000,
  Speed:     10000,
  Spike:     12000,
  Magnet:    15000,
};

const POWER_COLORS = {
  Lightfoot: 0xffd700,
  Flight:    0x42a5f5,
  Stoneskin: 0x9e9e9e,
  Speed:     0xf44336,
  Spike:     0x66bb6a,
  Magnet:    0xce93d8,
};

// ---- difficulty phase settings ----
const PHASE_SPEEDS      = [200, 280, 380];   // phase 1 / 2 / 3
const PHASE_FRUIT_DIST  = [250, 450, 650];   // distance between fruit spawns
const PHASE_OBS_SCALE   = [0.50, 1.0, 1.0]; // obstacle height scale — 50% smaller in phase 1

// ---- power strength (higher wins) ----
const POWER_STRENGTH = {
  Flight:    5,
  Stoneskin: 4,
  Spike:     4,
  Speed:     3,
  Lightfoot: 2,
  Magnet:    1,
};

// ============================================================
//  BootScene – generate textures, load images
// ============================================================
class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    // Pig sprites
    this.load.spritesheet('pigrun_sheet', 'assets/pig_run_sheet.png', {
      frameWidth: 117, frameHeight: 96, endFrame: 11
    });
    this.load.image('pignowing', 'assets/pigrun.jpg');
    this.load.image('pigjump',  'assets/pigjump0wing.jpg');
    this.load.image('pigopen',  'pigmouthopen.PNG');
    this.load.image('pigcalm',  'pigflymouthclose.PNG');
    this.load.image('pigfly',   'assets/pigfly_clean.png');
    this.load.spritesheet('pigfly_sheet', 'assets/pigfly_anim.png', {
      frameWidth: 186, frameHeight: 155, endFrame: 11
    });
  }

  create() {
    this._makeTextures();
    this.scene.start('Start');
  }

  _makeTextures() {
    const g = this.make.graphics({ add: false });
    this._genSky(g);
    this._genClouds(g);
    this._genHills(g);
    this._genGround(g);
    // Fruits
    ['Apple','Orange','Banana','Pineapple','Strawberry','Grapes'].forEach(name => {
      this._genFruit(g, name.toLowerCase());
    });
    this._genObstacles(g);
    // Aura
    g.clear();
    g.lineStyle(4, 0xffffff, 0.6);
    g.strokeCircle(30, 30, 28);
    g.generateTexture('aura', 60, 60);

    // Star (for death animation)
    g.clear();
    g.fillStyle(0xffee44);
    const pts = 5;
    const cx = 16, cy = 16, ro = 14, ri = 6;
    g.beginPath();
    for (let i = 0; i < pts * 2; i++) {
      const angle = (i * Math.PI / pts) - Math.PI / 2;
      const r = i % 2 === 0 ? ro : ri;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      i === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.closePath();
    g.fillPath();
    g.lineStyle(1, 0xffaa00);
    g.strokePath();
    g.generateTexture('star', 32, 32);

    g.destroy();
  }

    _genSky(g) {
        g.clear();
        for (let y = 0; y < H; y++) {
            const t = y / H;
            const r = Math.floor(135 + t * 50);
            const gr = Math.floor(195 + t * 30);
            const b = Math.floor(235 - t * 20);
            g.fillStyle(Phaser.Display.Color.GetColor(r, gr, b));
            g.fillRect(0, y, W, 1);
        }
        g.generateTexture('sky', W, H);
    }

    _genClouds(g) {
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

    _genHills(g) {
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

    _genGround(g) {
        g.clear();
        const gw = 2560;

        // Dirt path
        g.fillStyle(0xc4955a);
        g.fillRect(0, 0, gw, 100);

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
            const ry = Phaser.Math.Between(15, 100 - 5);
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

        g.generateTexture('ground', gw, 100);
    }

    _genFruit(g, type) {
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

    _genObstacles(g) {
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

    _genParticle(g) {
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

    _genPowerIcons(g) {
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
//  StartScene
// ============================================================
class StartScene extends Phaser.Scene {
  constructor() { super('Start'); }

  create() {
    const highScore = parseInt(localStorage.getItem('pigHighScore') || '0');

    // Sky
    this.add.image(W/2, H/2, 'sky');

    // Scrolling hills + clouds in background
    this._bg1 = this.add.tileSprite(W/2, H - 200, W, 160, 'hills').setOrigin(0.5, 1);
    this._bg2 = this.add.tileSprite(W/2, 120, W, 120, 'clouds').setOrigin(0.5, 0);
    this.add.tileSprite(W/2, H, W, 100, 'ground').setOrigin(0.5, 1);

    // Title
    this.add.text(W/2, 140, 'PIG CAN FLY', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '96px',
      color: '#fff',
      stroke: '#d32f2f',
      strokeThickness: 8,
      shadow: { offsetX: 4, offsetY: 4, color: '#000', blur: 0, fill: true }
    }).setOrigin(0.5);

    // High score
    this.add.text(W/2, 250, `Best: ${highScore}`, {
      fontFamily: 'Arial', fontSize: '32px', color: '#ffe082', stroke:'#000', strokeThickness:4
    }).setOrigin(0.5);

    // Animated pig on start screen
    const pig = this.add.sprite(W/2, GROUND_Y - 30, 'pigrun_sheet', 0).setOrigin(0.5, 1);
pig.play('pig_run');
    pig.setScale(Math.min(103 / pig.width, 77 / pig.height));
    this.tweens.add({
      targets: pig,
      y: GROUND_Y - 8,
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Tap to start
    const tapText = this.add.text(W/2, 480, 'TAP OR PRESS SPACE TO START', {
      fontFamily: 'Arial', fontSize: '36px', color: '#fff', stroke:'#000', strokeThickness:4
    }).setOrigin(0.5);

    this.tweens.add({ targets: tapText, alpha: 0, duration: 500, yoyo: true, repeat: -1 });

    // Controls hint
    this.add.text(W/2, 560, 'SPACE / TAP  =  Jump  |  Double Jump allowed', {
      fontFamily: 'Arial', fontSize: '22px', color: '#e0e0e0', stroke:'#000', strokeThickness:3
    }).setOrigin(0.5);

    this._startGame = () => { PigMusicPlayer.start(); this.scene.start('Game'); };

    this.input.keyboard.once('keydown-SPACE', this._startGame);
    this.input.once('pointerdown', this._startGame);
  }

  update() {
    this._bg1.tilePositionX += 1;
    this._bg2.tilePositionX += 0.3;
  }
}

// ============================================================
//  GameScene  (the main game)
// ============================================================
class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  // ----------------------------------------------------------
  create() {
    this._score        = 0;
    this._distance     = 0;
    this._phase        = 1;
    this._maxJumps     = 1;
    this._scrollSpeed  = PHASE_SPEEDS[0];
    this._alive        = true;
    this._jumpCount    = 0;     // 0,1,2
    this._onGround     = true;
    this._velY         = 0;
    this._pigY         = GROUND_Y;   // pig bottom y
    this._fruitCounts  = {};
    FRUITS.forEach(f => { this._fruitCounts[f.name] = 0; });
    this._totalFruitsCollected = 0;
    this._activePower  = null;
    this._powerTimer   = 0;
    this._powersUsed   = new Set();
    this._nextObsDist  = 600;
    this._nextFruitDist = PHASE_FRUIT_DIST[0];
    this._distSinceLastObs  = 0;
    this._distSinceLastFruit= 0;
    this._flightVelY   = 0;
    this._magnetRadius = 220;
    this._deathTriggered = false;

    // ---- Background layers ----
    this.add.image(W/2, H/2, 'sky');
    this._cloudLayer = this.add.tileSprite(W/2, 110, W, 120, 'clouds').setOrigin(0.5, 0);
    this._hillLayer  = this.add.tileSprite(W/2, H - 200, W, 160, 'hills').setOrigin(0.5, 1);
    this._groundLayer= this.add.tileSprite(W/2, H, W, 100, 'ground').setOrigin(0.5, 1);

    // ---- Groups ----
    this._obstacles = this.add.group();
    this._fruits    = this.add.group();

    // ---- Pig fly animation ----
    if (!this.anims.exists('pig_run')) {
      this.anims.create({
        key: 'pig_run',
        frames: this.anims.generateFrameNumbers('pigrun_sheet', { start: 0, end: 11 }),
        frameRate: 12,
        repeat: -1
      });
    }
    if (!this.anims.exists('pig_fly')) {
      this.anims.create({
        key: 'pig_fly',
        frames: this.anims.generateFrameNumbers('pigfly_sheet', { start: 0, end: 11 }),
        frameRate: 12,
        repeat: -1
      });
    }
    // ---- Pig (wingless image) ----
    this._pig = this.add.sprite(200, GROUND_Y, 'pigrun_sheet', 0).setOrigin(0.5, 1).setDepth(4);
this._pig.play('pig_run');
    this._pigBounceTween = null;
    // ---- Wings overlay (sprite so it can animate; hidden by default) ----
    this._wings = null;
    this._scalePig();

    // ---- Aura (power visual) ----
    this._aura = this.add.image(0, 0, 'aura').setAlpha(0).setDepth(5);

    // ---- HUD ----
    this._buildHUD();

    // ---- Input ----
    this.input.keyboard.on('keydown-SPACE', () => this._doJump());
    this.input.on('pointerdown', () => this._doJump());

    // (debris particles are spawned imperatively in _explodeObstacle)
  }

  _scalePig() {
    const pig = this._pig;
    const targetH = PIG_RUN_H;
    const s = targetH / pig.height;
    pig.setScale(s);
    
  }

  _setPigTexture(key) {
    this._pig.stop();
    this._pig.setTexture(key);
    // Use natural texture height, not display height
    const naturalH = this._pig.texture.source[0].height;
    this._pig.setScale(72 / naturalH);
  }

  _setPigAnim(key, ignoreIfPlaying) {
    this._pig.play(key, ignoreIfPlaying);
    this._pig.setScale(72 / (this._pig.height || 66));
  }

  // ----------------------------------------------------------
  //  HUD
  // ----------------------------------------------------------
  _buildHUD() {
    const style = (size, color='#fff') => ({
      fontFamily: 'Arial Black, Arial', fontSize: `${size}px`,
      color, stroke: '#000', strokeThickness: 3
    });

    // Score
    this._scoreTxt = this.add.text(20, 16, 'Score: 0', style(28)).setDepth(10);

    // Top 5 leaderboard (top-left below score)
    this.add.text(20, 52, '🏆 TOP 5', {
      fontFamily: 'Arial Black', fontSize: '13px',
      color: '#ffe082', stroke: '#000', strokeThickness: 3
    }).setDepth(10);
    this._lbTexts = [];
    const medals = ['🥇','🥈','🥉','4.','5.'];
    const initScores = Leaderboard.top();
    for (let i = 0; i < 5; i++) {
      const s = initScores[i] || 0;
      const col = i===0?'#ffd700':i===1?'#c0c0c0':i===2?'#cd7f32':'#ffffff';
      const t = this.add.text(20, 68 + i * 18,
        medals[i] + ' ' + (s > 0 ? s.toLocaleString() : '---'), {
        fontFamily: 'Arial', fontSize: '13px',
        color: col, stroke: '#000', strokeThickness: 3
      }).setDepth(10);
      this._lbTexts.push(t);
    }

    // Fruit counters (top-right)
    this._fruitHUD = [];
    FRUITS.forEach((f, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = W - 280 + col * 90;
      const y = 12 + row * 36;
      const icon = this.add.text(x, y, f.emoji, { fontSize: '22px' }).setDepth(10);
      const cnt  = this.add.text(x + 28, y + 2, '0', style(20)).setDepth(10);
      this._fruitHUD.push({ icon, cnt });
    });

    // Power bar (centre-top)
    const barX = W/2 - 150;
    const barY = 14;
    this._powerBg  = this.add.rectangle(W/2, barY + 10, 300, 20, 0x333333, 0.7).setOrigin(0.5, 0).setDepth(10);
    this._powerBar = this.add.rectangle(barX, barY + 10, 0, 20, 0xffd700).setOrigin(0, 0).setDepth(11);
    this._powerLbl = this.add.text(W/2, barY + 30, '', style(18, '#ffe082')).setOrigin(0.5, 0).setDepth(11);
    this._powerIcon= this.add.text(W/2, barY - 4, '', { fontSize: '28px' }).setOrigin(0.5, 0).setDepth(11);
  }

  _updateHUD() {
    this._scoreTxt.setText('Score: ' + Math.floor(this._score));
    FRUITS.forEach((f, i) => {
      this._fruitHUD[i].cnt.setText(String(this._fruitCounts[f.name]));
    });

    if (this._activePower) {
      const pct = this._powerTimer / POWER_DURATION[this._activePower];
      this._powerBar.width = 300 * pct;
      const col = POWER_COLORS[this._activePower];
      this._powerBar.fillColor = col;
      this._powerLbl.setText(this._activePower + '  ' + (this._powerTimer / 1000).toFixed(1) + 's');
      this._aura.setTint(col).setAlpha(0.55 + 0.2 * Math.sin(this.time.now / 120));
    } else {
      this._powerBar.width = 0;
      this._powerLbl.setText('');
      this._powerIcon.setText('');
      this._aura.setAlpha(0);
    }
  }

  // ----------------------------------------------------------
  //  Input
  // ----------------------------------------------------------
  _doJump() {
    if (!this._alive) return;
    if (this._activePower === 'Flight') {
      // Nudge upward in flight mode
      this._flightVelY = -350;
      return;
    }
    if (this._jumpCount < this._maxJumps) {
      PigSFX.jump();
      const vel = (this._activePower === 'Lightfoot') ? JUMP_VELOCITY_HIGH : JUMP_VELOCITY;
      this._velY = vel;
      this._jumpCount++;
      this._onGround = false;
    }
  }

  // ----------------------------------------------------------
  //  Spawning
  // ----------------------------------------------------------
  _spawnObstacle() {
    // Phase-gated obstacles:
    // Phase 1: Haystack, Bush, Boulder only
    // Phase 2: + Gate
    // Phase 3: + Tractor
    const available = OBSTACLES.filter(o => {
      if (o.name === 'Tractor') return this._phase >= 3;
      if (o.name === 'Gate')    return this._phase >= 2;
      return true;
    });
    const def = Phaser.Utils.Array.GetRandom(available);
    const x = W + def.w;
    // origin(0,1): x=left edge, y=bottom edge
    const obs = this.add.image(x, GROUND_Y, 'obs_' + def.name.toLowerCase()).setOrigin(0, 1).setDepth(3);
    const hScale = PHASE_OBS_SCALE[this._phase - 1];
    obs.setScale(obs.scaleX, hScale);
    obs._def = def;
    obs._hitW = def.w * 0.72;
    obs._hitH = def.h * 0.80 * hScale;
    this._obstacles.add(obs);
  }

  _spawnFruit() {
    const def = Phaser.Utils.Array.GetRandom(FRUITS);
    const x = W + 30;
    const minY = 160;
    const maxY = GROUND_Y - 40;
    const y = Phaser.Math.Between(minY, maxY);
    const fr = this.add.image(x, y, 'fruit_' + def.name.toLowerCase()).setDepth(3);
    fr._def = def;
    fr._baseY = y;
    fr._phase = Math.random() * Math.PI * 2;
    this._fruits.add(fr);
  }

  // ----------------------------------------------------------
  //  Power activation
  // ----------------------------------------------------------
  _activatePower(powerName) {
    // Phase 1 blocks Flight — fall back to Lightfoot
    if (powerName === 'Flight' && this._phase < 2) {
      powerName = 'Lightfoot';
    }

    // Power hierarchy: ignore if current power is stronger or equal
    if (this._activePower && this._activePower !== powerName) {
      const currentStr = POWER_STRENGTH[this._activePower] || 0;
      const newStr     = POWER_STRENGTH[powerName]         || 0;
      if (newStr > currentStr) {
        this._showFlash('POWER UPGRADED!', 0xffd700);
        this._deactivatePower();
      } else {
        return; // new power is weaker or equal — ignore
      }
    }

    this._activePower = powerName;
    PigSFX.powerup();
    this._powerTimer  = POWER_DURATION[powerName];
    this._powersUsed.add(powerName);

    // Set power icon emoji
    const emojiMap = {
      Lightfoot: '✨', Flight: '🪽', Stoneskin: '🪨',
      Speed: '💨', Spike: '🌵', Magnet: '🔮'
    };
    this._powerIcon.setText(emojiMap[powerName] || '');

    if (powerName === 'Speed') {
      this._scrollSpeed = PHASE_SPEEDS[this._phase - 1] * 1.8;
    }

    if (powerName === 'Flight') {
      // Place pig in middle zone
      this._pigY = H / 2;
      this._flightVelY = 0;
      
    }

    // Show wings for any power

  }

  _deactivatePower() {
    if (this._activePower === 'Speed') {
      this._scrollSpeed = PHASE_SPEEDS[this._phase - 1];
    }
    if (this._activePower === 'Flight') {
      // Put pig back to near ground
      if (this._pigY > GROUND_Y - 10) this._pigY = GROUND_Y;
      this._velY = 0;
      this._jumpCount = 0;
      this._pig.y = this._pigY;
      
    }
    
    this._activePower = null;
    this._powerTimer  = 0;
  }

  // ----------------------------------------------------------
  //  Phase management
  // ----------------------------------------------------------
  _updatePhase() {
    const score = this._score;
    let newPhase;
    if (score >= 1500) {
      newPhase = 3;
    } else if (score >= 500) {
      newPhase = 2;
    } else {
      newPhase = 1;
    }

    if (newPhase !== this._phase) {
      this._phase = newPhase;
      this._maxJumps = newPhase >= 2 ? 2 : 1;
      // Update fruit spawn distance for new phase
      this._nextFruitDist = PHASE_FRUIT_DIST[this._phase - 1];
      // Update scroll speed (only when no speed-overriding power is active)
      if (!this._activePower || this._activePower !== 'Speed') {
        const flightActive = this._activePower === 'Flight';
        const base = PHASE_SPEEDS[this._phase - 1];
        this._scrollSpeed = flightActive ? base * 0.85 : base;
      }
      this._showFlash('LEVEL UP!', 0x00e676);
    }
  }

  // Show a brief centred flash message
  _showFlash(msg, color) {
    const txt = this.add.text(W / 2, H / 2 - 60, msg, {
      fontFamily: 'Impact, Arial Black',
      fontSize: '64px',
      color: '#' + color.toString(16).padStart(6, '0'),
      stroke: '#000',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(20);

    this.tweens.add({
      targets: txt,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 900,
      ease: 'Sine.easeIn',
      onComplete: () => txt.destroy(),
    });
  }

  // ----------------------------------------------------------
  //  Pig physics
  // ----------------------------------------------------------
  _updatePig(dt) {
    const dtSec = dt / 1000;
    const pig = this._pig;

    if (this._activePower === 'Flight') {
      // Flappy-bird vertical in middle band
      const bandTop = H * 0.2;
      const bandBot = H * 0.75;
      this._flightVelY += GRAVITY * 0.45 * dtSec;
      this._pigY += this._flightVelY * dtSec;
      this._pigY = Phaser.Math.Clamp(this._pigY, bandTop, bandBot);
      if (this._pigY >= bandBot) this._flightVelY = 0;
      if (this._pigY <= bandTop) this._flightVelY = 0;
      pig.y = this._pigY;
      if (!pig.anims.isPlaying || pig.anims.currentAnim?.key !== 'pig_fly') { if (!pig.anims.isPlaying || pig.anims.currentAnim?.key !== 'pig_fly') { pig.play('pig_fly', true); pig.setScale(PIG_FLY_SCALE); } }
    } else {
      // Normal jump/fall
      if (!this._onGround) {
        
        this._velY += GRAVITY * dtSec;
        this._pigY += this._velY * dtSec;
      }
      if (this._pigY >= GROUND_Y) {
        const wasAirborne = !this._onGround;
        this._pigY = GROUND_Y;
        this._velY = 0;
        this._onGround = true;
        this._jumpCount = 0;
        if (wasAirborne) {
          pig.y = GROUND_Y;
          
        }
      }
      if (!this._onGround) {
        pig.y = this._pigY;
      }
      pig.play('pig_run', true); this._scalePig();
    }

    // Wings follow pig every update
    

    // Aura follows pig
    const pigW = pig.displayWidth;
    this._aura.setPosition(pig.x, pig.y - pig.displayHeight / 2);
    const auraSize = Math.max(pigW, pig.displayHeight) * 1.6;
    this._aura.setDisplaySize(auraSize, auraSize);
  }

  // ----------------------------------------------------------
  //  Collision
  // ----------------------------------------------------------
  _checkCollisions() {
    const pig = this._pig;
    const px = pig.x;
    const py = pig.y;        // bottom of pig
    const pw = pig.displayWidth  * 0.6;
    const ph = pig.displayHeight * 0.8;
    const pigLeft   = px - pw / 2;
    const pigRight  = px + pw / 2;
    const pigTop    = py - ph;
    const pigBottom = py;

    // --- Obstacles ---
    this._obstacles.getChildren().forEach(obs => {
      if (!obs.active) return;
      const ox = obs.x;
      const oy = obs.y;   // bottom
      const ow = obs._hitW;
      const oh = obs._hitH;
      const ol = ox;
      const or = ox + ow;
      const ot = oy - oh;
      const ob2 = oy;

      const hit = pigRight > ol && pigLeft < or && pigBottom > ot && pigTop < ob2;
      if (!hit) return;

      if (this._activePower === 'Stoneskin' || this._activePower === 'Spike' ||
          this._activePower === 'Speed') {
        // Smash obstacle
        this._explodeObstacle(obs);
      } else if (this._activePower === 'Flight') {
        // Immune during flight
      } else {
        // Death
        if (!this._deathTriggered) this._killPig();
      }
    });

    // --- Fruits ---
    const isMagnet = this._activePower === 'Magnet';
    this._fruits.getChildren().forEach(fr => {
      if (!fr.active) return;
      const dist = Phaser.Math.Distance.Between(px, py - ph/2, fr.x, fr.y);
      const collect = isMagnet ? (dist < this._magnetRadius) : (dist < 55);
      if (collect) {
        this._collectFruit(fr);
      }
    });
  }

  _explodeObstacle(obs) {
    this._obstacles.remove(obs, false, false);
    const cx = obs.x + obs._def.w / 2;
    const cy = obs.y - obs._def.h / 2;
    this._score += 50;

    // Debris particles
    const cols = [obs._def.color, 0xffffff, 0xaaaaaa];
    for (let i = 0; i < 18; i++) {
      const p = this.add.rectangle(
        cx + Phaser.Math.Between(-20, 20),
        cy + Phaser.Math.Between(-15, 15),
        Phaser.Math.Between(5, 14),
        Phaser.Math.Between(5, 14),
        Phaser.Utils.Array.GetRandom(cols)
      ).setDepth(8);
      const vx = Phaser.Math.Between(-180, 180);
      const vy = Phaser.Math.Between(-250, -50);
      this.tweens.add({
        targets: p,
        x: p.x + vx * 0.6,
        y: p.y + vy * 0.6 + 120,
        alpha: 0,
        angle: Phaser.Math.Between(-180, 180),
        duration: 600,
        onComplete: () => p.destroy()
      });
    }
    obs.destroy();
  }

  _collectFruit(fr) {
    // Remove from group immediately to prevent double-collection
    this._fruits.remove(fr, false, false);

    const def = fr._def;
    this._fruitCounts[def.name]++;
    PigSFX.collect();
    this._totalFruitsCollected++;
    this._score += 20;

    // Pop animation then destroy
    this.tweens.add({
      targets: fr,
      scaleX: 0, scaleY: 0, alpha: 0,
      duration: 180,
      onComplete: () => fr.destroy()
    });

    // Check super power trigger (every 5 fruits)
    if (this._totalFruitsCollected % 5 === 0) {
      // If 2 or more of the collected fruits are bananas → Flight
      if (this._fruitCounts['Banana'] >= 2) {
        this._activatePower('Flight');
      } else {
        const dominant = this._getDominantFruit();
        if (dominant) this._activatePower(dominant.power);
      }
      // Reset counts after power triggers
      FRUITS.forEach(f => { this._fruitCounts[f.name] = 0; });
    }
  }

  _getDominantFruit() {
    let best = null, bestCount = -1;
    // Only consider the last 5 collected — approximate by current max
    FRUITS.forEach(f => {
      if (this._fruitCounts[f.name] > bestCount) {
        bestCount = this._fruitCounts[f.name];
        best = f;
      }
    });
    return best;
  }

  // ----------------------------------------------------------
  //  Death
  // ----------------------------------------------------------
  _killPig() {
    this._deathTriggered = true;
    this._alive = false;
    PigSFX.crash();
    PigMusicPlayer.stop();

    // Hide wings immediately
    

    // Death tumble
    this.tweens.add({
      targets: this._pig,
      angle: 720,
      y: this._pig.y - 80,
      duration: 700,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: this._pig,
          y: this._pig.y + 150,
          alpha: 0,
          duration: 400
        });
      }
    });

    // Stars
    for (let i = 0; i < 8; i++) {
      const star = this.add.image(this._pig.x, this._pig.y - 40, 'star').setDepth(10);
      const angle = (i / 8) * Math.PI * 2;
      this.tweens.add({
        targets: star,
        x: star.x + Math.cos(angle) * 80,
        y: star.y + Math.sin(angle) * 80,
        alpha: 0,
        duration: 800,
        onComplete: () => star.destroy()
      });
    }

    // Save high score & transition
    const final = Math.floor(this._score);
    const top5 = Leaderboard.add(final);
    const prev = top5[0] || 0;
    // Refresh top-left leaderboard display
    if (this._lbTexts) {
      const medals = ["🥇","🥈","🥉","4.","5."];
      top5.forEach((s, i) => {
        if (this._lbTexts[i]) this._lbTexts[i].setText(medals[i] + " " + s.toLocaleString());
      });
    }

    this.time.delayedCall(1400, () => {
      this.scene.start('GameOver', {
        score: final,
        highScore: Math.max(final, prev),
        powersUsed: [...this._powersUsed]
      });
    });
  }

  // ----------------------------------------------------------
  //  update loop
  // ----------------------------------------------------------
  update(time, delta) {
    if (!this._alive) {
      // Scroll slows after death
      this._scrollSpeed = Math.max(0, this._scrollSpeed - 300 * (delta / 1000));
      this._scrollBg(delta);
      return;
    }

    const dt = delta;
    const dtSec = dt / 1000;

    // ---- Phase update ----
    this._updatePhase();

    // ---- Power timer ----
    if (this._activePower) {
      this._powerTimer -= dt;
      if (this._powerTimer <= 0) this._deactivatePower();
    }

    // ---- Scroll background ----
    this._scrollBg(dt);

    // ---- Pig physics ----
    this._updatePig(dt);

    // ---- Distance & score ----
    this._distance += this._scrollSpeed * dtSec;
    this._score    += this._scrollSpeed * dtSec * 0.05;

    // ---- Spawn obstacles ----
    this._distSinceLastObs += this._scrollSpeed * dtSec;
    if (this._distSinceLastObs >= this._nextObsDist) {
      this._spawnObstacle();
      this._distSinceLastObs = 0;
      this._nextObsDist = Phaser.Math.Between(350, 700);
    }

    // ---- Spawn fruits ----
    this._distSinceLastFruit += this._scrollSpeed * dtSec;
    if (this._distSinceLastFruit >= this._nextFruitDist) {
      // Phase 1: clusters of 2-3; Phase 2: 1-2; Phase 3: 1
      const count = this._phase === 1
        ? Phaser.Math.Between(2, 3)
        : this._phase === 2
          ? Phaser.Math.Between(1, 2)
          : 1;
      for (let i = 0; i < count; i++) this._spawnFruit();
      this._distSinceLastFruit = 0;
      this._nextFruitDist = PHASE_FRUIT_DIST[this._phase - 1];
    }

    // ---- Move obstacles ----
    this._obstacles.getChildren().forEach(obs => {
      obs.x -= this._scrollSpeed * dtSec;
      if (obs.x < -200) obs.destroy();
    });

    // ---- Move fruits (bob + scroll) ----
    const t = time / 1000;
    this._fruits.getChildren().forEach(fr => {
      fr.x -= this._scrollSpeed * dtSec;
      fr.y = fr._baseY + Math.sin(t * 2 + fr._phase) * 8;
      if (fr.x < -60) fr.destroy();
    });

    // ---- Magnet pull ----
    if (this._activePower === 'Magnet') {
      const px = this._pig.x;
      const py = this._pig.y - this._pig.displayHeight / 2;
      this._fruits.getChildren().forEach(fr => {
        const dist = Phaser.Math.Distance.Between(px, py, fr.x, fr.y);
        if (dist < this._magnetRadius) {
          const angle = Math.atan2(py - fr.y, px - fr.x);
          fr.x += Math.cos(angle) * 5;
          fr.y += Math.sin(angle) * 5;
        }
      });
    }

    // ---- Collisions ----
    this._checkCollisions();

    // ---- HUD ----
    this._updateHUD();

    // ---- Set scroll speed from phase (when Speed Burst is not active) ----
    if (this._activePower !== 'Speed') {
      const base = PHASE_SPEEDS[this._phase - 1];
      this._scrollSpeed = this._activePower === 'Flight' ? base * 0.85 : base;
    }
  }

  _scrollBg(dt) {
    const dtSec = dt / 1000;
    this._cloudLayer.tilePositionX += this._scrollSpeed * 0.15 * dtSec;
    this._hillLayer.tilePositionX  += this._scrollSpeed * 0.45 * dtSec;
    this._groundLayer.tilePositionX+= this._scrollSpeed * dtSec;
  }
}

// ============================================================
//  GameOverScene
// ============================================================
class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }

  init(data) {
    this._score      = data.score      || 0;
    this._highScore  = data.highScore  || 0;
    this._powersUsed = data.powersUsed || [];
  }

  create() {
    this.add.image(W/2, H/2, 'sky');
    this.add.tileSprite(W/2, H - 200, W, 160, 'hills').setOrigin(0.5, 1);
    this.add.tileSprite(W/2, H, W, 100, 'ground').setOrigin(0.5, 1);

    const panel = this.add.rectangle(W/2, H/2, 700, 440, 0x000000, 0.75).setOrigin(0.5);

    this.add.text(W/2, 160, 'GAME OVER', {
      fontFamily: 'Impact, Arial Black', fontSize: '80px',
      color: '#f44336', stroke: '#000', strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(W/2, 270, `Score: ${this._score}`, {
      fontFamily: 'Arial Black', fontSize: '42px',
      color: '#fff', stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5);

    const isNew = this._score >= this._highScore;
    const hsColor = isNew ? '#ffd700' : '#ffe082';

    // Top score
    this.add.text(W/2, 310, `🏆 Best: ${this._highScore.toLocaleString()}${isNew ? '  🆕 NEW!' : ''}`, {
      fontFamily: 'Arial Black', fontSize: '28px',
      color: hsColor, stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5);

    // Play again
    const btn = this.add.text(W/2, 470, 'PLAY AGAIN', {
      fontFamily: 'Impact, Arial Black', fontSize: '46px',
      color: '#fff', backgroundColor: '#e53935',
      padding: { x: 30, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#c62828' }));
    btn.on('pointerout',  () => btn.setStyle({ backgroundColor: '#e53935' }));
    btn.on('pointerdown', () => { PigMusicPlayer.start(); this.scene.start('Game'); });

    this.input.keyboard.once('keydown-SPACE', () => { PigMusicPlayer.start(); this.scene.start('Game'); });

    // Bounce in
    btn.setScale(0);
    this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 350, ease: 'Back.easeOut' });
  }
}



// ============================================================
//  MUSIC — Original: Mario bounce + Tetris drive
// ============================================================
const PigMusicPlayer = (() => {
  let ctx = null, playing = false, nextTime = 0, timeout = null;

  const BPM = 150;
  const q  = 60 / BPM;
  const h  = q * 2;
  const e  = q / 2;
  const de = q * 0.75;
  const s  = q / 4;

  // Original melody blending Mario bounce with Tetris stepwise motion
  const melody = [
    // Phrase 1 — Mario bounce feel, short notes
    [523.25,e],[659.25,e],[783.99,e],[1046.50,e],
    [783.99,e],[659.25,e],[523.25,q],[0,q],
    [587.33,e],[739.99,e],[880.00,e],[1108.73,e],
    [880.00,e],[739.99,e],[587.33,q],[0,q],

    // Phrase 2 — Tetris stepwise descent
    [1046.50,de],[880.00,e],[783.99,q],[659.25,q],
    [783.99,de],[659.25,e],[523.25,q],[440.00,q],
    [523.25,de],[587.33,e],[659.25,q],[783.99,q],
    [880.00,h],[659.25,h],

    // Phrase 3 — Mario bounce variation
    [659.25,e],[523.25,e],[440.00,e],[523.25,e],
    [659.25,e],[783.99,e],[880.00,q],[0,q],
    [783.99,e],[659.25,e],[587.33,e],[659.25,e],
    [783.99,e],[880.00,e],[1046.50,q],[0,q],

    // Phrase 4 — Tetris resolution
    [1046.50,de],[880.00,e],[783.99,q],[659.25,q],
    [523.25,de],[587.33,e],[659.25,q],[523.25,q],
    [440.00,q],[523.25,q],[587.33,q],[659.25,q],
    [523.25,h],[523.25,h],
  ];

  // Bass — bouncy Mario oom-pah style
  const bass = [
    [130.81,e],[261.63,e],[130.81,e],[261.63,e],
    [130.81,e],[261.63,e],[130.81,q],[0,q],
    [146.83,e],[293.66,e],[146.83,e],[293.66,e],
    [146.83,e],[293.66,e],[146.83,q],[0,q],

    [261.63,q],[196.00,q],[164.81,q],[130.81,q],
    [196.00,q],[261.63,q],[130.81,q],[164.81,q],
    [130.81,q],[146.83,q],[164.81,q],[196.00,q],
    [220.00,h],[164.81,h],

    [164.81,e],[130.81,e],[110.00,e],[130.81,e],
    [164.81,e],[196.00,e],[220.00,q],[0,q],
    [196.00,e],[164.81,e],[146.83,e],[164.81,e],
    [196.00,e],[220.00,e],[261.63,q],[0,q],

    [261.63,q],[196.00,q],[164.81,q],[130.81,q],
    [130.81,q],[146.83,q],[164.81,q],[130.81,q],
    [110.00,q],[130.81,q],[146.83,q],[164.81,q],
    [130.81,h],[130.81,h],
  ];

  // Harmony — adds Mario chord richness
  const harmony = [
    [329.63,h],[392.00,h],[349.23,h],[440.00,h],
    [523.25,h],[392.00,h],[349.23,h],[329.63,h],
    [329.63,h],[392.00,h],[349.23,h],[440.00,h],
    [523.25,h],[392.00,h],[329.63,h],[261.63,h],
  ];

  function note(freq, start, dur, gain, type) {
    if (!freq || freq === 0) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.001, start);
    g.gain.linearRampToValueAtTime(gain, start + 0.015);
    g.gain.setValueAtTime(gain, start + dur * 0.7);
    g.gain.linearRampToValueAtTime(0.001, start + dur * 0.95);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(start); osc.stop(start + dur);
  }

  function scheduleLoop() {
    if (!playing) return;
    const start = nextTime;
    let t = start, loopLen = 0;

    // Melody — square wave like old Mario/Tetris
    t = start;
    for (const [f, d] of melody) { note(f, t, d*0.85, 0.07, "square"); t += d; }
    loopLen = t - start;

    // Bass — triangle for warmth
    t = start;
    for (const [f, d] of bass) { note(f, t, d*0.6, 0.06, "triangle"); t += d; }

    // Harmony — sine for smoothness
    t = start;
    for (const [f, d] of harmony) { note(f, t, d*0.8, 0.04, "sine"); t += d; }

    nextTime = start + loopLen;
    timeout = setTimeout(scheduleLoop, (loopLen - 0.15) * 1000);
  }

  return {
    start() {
      if (playing) return;
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === "suspended") ctx.resume();
        playing = true;
        nextTime = ctx.currentTime + 0.1;
        scheduleLoop();
      } catch(e) { console.warn("Audio:", e); }
    },
    stop() {
      playing = false;
      if (timeout) clearTimeout(timeout);
      if (ctx) { try { ctx.close(); } catch(e){} ctx = null; }
    }
  };
})();

// ============================================================
//  SOUND EFFECTS
// ============================================================
const PigSFX = {
  _ctx() {
    if (!this._audioCtx) {
      try { this._audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}
    }
    if (this._audioCtx && this._audioCtx.state === 'suspended') this._audioCtx.resume();
    return this._audioCtx;
  },
  _audioCtx: null,

  jump() {
    const ctx = this._ctx(); if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.12);
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.15);
  },

  crash() {
    const ctx = this._ctx(); if (!ctx) return;
    // Noise burst
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    // Low pass for crunch
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    src.connect(filter); filter.connect(g); g.connect(ctx.destination);
    src.start(); src.stop(ctx.currentTime + 0.4);

    // Low thud
    const osc = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);
    g2.gain.setValueAtTime(0.4, ctx.currentTime);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(g2); g2.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.3);
  },

  collect() {
    const ctx = this._ctx(); if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.15);
  },

  powerup() {
    const ctx = this._ctx(); if (!ctx) return;
    const freqs = [523, 659, 784, 1047];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = f;
      const t = ctx.currentTime + i * 0.08;
      g.gain.setValueAtTime(0.1, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.12);
    });
  }
};

// ============================================================
//  LEADERBOARD — Top 5 scores
// ============================================================
const Leaderboard = {
  KEY: 'pigScores',
  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch(e) { return []; }
  },
  add(score) {
    const scores = this.get();
    scores.push(score);
    scores.sort((a,b) => b - a);
    const top5 = scores.slice(0, 5);
    localStorage.setItem(this.KEY, JSON.stringify(top5));
    return top5;
  },
  top() { return this.get().slice(0, 5); }
};

// ============================================================
//  Phaser config & launch
// ============================================================
const config = {
  type: Phaser.AUTO,
  width: W,
  height: H,
  backgroundColor: '#87ceeb',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, StartScene, GameScene, GameOverScene],
  physics: { default: 'arcade' },
};

new Phaser.Game(config);
