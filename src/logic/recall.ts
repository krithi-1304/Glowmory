import type { FeelingId, Memory } from '../store/types';
export function pickMemory(
  memories: Memory[],
  feeling: FeelingId | 'any',
  now: number,
  rng = Math.random,
  recentIds: string[] = [],
): Memory | null {
  const matches = (m: Memory) =>
    m.status === 'active' && (feeling === 'any' || m.feeling === feeling);
  const pool = memories.filter((m) => matches(m) && !recentIds.includes(m.id));
  const candidates = pool.length ? pool : memories.filter(matches);
  if (!candidates.length) return null;
  const weights = candidates.map(
    (m) =>
      1 + Math.min(30, (now - (m.lastOpenedAt ?? m.createdAt)) / 86_400_000),
  );
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let r = rng() * total;
  for (let i = 0; i < candidates.length; i += 1) {
    r -= weights[i]!;
    if (r <= 0) return candidates[i]!;
  }
  return candidates[candidates.length - 1]!;
}
