import {
  TARGET_COLORS,
  WHITE,
} from './constants.js';
import { placeNameFi, placeTypeFi } from './placeLabels.js';
import { fontSize } from './renderUtils.js';

function formatPlaceType(type) {
  return type.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase();
}

export function drawHud(ctx, mission, score) {
  const W = ctx.canvas.width;
  const color = TARGET_COLORS[mission.place.type];
  const typeLabel = formatPlaceType(mission.place.type);
  const typeLabelFi = placeTypeFi(mission.place.type).toUpperCase();
  const nameFi = placeNameFi(mission.place);
  const nameEn = mission.place.name;
  const narrow = W < 600;
  const line1 = narrow
    ? `${nameFi} [${typeLabelFi}]`
    : `Etsi: ${nameFi}  [${typeLabelFi}]`;
  const line2 = narrow
    ? `${nameEn} | Score: ${score}`
    : `${nameEn}  [${typeLabel}]   |   Score: ${score}   |   WASD / Arrows`;

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
  ctx.fillStyle = WHITE;
  ctx.fillText(line2, 18, 60);
}
