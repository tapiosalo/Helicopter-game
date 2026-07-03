import { placeNameFi } from './placeLabels.js';
import { useState } from 'react';

function formatDuration(seconds) {
  return `${Math.round(seconds)}s`;
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function GameOverScreen({
  summary,
  leaderboard,
  qualifiesForLeaderboard = false,
  nicknameSubmitted = false,
  onSaveNickname = () => {},
  onNewGame,
}) {
  const [nickname, setNickname] = useState('');
  const showNicknameForm = qualifiesForLeaderboard && !nicknameSubmitted;

  const submitNickname = (event) => {
    event.preventDefault();
    onSaveNickname(nickname);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        display: 'grid',
        placeItems: 'center',
        padding: 'max(18px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(18px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left))',
        background: 'rgba(0,0,0,0.58)',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <section
        style={{
          width: 'min(520px, 100%)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: 8,
          background: 'rgba(17,24,19,0.94)',
          padding: 24,
          boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
        }}
      >
        <h1 id="game-over-title" style={{ margin: '0 0 12px', fontSize: 32, lineHeight: 1.1 }}>
          Game Over
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.68)' }}>Score</div>
            <div style={{ fontSize: 30, fontWeight: 700 }}>{summary.score}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.68)' }}>Time Played</div>
            <div style={{ fontSize: 30, fontWeight: 700 }}>{formatDuration(summary.durationPlayed)}</div>
          </div>
        </div>

        <h2 style={{ margin: '0 0 8px', fontSize: 16 }}>Found Places</h2>
        <p style={{ minHeight: 24, margin: '0 0 18px', color: 'rgba(255,255,255,0.82)' }}>
          {summary.foundPlaces.length > 0
            ? summary.foundPlaces.map((place) => (
              typeof place === 'string' ? place : placeNameFi(place)
            )).join(', ')
            : 'No places found'}
        </p>

        <h2 style={{ margin: '0 0 8px', fontSize: 16 }}>Top 6</h2>
        {showNicknameForm && (
          <form onSubmit={submitNickname} style={{ margin: '0 0 18px' }}>
            <label htmlFor="nickname" style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>
              New top 6 score - enter nickname
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                id="nickname"
                name="nickname"
                type="text"
                maxLength={16}
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                autoFocus
                style={{
                  flex: 1,
                  minWidth: 0,
                  minHeight: 42,
                  border: '1px solid rgba(255,255,255,0.26)',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  padding: '0 12px',
                  fontSize: 16,
                }}
              />
              <button
                type="submit"
                style={{
                  minHeight: 42,
                  border: 0,
                  borderRadius: 8,
                  background: '#50e650',
                  color: '#062106',
                  padding: '0 14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            </div>
          </form>
        )}
        <ol style={{ margin: '0 0 20px', paddingLeft: 24 }}>
          {leaderboard.length > 0 ? leaderboard.map((entry, index) => (
            <li key={`${entry.timestamp}-${index}`} style={{ marginBottom: 6 }}>
              {entry.nickname && (
                <span style={{ fontWeight: 700 }}>{entry.nickname}</span>
              )}
              {entry.nickname && <span style={{ color: 'rgba(255,255,255,0.68)' }}> · </span>}
              <span style={{ fontWeight: 700 }}>{entry.score}</span>
              <span style={{ color: 'rgba(255,255,255,0.68)' }}> · {formatDate(entry.timestamp)}</span>
            </li>
          )) : (
            <li style={{ color: 'rgba(255,255,255,0.68)' }}>No scores yet</li>
          )}
        </ol>

        <button
          type="button"
          onClick={onNewGame}
          style={{
            width: '100%',
            minHeight: 46,
            border: 0,
            borderRadius: 8,
            background: '#50e650',
            color: '#062106',
            fontSize: 17,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Start New Game
        </button>
      </section>
    </div>
  );
}
