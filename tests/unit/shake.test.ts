import { describe, expect, it } from 'vitest';
import { shakeIntensity } from '../../src/logic/shake';
describe('shake intensity', () => {
  it('needs direction-changing peaks', () => {
    expect(shakeIntensity([7, -8, 9])).toBeGreaterThan(0);
    expect(shakeIntensity([1, 2, 3])).toBe(0);
  });
  it('stays normalized', () => {
    expect(shakeIntensity([40, -40, 40])).toBeLessThanOrEqual(1);
  });
});
