import {
  FPS,
  ZOOM, START_LAT, START_LON,
} from './constants.js';
import { PLACES }      from './places.js';
import { CountryBoundaryManager } from './countryBoundaryManager.js';
import { TileManager } from './tileManager.js';
import { Player }      from './player.js';
import { latLonToWorld } from './geo.js';
import { MissionQueue } from './missionQueue.js';
import {
  drawDirectionArrow,
  drawCountryBoundary,
  drawFoundBanner,
  drawHud,
  drawMapAttribution,
  drawMap,
  drawTargetMarker,
  drawTileProviderNotice,
  drawTouchIndicator,
} from './renderers.js';

// ---------------------------------------------------------------------------
// Game
// ---------------------------------------------------------------------------
export class Game {
  constructor(ctx) {
    this.ctx = ctx;
    this.tiles = new TileManager();
    this.countryBoundaries = new CountryBoundaryManager();
    this.countryBoundaries.preload();
    this.missions = new MissionQueue(PLACES);

    const [wx, wy] = latLonToWorld(START_LAT, START_LON, ZOOM);
    this.player = new Player(wx, wy);

    this.score = 0;
    this.mission = this.missions.next();
    this._foundTimer = 0;
    this._foundPlace = null;
    this._pulse = 0;
    this._touch = null;
  }

  update(keys, touch = null) {
    const W = this.ctx.canvas.width;
    const H = this.ctx.canvas.height;
    const touchDir = touch
      ? { dx: touch.x - W / 2, dy: touch.y - H / 2 }
      : null;
    this._touch = touch;

    this.player.update(keys, touchDir);
    this._pulse = (this._pulse + 0.06) % (2 * Math.PI);
    if (this._foundTimer > 0) this._foundTimer--;

    if (this.mission.distanceTo(this.player.worldX, this.player.worldY) < this.mission.foundRadius) {
      this._onFound();
    }
  }

  _onFound() {
    if (this._foundTimer > 0) return;
    this.score++;
    this._foundPlace = this.mission.place;
    this._foundTimer = FPS * 3;
    this.mission     = this.missions.next();
  }

  draw() {
    const { ctx } = this;
    drawMap(ctx, this.tiles, this.player);
    drawTileProviderNotice(ctx, this.tiles.status, this.tiles.errorMessage);
    this._drawCountryBoundaryIfRevealed();
    drawTargetMarker(ctx, this.mission, this.player, this._pulse);
    drawDirectionArrow(ctx, this.mission, this.player);
    this.player.draw(ctx, ctx.canvas.width / 2, ctx.canvas.height / 2);
    if (this._touch) drawTouchIndicator(ctx, this._touch);
    drawHud(ctx, this.mission, this.score);
    drawMapAttribution(ctx);
    if (this._foundTimer > 0) drawFoundBanner(ctx, this._foundPlace);
  }

  _drawCountryBoundaryIfRevealed() {
    if (this.mission.place.type !== 'country') return;
    if (this.mission.distanceTo(this.player.worldX, this.player.worldY) > this.mission.revealRadius) return;

    const boundary = this.countryBoundaries.getBoundary(this.mission.place.name);
    drawCountryBoundary(this.ctx, boundary, this.player);
  }
}
