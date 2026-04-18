# Helicopter Game

A top-down 2D game in the browser. The camera looks straight down at the ground. A Stadia Maps OSM/OpenMapTiles raster tile layer fills the background, and a small helicopter sprite flies freely over it.

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
- **UI shell:** React 18 (single `<canvas>` element, no React state in the game loop)
- **Rendering:** HTML5 Canvas 2D API
- **Build tool:** Vite
- **Map tiles:** Stadia Maps Alidade Smooth raster tiles, based on OSM/OpenMapTiles, zoom level 5, 256×256 px each
- **Tile HTTP:** browser `Image` + browser cache (no disk cache needed)
- **Controls:** Move the helicopter toward the place where user touches the screen (touch devices) or WASD / arrow keys (desktop)

## Project Structure

```
helicopter/
├── CLAUDE.md
├── index.html           # Vite HTML entry point
├── package.json         # react, react-dom, vite, @vitejs/plugin-react
├── vite.config.js
├── src/
│   ├── main.jsx         # React root — mounts <App />
│   ├── App.jsx          # Full-viewport canvas + game loop wiring
│   ├── canvas.js        # Canvas resize binding
│   ├── constants.js     # All magic numbers, colours, radii, per-type target colors
│   ├── countryBoundaryManager.js # Loads and indexes country GeoJSON boundaries
│   ├── countryBoundaryRenderer.js # Draws revealed country outlines on canvas
│   ├── effectsRenderer.js # Touch indicator and found-banner canvas drawing
│   ├── geo.js           # Lat/lon ↔ world pixel helpers and world wrapping
│   ├── hudRenderer.js   # HUD canvas drawing
│   ├── input.js         # Keyboard and touch event binding helpers
│   ├── mapRenderer.js   # Stadia Maps tile canvas drawing
│   ├── mission.js       # Mission model and distance checks
│   ├── missionQueue.js  # Randomized mission cycling
│   ├── places.js        # Places with English `name` and Finnish `nameFi`
│   ├── placeLabels.js   # Place label helpers and Finnish type names
│   ├── game.js          # Game class — update/draw orchestration
│   ├── renderers.js     # Renderer export barrel
│   ├── renderUtils.js   # Shared renderer helpers
│   ├── targetRenderer.js # Target marker and direction arrow canvas drawing
│   ├── tileManager.js   # TileManager — async Image loading, in-memory cache
│   └── player.js        # Player — top-down helicopter sprite, physics, rotation
```

## Setup

```bash
npm install
npm run dev
```

Open the URL shown by Vite (default `http://localhost:5173`). Stadia Maps supports localhost development without an API key. For deployed builds, create a local `.env` file with `VITE_STADIA_MAPS_API_KEY=...` or configure domain authentication in Stadia Maps.

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
| Desktop | Fly        | WASD or Arrow keys         |
| Mobile  | Fly        | On-screen D-pad (▲◄►▼)     |

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
4. A "FOUND!" banner is shown for 3 seconds, then the next target is chosen.
5. All places are cycled in random order before reshuffling.

### Target types and radii (world pixels at zoom 5, ≈ 4.9 km/px at equator)

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
- Lat/lon ↔ world pixel helpers: `latLonToWorld`, `wrappedDx` in `geo.js`.
- East-west wrapping is handled by `wrappedDx` (shortest path modulo `WORLD_PX = 2^zoom × 256`).
- Default start: lat 25.0, lon 10.0 (centred on Europe/Africa for a good world overview).

## Tile loading architecture

`TileManager` (in `tileManager.js`) uses Stadia Maps raster XYZ tiles plus the browser `Image` API:
1. `getTile(z, x, y)` — returns a cached `HTMLImageElement` or `null` while loading.
2. A new `Image` is created and its `src` is set to the Stadia Maps Alidade Smooth tile URL.
3. If `VITE_STADIA_MAPS_API_KEY` is set, it is appended as `api_key`.
4. `onload` moves the image into `_tiles`; the next frame it will be drawn.
5. The browser's HTTP cache handles cache behavior according to provider response headers.

## Player physics

- 4-directional acceleration (`ACCELERATION = 0.35`) applied each frame a key is held.
- Velocity multiplied by `FRICTION = 0.88` every frame (exponential decay).
- Speed clamped to `MAX_SPEED = 8.0` px/frame.
- Sprite rotates smoothly to face the direction of travel (`angle += diff * 0.10` per frame).

## Architecture notes

- All game state lives in the `Game` class and related game modules, not in React state — avoids re-renders during the 60 fps loop.
- `App.jsx` owns the `<canvas>` and `requestAnimationFrame` loop. `input.js` updates plain refs for keyboard and touch state, which are passed into `game.update(keys, touch)` each frame.
- All tunable values (zoom, start position, physics, radii, colours) live in `constants.js` — never inline.
- Update state first, then render.
- Tile x wraps modulo `2^zoom`; out-of-range y returns `null` (placeholder drawn inline).
- Country borders are loaded from Natural Earth 110m GeoJSON at runtime and drawn only for revealed country missions.
