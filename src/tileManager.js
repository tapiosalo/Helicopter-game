import {
  STADIA_MAPS_API_KEY,
  TILE_PROVIDER_NAME,
  TILE_URL,
} from './constants.js';

export class TileManager {
  constructor() {
    this._tiles = {};
    this._loading = new Set();
    this._errors = new Set();
  }

  /**
   * Returns a loaded HTMLImageElement for the tile, or null while loading.
   * Kicks off a background fetch on first request.
   */
  getTile(z, x, y) {
    const n = 1 << z;
    x = ((x % n) + n) % n;
    if (y < 0 || y >= n) return null;

    const key = `${z}/${x}/${y}`;
    if (this._tiles[key]) return this._tiles[key];
    if (this._loading.has(key)) return null;

    this._loadTile(key, z, x, y);
    return null;
  }

  get status() {
    if (this._errors.size > 0) return 'error';
    return 'ready';
  }

  get errorMessage() {
    if (this._errors.size === 0) return null;
    return `${TILE_PROVIDER_NAME} tile request failed. Check domain auth or VITE_STADIA_MAPS_API_KEY.`;
  }

  _loadTile(key, z, x, y) {
    this._loading.add(key);
    const img = new Image();
    img.onload = () => {
      this._tiles[key] = img;
      this._loading.delete(key);
      this._errors.delete(key);
    };
    img.onerror = () => {
      this._loading.delete(key);   // will retry on next request
      this._errors.add(key);
    };

    const url = TILE_URL
      .replace('{z}', z)
      .replace('{x}', x)
      .replace('{y}', y);

    img.src = STADIA_MAPS_API_KEY
      ? `${url}?api_key=${encodeURIComponent(STADIA_MAPS_API_KEY)}`
      : url;
  }
}
