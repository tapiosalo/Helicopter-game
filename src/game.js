import {
  FIND_TIME_BONUSES_S,
  FOUND_BANNER_S,
  GAME_DURATION_S,
  MIN_FIND_TIME_BONUS_S,
  ZOOM, START_LAT, START_LON,
} from './constants.js';
import { PLACES }      from './places.js';
import { CountryBoundaryManager } from './countryBoundaryManager.js';
import { Player }      from './player.js';
import { latLonToWorld } from './geo.js';
import { MissionQueue } from './missionQueue.js';
import {
  drawDirectionArrow,
  drawCountryBoundary,
  drawFoundBanner,
  drawHud,
  drawTargetMarker,
  drawTouchIndicator,
} from './renderers.js';

export function findTimeBonusForScore(score) {
  return FIND_TIME_BONUSES_S[score - 1] ?? MIN_FIND_TIME_BONUS_S;
}

// ---------------------------------------------------------------------------
// Game
// ---------------------------------------------------------------------------
export class Game {
  constructor(ctx, options = {}) {
    this.ctx = ctx;
    this._places = options.places ?? PLACES;
    this._rng = options.rng ?? Math.random;
    this._gameDurationS = options.gameDurationS ?? GAME_DURATION_S;
    this._onGameOver = options.onGameOver ?? null;
    this.countryBoundaries = options.countryBoundaries ?? new CountryBoundaryManager();
    this.countryBoundaries.preload();
    this._initRun();
  }

  _initRun() {
    this.missions = new MissionQueue(this._places, this._rng);

    const [wx, wy] = latLonToWorld(START_LAT, START_LON, ZOOM);
    this.player = new Player(wx, wy);

    this.state = 'playing';
    this.timeLeft = this._gameDurationS;
    this.elapsedTime = 0;
    this._gameOverNotified = false;
    this.score = 0;
    this.foundPlaces = [];
    this.mission = this.missions.next();
    this._foundTimer = 0;
    this._foundPlace = null;
    this._pulse = 0;
    this._touch = null;
  }

  reset() {
    this._initRun();
  }

  update(keys, touch = null, mouse = null, dt = 1 / 60) {
    if (this.state !== 'playing') {
      this._touch = null;
      return;
    }

    this.timeLeft = Math.max(0, this.timeLeft - dt);
    this.elapsedTime += dt;
    if (this.timeLeft <= 0) {
      this._endGame();
      return;
    }

    const W = this.ctx.canvas.width;
    const H = this.ctx.canvas.height;
    const touchDir = touch
      ? { dx: touch.x - W / 2, dy: touch.y - H / 2 }
      : null;
    this._touch = touch;

    if (mouse) {
      this.player.setMoveTarget(
        this.player.worldX + mouse.x - W / 2,
        this.player.worldY + mouse.y - H / 2,
      );
    }

    this.player.update(keys, touchDir);
    this._pulse = (this._pulse + 0.06) % (2 * Math.PI);
    if (this._foundTimer > 0) this._foundTimer = Math.max(0, this._foundTimer - dt);

    if (this.mission.distanceTo(this.player.worldX, this.player.worldY) < this.mission.foundRadius) {
      this._onFound();
    }
  }

  _onFound() {
    if (this.state !== 'playing') return;
    if (this._foundTimer > 0) return;
    this.score++;
    this._foundPlace = this.mission.place;
    this.foundPlaces.push(this.mission.place.name);
    this._foundTimer = FOUND_BANNER_S;
    this.timeLeft += findTimeBonusForScore(this.score);
    this.mission     = this.missions.next();
  }

  _endGame() {
    if (this.state === 'gameover') return;

    this.state = 'gameover';
    this.timeLeft = 0;
    if (this._gameOverNotified) return;

    this._gameOverNotified = true;
    const summary = {
      score: this.score,
      foundPlaces: [...this.foundPlaces],
      durationPlayed: this.elapsedTime,
      timestamp: Date.now(),
    };

    this._onGameOver?.(summary);
  }

  draw() {
    const { ctx } = this;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this._drawCountryBoundaryIfRevealed();
    drawTargetMarker(ctx, this.mission, this.player, this._pulse);
    drawDirectionArrow(ctx, this.mission, this.player);
    this.player.draw(ctx, ctx.canvas.width / 2, ctx.canvas.height / 2);
    if (this._touch) drawTouchIndicator(ctx, this._touch);
    drawHud(ctx, this.mission, this.score, this.timeLeft);
    if (this._foundTimer > 0) drawFoundBanner(ctx, this._foundPlace);
  }

  _drawCountryBoundaryIfRevealed() {
    if (this.mission.place.type !== 'country') return;
    if (this.mission.distanceTo(this.player.worldX, this.player.worldY) > this.mission.revealRadius) return;

    const boundary = this.countryBoundaries.getBoundary(this.mission.place.name);
    drawCountryBoundary(this.ctx, boundary, this.player);
  }
}
