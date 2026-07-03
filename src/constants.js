export const TILE_SIZE = 256;
export const ZOOM      = 4;

export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
export const COUNTRY_BOUNDARIES_URL = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson';

export const START_LAT = 25.0;
export const START_LON = 10.0;

export const GAME_DURATION_S = 40;
export const WARNING_S = 10;
export const FIND_TIME_BONUSES_S = [8, 7, 6];
export const MIN_FIND_TIME_BONUS_S = 5;
export const TIMER_WARNING_COLOR = '#ff3b30';
export const FOUND_BANNER_S = 1.2;
export const ARRIVAL_RADIUS = 12;
export const LEADERBOARD_SIZE = 6;
export const LEADERBOARD_KEY = 'helicopter.leaderboard';

export const DESKTOP_ACCELERATION = 0.22;
export const TOUCH_ACCELERATION = 0.48;
export const FRICTION     = 0.88;
export const DESKTOP_MAX_SPEED = 4.9;
export const TOUCH_MAX_SPEED = 10.8;

export const WORLD_PX  = (1 << ZOOM) * TILE_SIZE;
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
export const COUNTRY_BORDER_WIDTH = 4;
