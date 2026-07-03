# Helicopter

A browser-based geography game for school studies. Fly a small top-down helicopter over a real map and find the requested place before moving on to the next mission.

The game currently asks the player to find countries, oceans/seas, cities, lakes, mountain ranges, peninsulas, and deserts. Target names are shown in Finnish and English.

## Features

- Full-screen canvas game built with React and Vite.
- OpenFreeMap vector basemap rendered with MapLibre GL.
- Keyboard controls and click-to-move on desktop; touch steering on mobile.
- Random mission queue that cycles through all places before reshuffling.
- Hidden target markers that appear only when the helicopter gets close.
- Direction arrow for off-screen targets, including approximate distance.
- Country border highlighting when the current country target is revealed.
- Finnish and English place labels in the HUD, target marker, and found banner.
- Game-over summary with a persistent top-6 local leaderboard.

## Setup

Play the deployed game:

```text
https://www21212.s3.eu-north-1.amazonaws.com/index.html
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the local Vite URL, usually:

```text
http://localhost:5173
```

## Map

The game uses the OpenFreeMap `liberty` vector style through MapLibre GL:

```text
https://tiles.openfreemap.org/styles/liberty
```

No map API key is required for local development or deployed builds. MapLibre renders the map in a full-screen WebGL layer behind the game canvas.

Country borders are loaded at runtime from Natural Earth 110m country GeoJSON and drawn only for revealed country missions.

## Controls

Desktop:

```text
WASD or Arrow Keys, or click a destination on the map
```

Mobile / touch:

```text
Touch where you want the helicopter to fly.
```

## Gameplay

1. The HUD shows the current target place in Finnish and English.
2. Fly toward the target using the direction arrow and map context.
3. The target marker stays hidden until the helicopter enters the reveal radius.
4. If the target is a country, its border is highlighted once revealed.
5. Fly into the found radius to complete the mission.
6. Each find adds bonus time to the countdown: 8 seconds, then 7, then 6, then 5 seconds for every later find.
7. When time runs out, the game shows a summary, top-6 leaderboard, and Start New Game button.
8. If the result qualifies for the top 6, enter a nickname to show with the score.

## Project Structure

```text
src/
  App.jsx                    React shell and game loop wiring
  canvas.js                  Canvas resize binding
  constants.js               Tunable game values, colors, radii, map config
  countryBoundaryManager.js  Loads and indexes Natural Earth country borders
  countryBoundaryRenderer.js Draws highlighted country outlines
  effectsRenderer.js         Touch indicator, attribution, found banner
  game.js                    Main game orchestrator
  geo.js                     Lat/lon projection and world wrapping helpers
  hudRenderer.js             HUD rendering
  input.js                   Keyboard and touch event bindings
  mission.js                 Mission model and distance checks
  missionQueue.js            Randomized mission cycling
  placeLabels.js             Finnish label helpers
  places.js                  Place data with English and Finnish names
  player.js                  Helicopter physics and sprite drawing
  renderers.js               Renderer export barrel
  renderUtils.js             Shared renderer helpers
  targetRenderer.js          Target marker and direction arrow rendering
```

## Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Test

Run unit tests:

```bash
npm run test:unit
```

Run Playwright E2E tests:

```bash
npx playwright install
npm run test:e2e
```

Run the full suite:

```bash
npm test
```

## Notes

- The game stores position in world pixels at zoom level 4.
- East-west world wrapping is handled so targets across the antimeridian use the shortest path.
- Movement uses separate desktop and touch tuning: keyboard/click acceleration `0.22` with max speed `4.9` px/frame, touch acceleration `0.48` with max speed `10.8` px/frame, and shared friction `0.88`.
- Map labels come from OpenFreeMap. Finnish UI labels are game overlays, not map label translations.
- Top-6 leaderboard scores and nicknames are saved in `localStorage` for the current browser.
- Natural Earth 110m borders are lightweight and coarse, so small island countries may have limited outline detail.
