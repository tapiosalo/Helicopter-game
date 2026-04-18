import {
  KM_PER_PX,
  TARGET_COLORS,
  WHITE,
} from './constants.js';
import { wrappedDx } from './geo.js';
import { placeNameFi } from './placeLabels.js';
import { fontSize } from './renderUtils.js';

export function drawTargetMarker(ctx, mission, player, pulse) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const dist = mission.distanceTo(player.worldX, player.worldY);
  if (dist > mission.revealRadius) return;

  const alpha = 1 - dist / mission.revealRadius;
  const color = TARGET_COLORS[mission.place.type];
  const dx = wrappedDx(player.worldX, mission.worldX);
  const dy = mission.worldY - player.worldY;
  const sx = W / 2 + dx;
  const sy = H / 2 + dy;

  ctx.save();
  ctx.globalAlpha = alpha;

  const pulseR = 18 + 6 * Math.sin(pulse);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(sx, sy, pulseR, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(sx, sy - 9);
  ctx.lineTo(sx, sy + 9);
  ctx.moveTo(sx - 9, sy);
  ctx.lineTo(sx + 9, sy);
  ctx.stroke();

  const labelFi = placeNameFi(mission.place);
  const labelEn = mission.place.name;
  ctx.font = `bold ${fontSize(W, 22)} monospace`;
  const fiW = ctx.measureText(labelFi).width;
  ctx.font = `${fontSize(W, 16)} monospace`;
  const enW = ctx.measureText(labelEn).width;
  const labelW = Math.max(fiW, enW);
  const lx = sx - labelW / 2;
  const ly = sy + 26;
  ctx.globalAlpha = alpha * 0.63;
  ctx.fillStyle = '#000';
  ctx.fillRect(lx - 5, ly - 3, labelW + 10, 44);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize(W, 22)} monospace`;
  ctx.fillText(labelFi, sx - fiW / 2, ly + 18);
  ctx.font = `${fontSize(W, 16)} monospace`;
  ctx.fillText(labelEn, sx - enW / 2, ly + 38);

  ctx.restore();
}

export function drawDirectionArrow(ctx, mission, player) {
  const dx = wrappedDx(player.worldX, mission.worldX);
  const dy = mission.worldY - player.worldY;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return;

  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const halfW = W / 2;
  const halfH = H / 2;
  const sx = halfW + dx;
  const sy = halfH + dy;

  const margin = 50;
  if (sx > margin && sx < W - margin && sy > margin && sy < H - margin) return;

  const ndx = dx / dist;
  const ndy = dy / dist;
  const edge = 28;
  const t = Math.min(
    ndx !== 0 ? (halfW - edge) / Math.abs(ndx) : Infinity,
    ndy !== 0 ? (halfH - edge) / Math.abs(ndy) : Infinity,
  );
  const ax = halfW + ndx * t;
  const ay = halfH + ndy * t;

  const perpX = -ndy;
  const perpY = ndx;
  const baseX = ax - ndx * 14;
  const baseY = ay - ndy * 14;
  const color = TARGET_COLORS[mission.place.type];

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(baseX + perpX * 8, baseY + perpY * 8);
  ctx.lineTo(baseX - perpX * 8, baseY - perpY * 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 1;
  ctx.stroke();

  const kmText = `${Math.round(dist * KM_PER_PX).toLocaleString()} km`;
  ctx.font = `${fontSize(W, 18)} monospace`;
  const kmW = ctx.measureText(kmText).width;
  const kmX = ax - kmW / 2;
  const kmY = ay + 16;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(kmX - 3, kmY - 2, kmW + 6, 22);
  ctx.fillStyle = color;
  ctx.fillText(kmText, kmX, kmY + 16);
}
