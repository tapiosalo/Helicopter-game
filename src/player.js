import {
  ACCELERATION, FRICTION, MAX_SPEED,
  DARK_GREEN, GREEN, ROTOR_CLR, DARK_GRAY,
} from './constants.js';

export class Player {
  constructor(worldX, worldY) {
    this.worldX     = worldX;
    this.worldY     = worldY;
    this.vx         = 0;
    this.vy         = 0;
    this.angle      = 0;        // degrees, 0 = facing up, clockwise positive
    this.rotorAngle = 0;
  }

  /**
   * @param {object} keys        - keyboard state map
   * @param {object|null} touchDir - {dx, dy} offset from screen centre, or null
   */
  update(keys, touchDir = null) {
    let ax = 0, ay = 0;
    if (touchDir !== null) {
      // Steer toward touch point; ignore if finger is within dead-zone
      const dist = Math.hypot(touchDir.dx, touchDir.dy);
      if (dist > 30) {
        ax = (touchDir.dx / dist) * ACCELERATION;
        ay = (touchDir.dy / dist) * ACCELERATION;
      }
    } else {
      if (keys['w'] || keys['ArrowUp'])    ay -= ACCELERATION;
      if (keys['s'] || keys['ArrowDown'])  ay += ACCELERATION;
      if (keys['a'] || keys['ArrowLeft'])  ax -= ACCELERATION;
      if (keys['d'] || keys['ArrowRight']) ax += ACCELERATION;
    }

    this.vx = (this.vx + ax) * FRICTION;
    this.vy = (this.vy + ay) * FRICTION;

    const speed = Math.hypot(this.vx, this.vy);
    if (speed > MAX_SPEED) {
      const s = MAX_SPEED / speed;
      this.vx *= s;
      this.vy *= s;
    }

    this.worldX += this.vx;
    this.worldY += this.vy;

    if (speed > 0.25) {
      const target = Math.atan2(this.vx, -this.vy) * 180 / Math.PI;
      let diff = ((target - this.angle + 180) % 360 + 360) % 360 - 180;
      this.angle += diff * 0.10;
    }

    this.rotorAngle = (this.rotorAngle + 16) % 360;
  }

  /** Draw helicopter centred on (sx, sy) in screen space. */
  draw(ctx, sx, sy) {
    const rad  = this.angle * Math.PI / 180;
    const rRot = this.rotorAngle * Math.PI / 180;

    // Shadow (offset +6,+6, rotated with the body)
    ctx.save();
    ctx.translate(sx + 6, sy + 6);
    ctx.rotate(rad);
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(rad);

    // Tail boom
    ctx.fillStyle = DARK_GREEN;
    ctx.fillRect(-2, 8, 4, 20);

    // Tail rotor (spins 2.5× faster)
    const trRad = this.rotorAngle * 2.5 * Math.PI / 180;
    const trLen = 8;
    ctx.strokeStyle = ROTOR_CLR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-Math.cos(trRad) * trLen,  26 - Math.sin(trRad) * trLen);
    ctx.lineTo( Math.cos(trRad) * trLen,  26 + Math.sin(trRad) * trLen);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-Math.sin(trRad) * trLen,  26 + Math.cos(trRad) * trLen);
    ctx.lineTo( Math.sin(trRad) * trLen,  26 - Math.cos(trRad) * trLen);
    ctx.stroke();

    // Fuselage — outer dark shell
    ctx.fillStyle = DARK_GREEN;
    ctx.beginPath();
    ctx.ellipse(0, -1, 7, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fuselage — inner highlight
    ctx.fillStyle = GREEN;
    ctx.beginPath();
    ctx.ellipse(-1, -4, 5, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cockpit window
    ctx.fillStyle = 'rgba(110,175,235,0.86)';
    ctx.beginPath();
    ctx.ellipse(0, -7, 5, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cockpit highlight
    ctx.fillStyle = 'rgba(200,230,255,0.71)';
    ctx.beginPath();
    ctx.ellipse(-1, -8.5, 2.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main rotor (4 blades = 2 perpendicular lines)
    ctx.strokeStyle = ROTOR_CLR;
    ctx.lineWidth = 3;
    const blade = 30;
    for (let i = 0; i < 2; i++) {
      const a = rRot + i * Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(-Math.cos(a) * blade, -Math.sin(a) * blade);
      ctx.lineTo( Math.cos(a) * blade,  Math.sin(a) * blade);
      ctx.stroke();
    }

    // Rotor hub
    ctx.fillStyle = DARK_GRAY;
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
