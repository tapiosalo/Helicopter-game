export function fontSize(width, base) {
  return `${Math.round(base * Math.min(1, width / 900))}px`;
}
