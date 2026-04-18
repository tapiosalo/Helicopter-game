import {
  COUNTRY_BOUNDARIES_URL,
  ZOOM,
} from './constants.js';
import { latLonToWorld } from './geo.js';

const COUNTRY_ALIASES = {
  Bahamas: 'The Bahamas',
  'Cabo Verde': 'Cape Verde',
  Congo: 'Republic of Congo',
  'Czech Republic': 'Czechia',
  'DR Congo': 'Democratic Republic of the Congo',
  Eswatini: 'Swaziland',
  'Ivory Coast': "Côte d'Ivoire",
  Micronesia: 'Federated States of Micronesia',
  Myanmar: 'Burma',
  'North Macedonia': 'Macedonia',
  Palestine: 'Palestine',
  Russia: 'Russian Federation',
  'São Tomé and Príncipe': 'São Tomé and Principe',
  'Timor-Leste': 'East Timor',
  UAE: 'United Arab Emirates',
  'United States': 'United States of America',
};

function normalizeName(name) {
  return String(name ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/^the\s+/i, '')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase();
}

function featureNames(feature) {
  const props = feature.properties ?? {};
  return [
    props.name,
    props.NAME,
    props.name_long,
    props.NAME_LONG,
    props.admin,
    props.ADMIN,
    props.sovereignt,
    props.SOVEREIGNT,
    props.brk_name,
    props.BRK_NAME,
    props.formal_en,
    props.FORMAL_EN,
  ].filter(Boolean);
}

function projectRing(ring) {
  return ring.map(([lon, lat]) => {
    const [worldX, worldY] = latLonToWorld(lat, lon, ZOOM);
    return { worldX, worldY };
  });
}

function projectGeometry(geometry) {
  if (!geometry) return [];

  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map(projectRing);
  }

  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.flatMap((polygon) => polygon.map(projectRing));
  }

  return [];
}

export class CountryBoundaryManager {
  constructor() {
    this._boundaries = new Map();
    this._loading = false;
    this._loaded = false;
    this._error = null;
  }

  preload() {
    if (!this._loaded && !this._loading && !this._error) {
      this._load();
    }
  }

  getBoundary(placeName) {
    this.preload();

    return this._boundaries.get(normalizeName(placeName)) ?? null;
  }

  get status() {
    if (this._error) return 'error';
    if (this._loaded) return 'ready';
    return 'loading';
  }

  _load() {
    this._loading = true;

    fetch(COUNTRY_BOUNDARIES_URL)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Country boundaries failed: ${response.status}`);
        }
        return response.json();
      })
      .then((geojson) => {
        for (const feature of geojson.features ?? []) {
          const rings = projectGeometry(feature.geometry);
          if (rings.length === 0) continue;

          for (const name of featureNames(feature)) {
            this._boundaries.set(normalizeName(name), rings);
          }
        }

        for (const [placeName, boundaryName] of Object.entries(COUNTRY_ALIASES)) {
          const boundary = this._boundaries.get(normalizeName(boundaryName));
          if (boundary) this._boundaries.set(normalizeName(placeName), boundary);
        }

        this._loaded = true;
      })
      .catch((err) => {
        this._error = err;
        console.error(err);
      })
      .finally(() => {
        this._loading = false;
      });
  }
}
