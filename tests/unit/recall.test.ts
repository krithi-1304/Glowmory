import { describe, expect, it } from 'vitest';
import { pickMemory } from '../../src/logic/recall';
import type { Memory } from '../../src/store/types';

const memory = (
  id: string,
  status: Memory['status'] = 'active',
  feeling: Memory['feeling'] = 'proud',
): Memory => ({
  id,
  text: id,
  feeling,
  status,
  createdAt: 0,
  openCount: 0,
  look: { size: 1, wing: 0, hue: 0, seed: 0 },
});
describe('pickMemory', () => {
  it('filters by feeling and excludes sleeping memories', () => {
    expect(
      pickMemory(
        [memory('a', 'sleeping'), memory('b', 'active', 'loved')],
        'loved',
        1,
        () => 0,
      ),
    ).toMatchObject({ id: 'b' });
  });
  it('avoids recent ids and falls back when every match is recent', () => {
    expect(
      pickMemory([memory('a'), memory('b')], 'any', 1, () => 0, ['a']),
    ).toMatchObject({ id: 'b' });
    expect(pickMemory([memory('a')], 'any', 1, () => 0, ['a'])).toMatchObject({
      id: 'a',
    });
  });
  it('returns null for an empty feeling', () => {
    expect(pickMemory([memory('a')], 'thankful', 1)).toBeNull();
  });
});
