# Helicopter Game

A top-down 2D game in the browser. The camera looks straight down at the ground. An OpenFreeMap vector basemap rendered by MapLibre GL fills the background, and a transparent canvas overlay draws the helicopter, targets, HUD, and effects.

The game idea is to find places from the map. The place can be:
* country
* ocean
* city
* lake
* mountain range (himalaya, alps...)
* peninsula
* desert
When searchable place is hidden on the map by default. When the helicopter is closing the place the searchable place comes visible.

The game should decide the place what to look. The user moves the helicopter on the the place to fulfill the mission. When fulfilled, the game decides next place to search and informs the user.

## Tech Stack

- **Language:** JavaScript (ES modules)
- **UI shell:** React 18 (MapLibre container plus one transparent `<canvas>` overlay, no React state in the game loop)
- **Rendering:** MapLibre GL for the basemap; HTML5 Canvas 2D API for game overlays
- **Build tool:** Vite
- **Map provider:** OpenFreeMap `liberty` vector style, no API key
- **Map camera:** MapLibre zoom is `ZOOM - 1` because MapLibre uses 512 px tiles and the game world uses 256 px tiles
- **Controls:** Move the helicopter with WASD / arrow keys, click-to-move on desktop, or touch steering on touch devices

## Project Structure

```
helicopter/
├── CLAUDE.md
├── index.html           # Vite HTML entry point
├── package.json         # react, react-dom, maplibre-gl, vite, @vitejs/plugin-react
├── vite.config.js
├── src/
│   ├── main.jsx         # React root — mounts <App />
│   ├── App.jsx          # MapLibre basemap + full-viewport canvas + game loop wiring
│   ├── canvas.js        # Canvas resize binding
│   ├── constants.js     # All magic numbers, colours, radii, per-type target colors
│   ├── countryBoundaryManager.js # Loads and indexes country GeoJSON boundaries
│   ├── countryBoundaryRenderer.js # Draws revealed country outlines on canvas
│   ├── effectsRenderer.js # Touch indicator and found-banner canvas drawing
│   ├── geo.js           # Lat/lon ↔ world pixel helpers and world wrapping
│   ├── hudRenderer.js   # HUD canvas drawing
│   ├── input.js         # Keyboard and touch event binding helpers
│   ├── mission.js       # Mission model and distance checks
│   ├── missionQueue.js  # Randomized mission cycling
│   ├── places.js        # Places with English `name` and Finnish `nameFi`
│   ├── placeLabels.js   # Place label helpers and Finnish type names
│   ├── game.js          # Game class — update/draw orchestration
│   ├── renderers.js     # Renderer export barrel
│   ├── renderUtils.js   # Shared renderer helpers
│   ├── targetRenderer.js # Target marker and direction arrow canvas drawing
│   └── player.js        # Player — top-down helicopter sprite, physics, rotation
```

## Setup

```bash
npm install
npm run dev
```

Open the URL shown by Vite (default `http://localhost:5173`). OpenFreeMap does not require an API key for local development or deployed builds.

## Test Commands

```bash
npm run test:unit     # Vitest unit/component tests
npm run test:e2e      # Playwright browser tests
npm test              # Unit + E2E
```

Install Playwright browsers once per machine with `npx playwright install`.

## Deploy to S3

```bash
npm run build                          # produces dist/

# First-time setup
aws s3 mb s3://your-bucket-name
aws s3 website s3://your-bucket-name \
  --index-document index.html \
  --error-document index.html
aws s3api put-bucket-policy --bucket your-bucket-name --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::your-bucket-name/*"
  }]
}'

# Deploy (also used for re-deploys)
aws s3 sync dist/ s3://your-bucket-name --delete
```

Site URL: `http://your-bucket-name.s3-website-<region>.amazonaws.com`

For HTTPS + CDN, put a CloudFront distribution in front of the bucket.

## Controls

| Device  | Action     | Input                      |
|---------|------------|----------------------------|
| Desktop | Fly        | WASD / Arrow keys, or click a map destination |
| Mobile  | Fly        | Touch where the helicopter should steer |

## Responsive layout

- Canvas fills the full viewport (`window.innerWidth × innerHeight`) and updates on resize / orientation change.
- No fixed screen resolution — `game.js` reads `ctx.canvas.width/height` each frame.
- Fonts scale down proportionally on screens narrower than 900 px (`_fs()` helper in `Game`).
- HUD text is shortened on narrow screens (< 600 px) to prevent overflow.
- D-pad is shown only on touch screens (`pointer: coarse` media query); hidden on desktop.
- `viewport-fit=cover` + `env(safe-area-inset-*)` keep the D-pad clear of iPhone notches and home bars.

## Gameplay

1. The HUD shows the Finnish and English names and type of the current target place.
2. Fly toward it. The target marker and label are **hidden** until the helicopter enters the reveal radius.
3. Once inside the reveal radius the label fades in. Country targets also highlight their border at this point. Fly into the found radius to complete the mission.
4. Each found place adds bonus time to the countdown: 8 seconds, then 7, then 6, then 5 seconds for every later find.
5. A "FOUND!" banner is shown briefly, then the next target is chosen.
6. When time runs out, a React game-over overlay shows the run summary, persistent top-6 local leaderboard, and Start New Game button.
7. If the result qualifies for the top 6, the overlay asks for a nickname before saving the score.
8. All places are cycled in random order before reshuffling.

### Target types and radii (world pixels at zoom 4, ≈ 9.8 km/px at equator)

| Type    | Reveal radius | Found radius | Marker colour |
|---------|:-------------:|:------------:|---------------|
| country | 180 px        | 65 px        | yellow        |
| ocean   | 280 px        | 110 px       | blue          |
| city    | 110 px        | 38 px        | orange        |
| lake    | 170 px        | 60 px        | cyan          |
| mountain range | 240 px | 90 px        | stone         |
| peninsula| 210 px       | 80 px        | green         |
| desert  | 230 px        | 85 px        | sand          |

### Direction arrow

When the target is off-screen, a coloured triangle arrow is drawn at the screen edge pointing toward it, with the approximate distance in km below it.

## Camera & coordinate system

- Helicopter position is stored as **world pixels**: `worldX = tileX * 256`.
- Camera is always centred on the helicopter: `screenPos = tileWorldPos − cam + screenCentre`.
- Lat/lon ↔ world pixel helpers: `latLonToWorld`, `worldToLatLon`, `wrappedDx` in `geo.js`.
- East-west wrapping is handled by `wrappedDx` (shortest path modulo `WORLD_PX = 2^zoom × 256`).
- Default start: lat 25.0, lon 10.0 (centred on Europe/Africa for a good world overview).

## Map architecture

`App.jsx` mounts a non-interactive MapLibre GL map behind the canvas using the OpenFreeMap `liberty` style:
1. `Game` keeps player and mission positions in the existing 256 px tile world.
2. Each frame, `worldToLatLon(player.worldX, player.worldY, ZOOM)` converts the player position to the MapLibre camera center.
3. MapLibre is synced with `zoom: ZOOM - 1`, `bearing: 0`, and `pitch: 0`.
4. The canvas is cleared and then draws game overlays with the same world-pixel camera math.

## Player physics

- Desktop keyboard and click-to-move use `DESKTOP_ACCELERATION = 0.22` and `DESKTOP_MAX_SPEED = 4.9`.
- Touch steering uses `TOUCH_ACCELERATION = 0.48` and `TOUCH_MAX_SPEED = 10.8`.
- Velocity multiplied by `FRICTION = 0.88` every frame (exponential decay).
- Sprite rotates smoothly to face the direction of travel (`angle += diff * 0.10` per frame).

## Architecture notes

- All game state lives in the `Game` class and related game modules, not in React state — avoids re-renders during the 60 fps loop.
- `App.jsx` owns the MapLibre instance, `<canvas>`, and `requestAnimationFrame` loop. `input.js` updates plain refs for keyboard and touch state, which are passed into `game.update(keys, touch)` each frame.
- All tunable values (zoom, start position, physics, radii, colours) live in `constants.js` — never inline.
- Update state first, then render.
- Country borders are loaded from Natural Earth 110m GeoJSON at runtime and drawn only for revealed country missions.
- Top-6 leaderboard entries with nicknames are stored in browser `localStorage` via `leaderboard.js`.
- E2E tests use `?duration=1` in dev mode to exercise game-over behavior quickly; production builds ignore this test hook.
