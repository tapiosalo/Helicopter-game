import { describe, expect, it } from 'vitest';
import {
  ARRIVAL_RADIUS,
  DESKTOP_ACCELERATION,
  FRICTION,
  TOUCH_ACCELERATION,
  WORLD_PX,
} from './constants.js';
import { Player } from './player.js';

describe('Player mouse destination seeking', () => {
  it('accelerates toward a move target', () => {
    const player = new Player(100, 100);

    player.setMoveTarget(200, 100);
    player.update({});

    expect(player.vx).toBeGreaterThan(0);
    expect(Math.abs(player.vy)).toBeLessThan(0.001);
  });

  it('keyboard input clears and overrides a move target', () => {
    const player = new Player(100, 100);
    player.setMoveTarget(200, 100);

    player.update({ w: true });

    expect(player.moveTarget).toBeNull();
    expect(player.vy).toBeLessThan(0);
  });

  it('uses wrapped x distance when seeking a target', () => {
    const player = new Player(WORLD_PX - 10, 100);
    player.setMoveTarget(15, 100);

    player.update({});

    expect(player.vx).toBeGreaterThan(0);
  });

  it('clears the move target on arrival when nearly stopped', () => {
    const player = new Player(100, 100);
    player.setMoveTarget(100 + ARRIVAL_RADIUS / 2, 100);

    player.update({});

    expect(player.moveTarget).toBeNull();
    expect(player.vx).toBe(0);
    expect(player.vy).toBe(0);
  });

  it('uses touch steering only when no keyboard or mouse target is active', () => {
    const player = new Player(100, 100);

    player.update({}, { dx: 0, dy: 100 });
    expect(player.vy).toBeGreaterThan(0);

    const playerWithTarget = new Player(100, 100);
    playerWithTarget.setMoveTarget(200, 100);
    playerWithTarget.update({}, { dx: 0, dy: 100 });

    expect(playerWithTarget.vx).toBeGreaterThan(0);
    expect(Math.abs(playerWithTarget.vy)).toBeLessThan(0.001);
  });

  it('uses slower desktop acceleration than touch acceleration', () => {
    const keyboardPlayer = new Player(100, 100);
    keyboardPlayer.update({ d: true });

    const mousePlayer = new Player(100, 100);
    mousePlayer.setMoveTarget(200, 100);
    mousePlayer.update({});

    const touchPlayer = new Player(100, 100);
    touchPlayer.update({}, { dx: 100, dy: 0 });

    expect(keyboardPlayer.vx).toBeCloseTo(DESKTOP_ACCELERATION * FRICTION);
    expect(mousePlayer.vx).toBeCloseTo(DESKTOP_ACCELERATION * FRICTION);
    expect(touchPlayer.vx).toBeCloseTo(TOUCH_ACCELERATION * FRICTION);
    expect(touchPlayer.vx).toBeGreaterThan(keyboardPlayer.vx);
  });
});
