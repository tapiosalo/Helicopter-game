import {
  FOUND_COLOR,
} from './constants.js';
import { placeNameFi } from './placeLabels.js';
import { fontSize } from './renderUtils.js';

export function drawTouchIndicator(ctx, touch) {
  const { x, y } = touch;
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawFoundBanner(ctx, foundPlace) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const textFi = `LÖYDETTY: ${placeNameFi(foundPlace)}!`;
  const textEn = `FOUND: ${foundPlace.name}!`;
  ctx.font = `bold ${fontSize(W, 34)} monospace`;
  const fiW = ctx.measureText(textFi).width;
  ctx.font = `${fontSize(W, 20)} monospace`;
  const enW = ctx.measureText(textEn).width;
  const tw = Math.max(fiW, enW);
  const bw = tw + 28;
  const bh = 74;
  const bx = W / 2 - bw / 2;
  const by = H / 2 - bh / 2;

  ctx.fillStyle = 'rgba(0,80,0,0.82)';
  ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = FOUND_COLOR;
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, by, bw, bh);

  ctx.fillStyle = FOUND_COLOR;
  ctx.font = `bold ${fontSize(W, 34)} monospace`;
  ctx.fillText(textFi, bx + 14, by + 36);
  ctx.font = `${fontSize(W, 20)} monospace`;
  ctx.fillText(textEn, bx + 14, by + 60);
}
