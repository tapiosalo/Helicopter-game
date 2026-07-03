import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindMouseControls } from './input.js';

function createCanvas() {
  const listeners = new Map();
  return {
    addEventListener: vi.fn((type, listener) => {
      listeners.set(type, listener);
    }),
    removeEventListener: vi.fn((type, listener) => {
      if (listeners.get(type) === listener) listeners.delete(type);
    }),
    dispatch(type, event) {
      listeners.get(type)?.(event);
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('bindMouseControls', () => {
  it('records mouse coordinates on desktop pointers', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn(() => ({ matches: false })),
    });
    const canvas = createCanvas();
    const mouseRef = { current: null };

    const unbind = bindMouseControls(canvas, mouseRef);
    canvas.dispatch('mousedown', { clientX: 120, clientY: 80 });

    expect(mouseRef.current).toEqual({ x: 120, y: 80 });

    unbind();
    expect(canvas.removeEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });

  it('does not bind mouse controls on coarse pointers', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn(() => ({ matches: true })),
    });
    const canvas = createCanvas();

    const unbind = bindMouseControls(canvas, { current: null });
    unbind();

    expect(canvas.addEventListener).not.toHaveBeenCalled();
    expect(canvas.removeEventListener).not.toHaveBeenCalled();
  });
});
