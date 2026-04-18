import {
  TILE_LOADING_COLOR,
  TILE_SIZE,
  ZOOM,
} from './constants.js';

export function drawMap(ctx, tiles, player) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const camX = player.worldX;
  const camY = player.worldY;
  const halfW = W / 2;
  const halfH = H / 2;

  const tx0 = Math.floor((camX - halfW) / TILE_SIZE);
  const ty0 = Math.floor((camY - halfH) / TILE_SIZE);
  const tx1 = Math.floor((camX + halfW) / TILE_SIZE) + 1;
  const ty1 = Math.floor((camY + halfH) / TILE_SIZE) + 1;

  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) {
      const img = tiles.getTile(ZOOM, tx, ty);
      const sx = Math.round(tx * TILE_SIZE - camX + halfW);
      const sy = Math.round(ty * TILE_SIZE - camY + halfH);

      if (img) {
        ctx.drawImage(img, sx, sy);
      } else {
        ctx.fillStyle = TILE_LOADING_COLOR;
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#b4b4b4';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx, sy, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}
