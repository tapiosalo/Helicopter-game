import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { bindCanvasResize } from './canvas.js';
import { MAP_STYLE_URL, ZOOM } from './constants.js';
import { GameOverScreen } from './GameOverScreen.jsx';
import { Game } from './game.js';
import {
  loadLeaderboard,
  qualifiesForLeaderboard,
  recordScore,
} from './leaderboard.js';
import { worldToLatLon } from './geo.js';
import { bindKeyboardControls, bindMouseControls, bindTouchControls } from './input.js';

function testGameDuration() {
  if (!import.meta.env.DEV) return null;

  const duration = Number(new URLSearchParams(window.location.search).get('duration'));
  return Number.isFinite(duration) && duration > 0 ? duration : null;
}

export default function App() {
  const canvasRef = useRef(null);
  const mapContainerRef = useRef(null);
  const keysRef = useRef({});
  const touchRef = useRef(null);
  const mouseRef = useRef(null);
  const gameRef = useRef(null);
  const [gameOver, setGameOver] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const mapContainer = mapContainerRef.current;
    const ctx = canvas.getContext('2d');
    const game = new Game(ctx, {
      gameDurationS: testGameDuration() ?? undefined,
      onGameOver: (summary) => {
        const leaderboard = loadLeaderboard();
        setGameOver({
          summary,
          leaderboard,
          qualifies: qualifiesForLeaderboard(summary, leaderboard),
          nicknameSubmitted: false,
        });
      },
    });
    gameRef.current = game;
    const [startLat, startLon] = worldToLatLon(game.player.worldX, game.player.worldY, ZOOM);
    const map = new maplibregl.Map({
      container: mapContainer,
      style: MAP_STYLE_URL,
      center: [startLon, startLat],
      zoom: ZOOM - 1,
      bearing: 0,
      pitch: 0,
      interactive: false,
      attributionControl: true,
    });

    const unbindResize = bindCanvasResize(canvas);
    const resizeMap = () => map.resize();
    window.addEventListener('resize', resizeMap);
    const unbindKeyboard = bindKeyboardControls(keysRef.current);
    const unbindTouch = bindTouchControls(canvas, touchRef);
    const unbindMouse = bindMouseControls(canvas, mouseRef);

    let animId;
    let lastTimestamp = null;
    const loop = (timestamp) => {
      animId = requestAnimationFrame(loop);
      const dt = lastTimestamp === null
        ? 0
        : Math.min((timestamp - lastTimestamp) / 1000, 0.1);
      lastTimestamp = timestamp;

      game.update(keysRef.current, touchRef.current, mouseRef.current, dt);
      mouseRef.current = null;
      const [lat, lon] = worldToLatLon(game.player.worldX, game.player.worldY, ZOOM);
      map.jumpTo({ center: [lon, lat], zoom: ZOOM - 1, bearing: 0, pitch: 0 });
      game.draw();
    };
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeMap);
      unbindResize();
      unbindKeyboard();
      unbindTouch();
      unbindMouse();
      map.remove();
      gameRef.current = null;
    };
  }, []);

  const startNewGame = () => {
    gameRef.current?.reset();
    setGameOver(null);
  };

  const saveNickname = (nickname) => {
    setGameOver((current) => {
      if (!current) return current;

      return {
        ...current,
        leaderboard: recordScore({ ...current.summary, nickname }),
        nicknameSubmitted: true,
      };
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#111', touchAction: 'none' }}>
      <div ref={mapContainerRef} style={{ position: 'absolute', inset: 0 }} />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'block',
          touchAction: 'none',
        }}
      />
      {gameOver && (
        <GameOverScreen
          summary={gameOver.summary}
          leaderboard={gameOver.leaderboard ?? loadLeaderboard()}
          qualifiesForLeaderboard={gameOver.qualifies}
          nicknameSubmitted={gameOver.nicknameSubmitted}
          onSaveNickname={saveNickname}
          onNewGame={startNewGame}
        />
      )}
    </div>
  );
}
