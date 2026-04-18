export const FPS = 60;

export const TILE_SIZE = 256;
export const ZOOM      = 5;

export const STADIA_MAPS_API_KEY = import.meta.env?.VITE_STADIA_MAPS_API_KEY ?? '';
export const TILE_URL = 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION = '© Stadia Maps © OpenMapTiles © OpenStreetMap';
export const TILE_PROVIDER_NAME = 'Stadia Maps';
export const COUNTRY_BOUNDARIES_URL = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson';

export const START_LAT = 25.0;
export const START_LON = 10.0;

export const ACCELERATION = 0.35;
export const FRICTION     = 0.88;
export const MAX_SPEED    = 8.0;

export const WORLD_PX  = (1 << ZOOM) * TILE_SIZE;   // 8192
export const KM_PER_PX = 40075.0 / WORLD_PX;

export const REVEAL_RADIUS = {
  country: 180,
  ocean: 280,
  city: 110,
  lake: 170,
  mountainRange: 240,
  peninsula: 210,
  desert: 230,
};

export const FOUND_RADIUS = {
  country: 65,
  ocean: 110,
  city: 38,
  lake: 60,
  mountainRange: 90,
  peninsula: 80,
  desert: 85,
};

export const TARGET_COLORS = {
  country: '#ffd232',
  ocean:   '#46a0ff',
  city:    '#ff6e50',
  lake:    '#3fd2ff',
  mountainRange:'#d7d0c2',
  peninsula:'#b7e36b',
  desert:  '#e6b85c',
};

export const FOUND_COLOR        = '#50e650';
export const WHITE              = '#ffffff';
export const DARK_GREEN         = '#196e19';
export const GREEN              = '#3cbe3c';
export const ROTOR_CLR          = '#373737';
export const DARK_GRAY          = '#464646';
export const TILE_LOADING_COLOR = '#d2d2d2';
export const COUNTRY_BORDER_WIDTH = 4;
