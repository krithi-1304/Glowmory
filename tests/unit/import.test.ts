import { describe, expect, it } from 'vitest';
import { parseImport } from '../../src/storage/exportImport';
describe('backup validation', () => {
  it('accepts a valid version one backup', () => {
    expect(
      parseImport(
        JSON.stringify({
          app: 'glowmory',
          schemaVersion: 1,
          memories: [],
          settings: {},
        }),
      ).memories,
    ).toEqual([]);
  });
  it('rejects wrong apps and oversized backups', () => {
    expect(() =>
      parseImport(
        JSON.stringify({
          app: 'other',
          schemaVersion: 1,
          memories: [],
          settings: {},
        }),
      ),
    ).toThrow();
    expect(() => parseImport('x'.repeat(5_000_001))).toThrow();
  });
});
