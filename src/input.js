export function bindKeyboardControls(keys) {
  const handledKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];

  const onKeyDown = (e) => {
    keys[e.key] = true;
    if (handledKeys.includes(e.key)) e.preventDefault();
  };

  const onKeyUp = (e) => {
    keys[e.key] = false;
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  return () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  };
}

export function bindTouchControls(canvas, touchRef) {
  const setTouch = (e) => {
    e.preventDefault();
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  };

  const clearTouch = (e) => {
    e.preventDefault();
    touchRef.current = null;
  };

  canvas.addEventListener('touchstart', setTouch, { passive: false });
  canvas.addEventListener('touchmove', setTouch, { passive: false });
  canvas.addEventListener('touchend', clearTouch, { passive: false });
  canvas.addEventListener('touchcancel', clearTouch, { passive: false });

  return () => {
    canvas.removeEventListener('touchstart', setTouch);
    canvas.removeEventListener('touchmove', setTouch);
    canvas.removeEventListener('touchend', clearTouch);
    canvas.removeEventListener('touchcancel', clearTouch);
  };
}
