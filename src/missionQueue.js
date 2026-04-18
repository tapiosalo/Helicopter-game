import { Mission } from './mission.js';

export class MissionQueue {
  constructor(places, rng = Math.random) {
    this._places = places;
    this._rng = rng;
    this._pool = [];
  }

  next() {
    if (this._pool.length === 0) {
      this._pool = [...this._places].sort(() => this._rng() - 0.5);
    }
    return new Mission(this._pool.pop());
  }
}
