# 🐷 Pig Can Fly

A polished, browser-based side-scrolling arcade game built with **Phaser 3**. Think Flappy Bird meets a modern mobile arcade game — with a flying pig, super powers, and Studio Ghibli-inspired visuals.

![Pig Can Fly](assets/sprites/pigrun.png)

## 🎮 How to Play

### Controls
| Action | Desktop | Mobile |
|--------|---------|--------|
| Jump | `Spacebar` or `Up Arrow` | Tap screen |
| Double Jump | Press again in mid-air | Tap again in mid-air |
| Flight nudge (during Banana power) | `Spacebar` / `Up Arrow` | Tap |

### Gameplay
- The pig runs automatically from left to right
- **Jump** over obstacles — touching any obstacle means instant death!
- **Collect fruits** floating along the path
- Every **5 fruits** collected activates a **Super Power** based on the most-collected fruit type

### Super Powers
| Fruit | Power | Effect | Duration |
|-------|-------|--------|----------|
| 🍎 Apple | Lightfoot | Higher jumps, float longer | 15s |
| 🍌 Banana | Flight | Fly freely, immune to ground obstacles | 20s |
| 🍊 Orange | Stoneskin | Smash through obstacles | 12s |
| 🍓 Strawberry | Speed Burst | Faster scrolling + invincibility | 10s |
| 🍍 Pineapple | Spike Shield | Destroy obstacles on contact | 12s |
| 🍇 Grapes | Magnet | Auto-attract nearby fruits | 15s |

## 🚀 Running Locally

### Option 1: Simple HTTP Server (Python)
```bash
cd pig-can-fly
python3 -m http.server 8000
# Open http://localhost:8000 in your browser
```

### Option 2: Node.js
```bash
npx serve .
```

### Option 3: VS Code
Install the "Live Server" extension and click "Go Live".

> **Note:** The game must be served over HTTP (not opened as a file://) due to image loading requirements.

## 📁 Project Structure
```
pig-can-fly/
├── index.html              # Entry point
├── game.js                 # Complete game code (Phaser 3)
├── README.md
└── assets/
    └── sprites/
        ├── pigrun.png          # Running state
        ├── pigmouthopen.png    # Excited/boosting state
        └── pigflymouthclose.png # Calm flight state
```

## 🎨 Visual Style
- Studio Ghibli-inspired soft cel-shading
- Warm pastel palette with clean outlines
- Parallax scrolling: sky → clouds → hills → ground
- All game assets (obstacles, fruits, backgrounds, UI) generated programmatically to match the art style

## 🔊 Audio
All audio is generated programmatically using the Web Audio API — no external audio files required:
- Background music: upbeat farm/countryside loop
- Jump, double jump, fruit collect, power activate, smash, death, and game over sound effects

## ⚙️ Technical Details
- **Framework:** Phaser 3.60
- **Resolution:** 1280×720 (16:9), scales to fit any screen
- **Target:** 60fps
- **High scores** saved to localStorage
- **Mobile-friendly** with touch controls
- **No dependencies** to install — just serve and play

## 📜 License
Pig sprite artwork created with Dola AI. All other assets generated programmatically.
