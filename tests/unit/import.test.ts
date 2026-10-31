import { describe, expect, it } from 'vitest';
import { parseImport } from '../../src/storage/exportImport';
describe('backup validation', () => {
  it('preserves untagged memories and legacy feeling metadata', () => {
    const memories = [
      { id: 'new', text: 'A quiet evening', status: 'active' },
      { id: 'old', text: 'A kind moment', status: 'active', feeling: 'loved' },
    ];
    expect(parseImport(JSON.stringify({ app: 'glowmory', schemaVersion: 1, memories })).memories).toEqual(memories);
    expect(() => parseImport(JSON.stringify({ app: 'glowmory', schemaVersion: 1,
      memories: [{ ...memories[0], feeling: 'invented' }] }))).toThrow();
  });
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
