import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GameOverScreen } from './GameOverScreen.jsx';

const SUMMARY = {
  score: 3,
  foundPlaces: ['Helsinki', 'Baltic Sea'],
  durationPlayed: 39.6,
  timestamp: 100,
};

describe('GameOverScreen', () => {
  it('renders final score, found places, and leaderboard entries', () => {
    render(
      <GameOverScreen
        summary={SUMMARY}
        leaderboard={[
          { score: 5, timestamp: 200, nickname: 'Ace' },
          { score: 3, timestamp: 100, nickname: 'Pilot' },
        ]}
        onNewGame={() => {}}
      />,
    );

    expect(screen.getByRole('dialog', { name: /game over/i })).toBeInTheDocument();
    expect(screen.getAllByText('3')).toHaveLength(2);
    expect(screen.getByText(/Helsinki, Baltic Sea/)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Ace')).toBeInTheDocument();
  });

  it('renders an empty found-place state', () => {
    render(
      <GameOverScreen
        summary={{ ...SUMMARY, score: 0, foundPlaces: [] }}
        leaderboard={[]}
        onNewGame={() => {}}
      />,
    );

    expect(screen.getByText('No places found')).toBeInTheDocument();
    expect(screen.getByText('No scores yet')).toBeInTheDocument();
  });

  it('calls the new-game handler', async () => {
    const user = userEvent.setup();
    const onNewGame = vi.fn();

    render(
      <GameOverScreen
        summary={SUMMARY}
        leaderboard={[]}
        onNewGame={onNewGame}
      />,
    );

    await user.click(screen.getByRole('button', { name: /start new game/i }));

    expect(onNewGame).toHaveBeenCalledTimes(1);
  });

  it('asks for a nickname when the score qualifies', async () => {
    const user = userEvent.setup();
    const onSaveNickname = vi.fn();

    render(
      <GameOverScreen
        summary={SUMMARY}
        leaderboard={[]}
        qualifiesForLeaderboard
        onSaveNickname={onSaveNickname}
        onNewGame={() => {}}
      />,
    );

    await user.type(screen.getByLabelText(/nickname/i), 'Rotor');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(onSaveNickname).toHaveBeenCalledWith('Rotor');
  });

  it('does not ask for a nickname after submission', () => {
    render(
      <GameOverScreen
        summary={SUMMARY}
        leaderboard={[{ score: 3, timestamp: 100, nickname: 'Rotor' }]}
        qualifiesForLeaderboard
        nicknameSubmitted
        onNewGame={() => {}}
      />,
    );

    expect(screen.queryByLabelText(/nickname/i)).not.toBeInTheDocument();
    expect(screen.getByText('Rotor')).toBeInTheDocument();
  });
});
