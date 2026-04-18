import { TILE_SIZE, WORLD_PX } from './constants.js';

export function latLonToWorld(lat, lon, zoom) {
  const n = 1 << zoom;
  const xTile = ((lon + 180) / 360) * n;
  const latR = (lat * Math.PI) / 180;
  const yTile = (1 - Math.log(Math.tan(latR) + 1 / Math.cos(latR)) / Math.PI) / 2 * n;
  return [xTile * TILE_SIZE, yTile * TILE_SIZE];
}

export function wrappedDx(ax, bx) {
  let dx = bx - ax;
  if (Math.abs(dx) > WORLD_PX / 2) dx -= Math.sign(dx) * WORLD_PX;
  return dx;
}
