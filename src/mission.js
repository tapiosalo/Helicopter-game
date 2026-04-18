import {
  FOUND_RADIUS,
  REVEAL_RADIUS,
  ZOOM,
} from './constants.js';
import { latLonToWorld, wrappedDx } from './geo.js';

export class Mission {
  constructor(place) {
    this.place = place;
    [this.worldX, this.worldY] = latLonToWorld(place.lat, place.lon, ZOOM);
  }

  get revealRadius() {
    return REVEAL_RADIUS[this.place.type];
  }

  get foundRadius() {
    return FOUND_RADIUS[this.place.type];
  }

  distanceTo(wx, wy) {
    return Math.hypot(wrappedDx(wx, this.worldX), this.worldY - wy);
  }
}
