# Helicopter

A browser-based geography game for school studies. Fly a small top-down helicopter over a real map and find the requested place before moving on to the next mission.

The game currently asks the player to find countries, oceans/seas, cities, lakes, mountain ranges, peninsulas, and deserts. Target names are shown in Finnish and English.

## Features

- Full-screen canvas game built with React and Vite.
- Real raster map tiles from Stadia Maps, based on OSM/OpenMapTiles.
- Keyboard controls on desktop and touch steering on mobile.
- Random mission queue that cycles through all places before reshuffling.
- Hidden target markers that appear only when the helicopter gets close.
- Direction arrow for off-screen targets, including approximate distance.
- Country border highlighting when the current country target is revealed.
- Finnish and English place labels in the HUD, target marker, and found banner.

## Setup

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

## Map Tiles

The game uses Stadia Maps raster XYZ tiles:

```text
https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png
```

Localhost development can work without an API key. For deployed builds, create a `.env` file:

```bash
VITE_STADIA_MAPS_API_KEY=your-stadia-maps-api-key
```

You can also configure domain authentication in Stadia Maps instead of using a key in the URL.

Country borders are loaded at runtime from Natural Earth 110m country GeoJSON and drawn only for revealed country missions.

## Controls

Desktop:

```text
WASD or Arrow Keys
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
6. A bilingual found banner appears, then the next mission starts.

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
  mapRenderer.js             Raster tile rendering
  mission.js                 Mission model and distance checks
  missionQueue.js            Randomized mission cycling
  placeLabels.js             Finnish label helpers
  places.js                  Place data with English and Finnish names
  player.js                  Helicopter physics and sprite drawing
  renderers.js               Renderer export barrel
  renderUtils.js             Shared renderer helpers
  targetRenderer.js          Target marker and direction arrow rendering
  tileManager.js             Raster tile loading and caching
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

## Notes

- The game stores position in world pixels at zoom level 5.
- East-west world wrapping is handled so targets across the antimeridian use the shortest path.
- Map labels are baked into raster tiles. Finnish UI labels are game overlays, not map tile label translations.
- Natural Earth 110m borders are lightweight and coarse, so small island countries may have limited outline detail.
