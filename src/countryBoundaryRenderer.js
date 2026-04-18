import {
  COUNTRY_BORDER_WIDTH,
  TARGET_COLORS,
  WHITE,
} from './constants.js';
import { wrappedDx } from './geo.js';

export function drawCountryBoundary(ctx, boundary, player, color = TARGET_COLORS.country) {
  if (!boundary) return;

  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const halfW = W / 2;
  const halfH = H / 2;

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(0,0,0,0.72)';
  ctx.shadowBlur = 5;
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = COUNTRY_BORDER_WIDTH + 3;
  drawBoundaryPath(ctx, boundary, player, halfW, halfH);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = color;
  ctx.lineWidth = COUNTRY_BORDER_WIDTH;
  drawBoundaryPath(ctx, boundary, player, halfW, halfH);
  ctx.stroke();
  ctx.restore();
}

function drawBoundaryPath(ctx, boundary, player, halfW, halfH) {
  ctx.beginPath();

  for (const ring of boundary) {
    if (ring.length === 0) continue;

    let started = false;
    let previousX = null;

    for (const point of ring) {
      const sx = halfW + wrappedDx(player.worldX, point.worldX);
      const sy = halfH + point.worldY - player.worldY;

      // Avoid drawing a long segment through the viewport when a ring wraps at the date line.
      if (!started || (previousX !== null && Math.abs(sx - previousX) > halfW)) {
        ctx.moveTo(sx, sy);
        started = true;
      } else {
        ctx.lineTo(sx, sy);
      }

      previousX = sx;
    }
  }
}
