import { useEffect, useRef } from 'react';
import { bindCanvasResize } from './canvas.js';
import { Game } from './game.js';
import { bindKeyboardControls, bindTouchControls } from './input.js';

export default function App() {
  const canvasRef = useRef(null);
  const keysRef = useRef({});
  const touchRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const game = new Game(ctx);

    const unbindResize = bindCanvasResize(canvas);
    const unbindKeyboard = bindKeyboardControls(keysRef.current);
    const unbindTouch = bindTouchControls(canvas, touchRef);

    let animId;
    const loop = () => {
      animId = requestAnimationFrame(loop);
      game.update(keysRef.current, touchRef.current);
      game.draw();
    };
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      unbindResize();
      unbindKeyboard();
      unbindTouch();
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#111', touchAction: 'none' }}>
      <canvas ref={canvasRef} style={{ display: 'block', touchAction: 'none' }} />
    </div>
  );
}
