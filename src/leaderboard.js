import {
  LEADERBOARD_KEY,
  LEADERBOARD_SIZE,
} from './constants.js';

function storageAvailable() {
  return typeof localStorage !== 'undefined';
}

function normalizeEntry(entry) {
  const score = Number(entry?.score);
  const timestamp = Number(entry?.timestamp);

  if (!Number.isFinite(score) || !Number.isFinite(timestamp)) return null;

  return {
    score,
    timestamp,
    nickname: normalizeNickname(entry?.nickname),
  };
}

function normalizeNickname(nickname) {
  const value = String(nickname ?? '').trim().replace(/\s+/g, ' ').slice(0, 16);
  return value || 'Anonymous';
}

function sortEntries(entries) {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timestamp - b.timestamp;
  });
}

export function loadLeaderboard() {
  if (!storageAvailable()) return [];

  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return sortEntries(parsed.map(normalizeEntry).filter(Boolean)).slice(0, LEADERBOARD_SIZE);
  } catch {
    return [];
  }
}

export function saveLeaderboard(entries) {
  const board = sortEntries(entries.map(normalizeEntry).filter(Boolean)).slice(0, LEADERBOARD_SIZE);

  if (storageAvailable()) {
    try {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(board));
    } catch {
      // Storage can fail in private modes or under quota pressure; keep the run playable.
    }
  }

  return board;
}

export function recordScore(entry) {
  return saveLeaderboard([...loadLeaderboard(), entry]);
}

export function qualifiesForLeaderboard(entry, leaderboard = loadLeaderboard()) {
  const candidate = normalizeEntry(entry);
  if (!candidate) return false;
  if (leaderboard.length < LEADERBOARD_SIZE) return true;

  const sortedBoard = sortEntries(leaderboard.map(normalizeEntry).filter(Boolean));
  const last = sortedBoard[LEADERBOARD_SIZE - 1];

  if (!last) return true;
  if (candidate.score !== last.score) return candidate.score > last.score;
  return candidate.timestamp < last.timestamp;
}
