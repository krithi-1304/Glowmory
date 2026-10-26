import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { palette } from '../../src/scene/palette';

function luminance(hex: string) {
  const channels = [1, 3, 5].map((start) => {
    const srgb = parseInt(hex.slice(start, start + 2), 16) / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
}

describe('shared visual foundations', () => {
  it('keeps CSS and scene colors in sync', () => {
    const css = readFileSync(
      new URL('../../src/styles/tokens.css', import.meta.url),
      'utf8',
    ).toLowerCase();
    for (const [name, color] of Object.entries(palette)) {
      expect(css).toContain(`--${name}: ${color.toLowerCase()};`);
    }
  });
  it.each(['wall', 'paper'] as const)(
    'meets WCAG text contrast on %s',
    (surface) => {
      const ratio =
        (luminance(palette[surface]) + 0.05) / (luminance(palette.ink) + 0.05);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    },
  );
});
