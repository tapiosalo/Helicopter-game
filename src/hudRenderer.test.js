import { describe, expect, it, vi } from 'vitest';
import { TIMER_WARNING_COLOR } from './constants.js';
import { drawHud } from './hudRenderer.js';

const MISSION = {
  place: {
    name: 'Helsinki',
    nameFi: 'Helsinki',
    type: 'city',
  },
};

function createCtx() {
  const calls = [];
  return {
    canvas: { width: 900, height: 600 },
    fillStyle: '',
    font: '',
    measureText: vi.fn((text) => ({ width: String(text).length * 10 })),
    fillRect: vi.fn(),
    fillText: vi.fn(function fillText(text, x, y) {
      calls.push({ text, x, y, fillStyle: this.fillStyle, font: this.font });
    }),
    calls,
  };
}

describe('drawHud timer', () => {
  it('draws the countdown timer', () => {
    const ctx = createCtx();

    drawHud(ctx, MISSION, 3, 27.2);

    expect(ctx.calls.some((call) => call.text.includes('Time: 0:28'))).toBe(true);
  });

  it('uses warning color and text during the final warning window', () => {
    const ctx = createCtx();

    drawHud(ctx, MISSION, 3, 9.5);

    expect(ctx.calls.some((call) => (
      call.text.includes('Time: 0:10') && call.fillStyle === TIMER_WARNING_COLOR
    ))).toBe(true);
    expect(ctx.calls.some((call) => call.text.includes('TIME RUNNING OUT'))).toBe(true);
  });
});
