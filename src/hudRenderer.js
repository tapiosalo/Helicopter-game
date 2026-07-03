import {
  TARGET_COLORS,
  TIMER_WARNING_COLOR,
  WARNING_S,
  WHITE,
} from './constants.js';
import { placeNameFi, placeTypeFi } from './placeLabels.js';
import { fontSize } from './renderUtils.js';

function formatPlaceType(type) {
  return type.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase();
}

export function drawHud(ctx, mission, score, timeLeft = 0) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const color = TARGET_COLORS[mission.place.type];
  const typeLabel = formatPlaceType(mission.place.type);
  const typeLabelFi = placeTypeFi(mission.place.type).toUpperCase();
  const nameFi = placeNameFi(mission.place);
  const nameEn = mission.place.name;
  const narrow = W < 600;
  const line1 = narrow
    ? `${nameFi} [${typeLabelFi}]`
    : `Etsi: ${nameFi}  [${typeLabelFi}]`;
  const displayTime = Math.max(0, Math.ceil(timeLeft));
  const timerLabel = `Time: 0:${String(displayTime).padStart(2, '0')}`;
  const warning = timeLeft <= WARNING_S;
  const line2 = narrow
    ? `${nameEn} | Score: ${score} | ${timerLabel}`
    : `${nameEn}  [${typeLabel}]   |   Score: ${score}   |   ${timerLabel}   |   WASD / Arrows`;

  ctx.font = `bold ${fontSize(W, 22)} monospace`;
  const w1 = ctx.measureText(line1).width;
  ctx.font = `${fontSize(W, 18)} monospace`;
  const w2 = ctx.measureText(line2).width;
  const w = Math.max(w1, w2);

  ctx.fillStyle = 'rgba(0,0,0,0.67)';
  ctx.fillRect(8, 8, w + 20, 68);

  ctx.font = `bold ${fontSize(W, 22)} monospace`;
  ctx.fillStyle = color;
  ctx.fillText(line1, 18, 36);

  ctx.font = `${fontSize(W, 18)} monospace`;
  ctx.fillStyle = warning ? TIMER_WARNING_COLOR : WHITE;
  ctx.fillText(line2, 18, 60);

  if (warning) {
    const warningText = 'AIKA LOPPUMASSA! / TIME RUNNING OUT';
    ctx.font = `bold ${fontSize(W, 24)} monospace`;
    const warningWidth = ctx.measureText(warningText).width;
    const x = W / 2 - warningWidth / 2;
    const y = Math.max(110, H * 0.16);

    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(x - 10, y - 28, warningWidth + 20, 38);
    ctx.fillStyle = TIMER_WARNING_COLOR;
    ctx.fillText(warningText, x, y);
  }
}
