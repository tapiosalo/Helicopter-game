import { beforeEach, describe, expect, it } from 'vitest';
import {
  LEADERBOARD_KEY,
  LEADERBOARD_SIZE,
} from './constants.js';
import {
  loadLeaderboard,
  qualifiesForLeaderboard,
  recordScore,
  saveLeaderboard,
} from './leaderboard.js';

beforeEach(() => {
  localStorage.clear();
});

describe('leaderboard persistence', () => {
  it('returns an empty board when storage is missing', () => {
    expect(loadLeaderboard()).toEqual([]);
  });

  it('returns an empty board for corrupt storage', () => {
    localStorage.setItem(LEADERBOARD_KEY, '{nope');

    expect(loadLeaderboard()).toEqual([]);
  });

  it('sorts by score descending', () => {
    const board = saveLeaderboard([
      { score: 1, timestamp: 30 },
      { score: 4, timestamp: 40 },
      { score: 2, timestamp: 20 },
    ]);

    expect(board.map((entry) => entry.score)).toEqual([4, 2, 1]);
  });

  it('sorts equal scores by earliest timestamp', () => {
    const board = saveLeaderboard([
      { score: 3, timestamp: 30 },
      { score: 3, timestamp: 10 },
      { score: 3, timestamp: 20 },
    ]);

    expect(board.map((entry) => entry.timestamp)).toEqual([10, 20, 30]);
  });

  it('caps the board at the configured top size', () => {
    const board = saveLeaderboard(Array.from({ length: 10 }, (_, index) => ({
      score: index,
      timestamp: index,
    })));

    expect(board).toHaveLength(LEADERBOARD_SIZE);
    expect(board.map((entry) => entry.score)).toEqual([9, 8, 7, 6, 5, 4]);
  });

  it('persists a recorded score that can be loaded back', () => {
    recordScore({ score: 5, timestamp: 100 });

    expect(loadLeaderboard()).toEqual([{ score: 5, timestamp: 100, nickname: 'Anonymous' }]);
  });

  it('ignores malformed entries', () => {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify([
      { score: 2, timestamp: 20 },
      { score: 'bad', timestamp: 10 },
    ]));

    expect(loadLeaderboard()).toEqual([{ score: 2, timestamp: 20, nickname: 'Anonymous' }]);
  });

  it('persists a trimmed nickname', () => {
    recordScore({ score: 5, timestamp: 100, nickname: '  Pilot One  ' });

    expect(loadLeaderboard()).toEqual([{ score: 5, timestamp: 100, nickname: 'Pilot One' }]);
  });

  it('detects whether a score qualifies for the top board', () => {
    saveLeaderboard(Array.from({ length: LEADERBOARD_SIZE }, (_, index) => ({
      score: LEADERBOARD_SIZE - index,
      timestamp: index,
    })));

    expect(qualifiesForLeaderboard({ score: 7, timestamp: 100 })).toBe(true);
    expect(qualifiesForLeaderboard({ score: 1, timestamp: 100 })).toBe(false);
    expect(qualifiesForLeaderboard({ score: 1, timestamp: -1 })).toBe(true);
  });
});
