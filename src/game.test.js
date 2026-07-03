import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GAME_DURATION_S,
  LEADERBOARD_KEY,
  START_LAT,
  START_LON,
  ZOOM,
} from './constants.js';
import { findTimeBonusForScore, Game } from './game.js';
import { latLonToWorld } from './geo.js';

const FAR_PLACE = {
  name: 'Far City',
  nameFi: 'Kaukakaupunki',
  type: 'city',
  lat: 0,
  lon: 0,
};

const START_PLACE = {
  name: 'Start City',
  nameFi: 'Alkukaupunki',
  type: 'city',
  lat: START_LAT,
  lon: START_LON,
};

function createCtx() {
  return {
    canvas: { width: 800, height: 600 },
    clearRect: vi.fn(),
  };
}

function createGame(options = {}) {
  const { places = [FAR_PLACE], ...rest } = options;

  return new Game(createCtx(), {
    places,
    rng: () => 0,
    countryBoundaries: {
      preload: vi.fn(),
      getBoundary: vi.fn(() => null),
    },
    ...rest,
  });
}

beforeEach(() => {
  localStorage.clear();
});

describe('Game time attack state', () => {
  it('starts a run in playing state with the full countdown', () => {
    const game = createGame();

    expect(game.state).toBe('playing');
    expect(game.timeLeft).toBe(GAME_DURATION_S);
    expect(game.elapsedTime).toBe(0);
    expect(game.score).toBe(0);
  });

  it('decrements time by elapsed seconds', () => {
    const game = createGame();

    game.update({}, null, null, 1.25);

    expect(game.timeLeft).toBeCloseTo(GAME_DURATION_S - 1.25);
    expect(game.elapsedTime).toBeCloseTo(1.25);
  });

  it('transitions to gameover when the countdown reaches zero', () => {
    const onGameOver = vi.fn();
    const game = createGame({ onGameOver });

    game.update({}, null, null, GAME_DURATION_S);

    expect(game.state).toBe('gameover');
    expect(game.timeLeft).toBe(0);
    expect(onGameOver).toHaveBeenCalledTimes(1);
  });

  it('does not update player movement after game over', () => {
    const game = createGame();

    game.update({}, null, null, GAME_DURATION_S);
    const { worldX, worldY } = game.player;

    game.update({ w: true }, null, null, 1);

    expect(game.player.worldX).toBe(worldX);
    expect(game.player.worldY).toBe(worldY);
  });

  it('uses a decreasing find time bonus schedule', () => {
    expect(findTimeBonusForScore(1)).toBe(8);
    expect(findTimeBonusForScore(2)).toBe(7);
    expect(findTimeBonusForScore(3)).toBe(6);
    expect(findTimeBonusForScore(4)).toBe(5);
    expect(findTimeBonusForScore(10)).toBe(5);
  });

  it('counts a found mission and adds the first find time bonus', () => {
    const game = createGame({ places: [START_PLACE] });

    game._onFound();

    expect(game.score).toBe(1);
    expect(game.foundPlaces).toEqual([START_PLACE.name]);
    expect(game.timeLeft).toBe(GAME_DURATION_S + 8);
  });

  it('adds 8, then 7, then 6, then 5 seconds for later finds', () => {
    const game = createGame({ places: [START_PLACE] });

    game._onFound();
    game._foundTimer = 0;
    game._onFound();
    game._foundTimer = 0;
    game._onFound();
    game._foundTimer = 0;
    game._onFound();

    expect(game.score).toBe(4);
    expect(game.timeLeft).toBe(GAME_DURATION_S + 8 + 7 + 6 + 5);
  });

  it('counts a find near the buzzer and keeps playing with bonus time', () => {
    const onGameOver = vi.fn();
    const game = createGame({ places: [START_PLACE], onGameOver });
    const [worldX, worldY] = latLonToWorld(START_PLACE.lat, START_PLACE.lon, ZOOM);
    game.player.worldX = worldX;
    game.player.worldY = worldY;
    game.timeLeft = 1;

    game.update({}, null, null, 0.1);

    expect(game.score).toBe(1);
    expect(game.state).toBe('playing');
    expect(game.timeLeft).toBeCloseTo(8.9);
    expect(onGameOver).not.toHaveBeenCalled();
  });

  it('notifies game over only once', () => {
    const onGameOver = vi.fn();
    const game = createGame({ onGameOver });

    game.update({}, null, null, GAME_DURATION_S);
    game.update({}, null, null, GAME_DURATION_S);
    game._endGame();

    expect(onGameOver).toHaveBeenCalledTimes(1);
  });

  it('passes a complete summary to the game-over callback', () => {
    const onGameOver = vi.fn();
    const game = createGame({ places: [START_PLACE], onGameOver });
    game._onFound();

    game.update({}, null, null, game.timeLeft);

    expect(onGameOver).toHaveBeenCalledWith(expect.objectContaining({
      score: 1,
      foundPlaces: [START_PLACE.name],
      durationPlayed: expect.any(Number),
      timestamp: expect.any(Number),
    }));
    expect(onGameOver.mock.calls[0][0].durationPlayed).toBeCloseTo(GAME_DURATION_S + 8);
  });

  it('does not record the final score before notifying game over', () => {
    const onGameOver = vi.fn();
    const game = createGame({ places: [START_PLACE], onGameOver });
    game._onFound();

    game.update({}, null, null, game.timeLeft);

    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(LEADERBOARD_KEY)).toBeNull();
  });

  it('reset restores a fresh playing run', () => {
    const game = createGame({ places: [START_PLACE] });
    game._onFound();
    game.update({}, null, null, GAME_DURATION_S);

    game.reset();

    expect(game.state).toBe('playing');
    expect(game.timeLeft).toBe(GAME_DURATION_S);
    expect(game.elapsedTime).toBe(0);
    expect(game.score).toBe(0);
    expect(game.foundPlaces).toEqual([]);
    expect(game.mission.place.name).toBe(START_PLACE.name);
  });

  it('converts a mouse click into a player move target', () => {
    const game = createGame();
    const startX = game.player.worldX;
    const startY = game.player.worldY;

    game.update({}, null, { x: 500, y: 250 }, 0);

    expect(game.player.moveTarget).toEqual({
      worldX: startX + 100,
      worldY: startY - 50,
    });
  });
});
