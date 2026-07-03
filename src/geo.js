import { TILE_SIZE, WORLD_PX } from './constants.js';

export function latLonToWorld(lat, lon, zoom) {
  const n = 1 << zoom;
  const xTile = ((lon + 180) / 360) * n;
  const latR = (lat * Math.PI) / 180;
  const yTile = (1 - Math.log(Math.tan(latR) + 1 / Math.cos(latR)) / Math.PI) / 2 * n;
  return [xTile * TILE_SIZE, yTile * TILE_SIZE];
}

export function worldToLatLon(worldX, worldY, zoom) {
  const n = 1 << zoom;
  const xTile = worldX / TILE_SIZE;
  const yTile = worldY / TILE_SIZE;
  const rawLon = (xTile / n) * 360 - 180;
  const lon = ((rawLon + 180) % 360 + 360) % 360 - 180;
  const latR = Math.atan(Math.sinh(Math.PI * (1 - (2 * yTile) / n)));
  const lat = (latR * 180) / Math.PI;
  return [lat, lon];
}

export function wrappedDx(ax, bx) {
  let dx = bx - ax;
  if (Math.abs(dx) > WORLD_PX / 2) dx -= Math.sign(dx) * WORLD_PX;
  return dx;
}
