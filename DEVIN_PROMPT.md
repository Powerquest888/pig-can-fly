Build a high-quality, browser-based side-scrolling arcade game called **"Pig Can Fly"** using Phaser 3 (preferred) or HTML5 Canvas + JavaScript. The game should be polished, vibrant, and high quality — think Flappy Bird meets a modern mobile arcade game, with smooth animations and rich graphics.

---

## SCREEN & ORIENTATION

- Landscape only (16:9, ideally 1280×720, minimum 800×450)
- Parallax scrolling background: sky layer (slowest), clouds + distant hills (medium), ground (fastest)
- Ground runs along the bottom — the pig runs on it

---

## PIG (PLAYER CHARACTER)

Three custom pig sprite images are provided in the assets folder. Use them as follows:

| File | When to use |
|---|---|
| `pigrun.PNG` | Default ground running state — pig galloping, wings spread, mouth open |
| `pigmouthopen.PNG` | Flying excited state — when super power activates or pig is boosting upward |
| `pigflymouthclose.PNG` | Calm flight / banana cruise mode — pig gliding serenely, mouth closed |

- Crop or paint over the "Dola AI" watermark in the bottom-right corner of each sprite
- Scale all sprites consistently to match the pig's hitbox
- For states not covered by sprites (death, jump arc, power-up flash), use the nearest sprite with programmatic effects: rotation, colour tint, particle overlay

**Movement:**
- Pig runs automatically left to right
- Player controls jumping only
- **Double jump**: first jump = standard arc; second jump (in mid-air) = extra boost; after 2 jumps gravity pulls pig back down; must land before jumping again
- Controls: Spacebar (desktop) / screen tap or on-screen button (mobile)
- Death: pig tumbles with stars, then fade to Game Over screen

---

## OBSTACLES

- All obstacles are **stationary on the ground** — they do NOT fall, float, or spawn mid-air
- The world scrolls left, bringing obstacles into view
- Obstacle types (each needs a distinct, detailed sprite):
  - Haystack (medium height)
  - Wooden Farm Gate (tall)
  - Bush / Bramble (low and wide)
  - Tractor or Truck (large and tall)
  - Boulder (medium, round)
- Spacing varies — sometimes single obstacles, sometimes grouped clusters
- Touching any obstacle = **instant death / Game Over**, unless pig has an active super power that protects it

---

## FRUITS (COLLECTIBLES)

Fruits float at varying heights along the path. The pig collects them by running or jumping through them (pop + sparkle animation on collect).

Fruit types: 🍎 Apple · 🍊 Orange · 🍌 Banana · 🍍 Pineapple · 🍓 Strawberry · 🍇 Grapes

**Super Power Charging:**
- Every 5 fruits collected → super power activates
- The **dominant fruit** (most collected of the 5) determines which power is granted
- Ties broken by most recently collected fruit
- Fruit counter resets to 0 after power activates

---

## SUPER POWER SYSTEM

Visual on activation: glowing aura around pig + HUD icon + countdown timer bar.

| Fruit | Power Name | Effect | Duration |
|---|---|---|---|
| 🍎 Apple | **Lightfoot** | Pig jumps higher and farther, floats longer in air | 15 sec |
| 🍌 Banana | **Flight** | Pig flies freely, hovering in the middle vertical zone — immune to all ground obstacles | 20 sec |
| 🍊 Orange | **Stoneskin** | Pig smashes through obstacles — they explode into debris with particle animation | 12 sec |
| 🍓 Strawberry | **Speed Burst** | World scrolls faster, pig is invincible during burst | 10 sec |
| 🍍 Pineapple | **Spike Shield** | Pig grows visible spikes, destroys obstacles on contact | 12 sec |
| 🍇 Grapes | **Magnet** | All nearby fruits auto-attracted to pig without physical contact | 15 sec |

**Banana Flight Mode — detailed:**
- On activation, pig rises smoothly to the middle vertical band of the screen
- Pig bobs gently and glides forward — cannot die from ground obstacles
- Player controls vertical position: spacebar/tap = nudge upward, gravity slowly pulls pig down (Flappy Bird style during flight)
- Use `pigmouthopen.PNG` when boosting upward, `pigflymouthclose.PNG` when gliding level
- At 20 seconds, pig descends gently back to ground
- After landing, double jump resets normally

**Stoneskin / Pineapple obstacle break animation:**
- Obstacle explodes into chunky debris pieces that spin and arc off screen
- Dust cloud + star particle burst
- Sound: crash/shatter sfx

**Super power auras on pig:**
- Lightfoot: golden glow
- Flight: blue/white feathered wings overlay
- Stoneskin: grey rocky texture overlay
- Speed Burst: red/orange motion blur trails
- Spike Shield: green spikes around body
- Magnet: purple magnetic field lines

---

## GAME STATES

**1. Start Screen**
- "Pig Can Fly 🐷" logo
- Animated pig running in place
- High score shown
- "Tap to Start" / spacebar prompt

**2. Playing**
- HUD: Score (top left) · High Score (top right) · Active power icon + timer (top centre) · Fruit counter row with icons + counts · Super power charge bar

**3. Game Over**
- Death animation plays fully
- Final score + high score
- List of super powers used this run
- "Play Again" button

---

## VISUAL STYLE

- Match the provided pig sprites: **Studio Ghibli-inspired**, soft cel-shading, clean outlines, warm pastel palette, hand-painted quality
- All game elements (obstacles, fruits, backgrounds, UI) must match this art style — no pixel art
- Background: sky gradient, fluffy clouds, rolling green hills in mid-layer, farm dirt path with grass edges on ground layer
- Fruits: large, bright, juicy — clearly recognisable at game speed
- Obstacles: chunky, characterful farm objects with depth and shadow

---

## AUDIO

- Background music: upbeat farm/countryside arcade loop
- Jump: light bounce sfx
- Fruit collect: cheerful pop/chime
- Super power activate: short fanfare
- Obstacle smash (Stoneskin): crash/shatter
- Death: tumble + thud
- Game over: short jingle

Use royalty-free audio from freesound.org, OpenGameArt, or generate programmatically with Tone.js.

---

## TECHNICAL REQUIREMENTS

- Framework: **Phaser 3** preferred; fallback: pure HTML5 Canvas + JS
- Runs in browser, no install
- Mobile: touch controls (tap = jump; hold/tap during flight = nudge up)
- Desktop: Spacebar = jump / Up Arrow = flight nudge
- High score saved to localStorage
- Target: smooth 60fps
- Obstacle and fruit positions generated with seeded or procedural placement — not random mid-air falling
- All assets either provided (pig sprites) or sourced from free/open libraries (Kenney.nl, OpenGameArt)

---

## DELIVERABLES

- Single deployable folder: `index.html` + `/assets` subfolder
- Clean, commented code
- `README.md` with controls and how to run locally
