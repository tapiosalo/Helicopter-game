import { describe, expect, it } from 'vitest';
import {
  KM_PER_PX,
  START_LAT,
  START_LON,
  TILE_SIZE,
  WORLD_PX,
  ZOOM,
} from './constants.js';
import { PLACES } from './places.js';
import { latLonToWorld, worldToLatLon, wrappedDx } from './geo.js';

describe('geo coordinates at the game zoom', () => {
  it('uses the zoom-4 world size', () => {
    expect(ZOOM).toBe(4);
    expect(WORLD_PX).toBe(4096);
    expect(WORLD_PX).toBe((1 << ZOOM) * TILE_SIZE);
    expect(KM_PER_PX).toBeCloseTo(40075 / WORLD_PX, 10);
  });

  it('projects the equator and prime meridian to the center of the world', () => {
    expect(latLonToWorld(0, 0, ZOOM)).toEqual([WORLD_PX / 2, WORLD_PX / 2]);
  });

  it('keeps the configured start position inside the world bounds', () => {
    const [x, y] = latLonToWorld(START_LAT, START_LON, ZOOM);

    expect(x).toBeGreaterThanOrEqual(0);
    expect(x).toBeLessThanOrEqual(WORLD_PX);
    expect(y).toBeGreaterThanOrEqual(0);
    expect(y).toBeLessThanOrEqual(WORLD_PX);
  });

  it('keeps every place projection inside the world bounds', () => {
    for (const place of PLACES) {
      const [x, y] = latLonToWorld(place.lat, place.lon, ZOOM);

      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(WORLD_PX);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(WORLD_PX);
    }
  });

  it('round trips representative coordinates through world pixels', () => {
    const coords = [
      [0, 0],
      [START_LAT, START_LON],
      [60.1699, 24.9384],
      [-33.8688, 151.2093],
      [40.7128, -74.0060],
    ];

    for (const [lat, lon] of coords) {
      const [x, y] = latLonToWorld(lat, lon, ZOOM);
      const [actualLat, actualLon] = worldToLatLon(x, y, ZOOM);

      expect(actualLat).toBeCloseTo(lat, 8);
      expect(actualLon).toBeCloseTo(lon, 8);
    }
  });

  it('wraps inverse-projected longitudes into the normal range', () => {
    const [, lon] = worldToLatLon(WORLD_PX + TILE_SIZE, WORLD_PX / 2, ZOOM);

    expect(lon).toBeGreaterThanOrEqual(-180);
    expect(lon).toBeLessThan(180);
    expect(lon).toBeCloseTo(-157.5, 8);
  });
});

describe('wrappedDx', () => {
  it('returns direct distance when wrapping is not shorter', () => {
    expect(wrappedDx(100, 160)).toBe(60);
    expect(wrappedDx(160, 100)).toBe(-60);
  });

  it('returns the shortest distance across the world wrap', () => {
    expect(wrappedDx(WORLD_PX - 10, 15)).toBe(25);
    expect(wrappedDx(15, WORLD_PX - 10)).toBe(-25);
  });
});
