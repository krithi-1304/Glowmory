import type { Memory, Settings } from '../store/types';
export const exportData = (memories: Memory[], settings: Settings) =>
  JSON.stringify(
    {
      app: 'glowmory',
      schemaVersion: 1,
      exportedAt: Date.now(),
      memories,
      settings,
    },
    null,
    2,
  );
export function parseImport(raw: string): {
  memories: Memory[];
  settings: Settings;
} {
  if (raw.length > 5_000_000)
    throw new Error('That backup is larger than 5 MB.');
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object')
    throw new Error('This backup is not a Glowmory file.');
  const data = value as {
    app?: unknown;
    memories?: unknown;
    settings?: unknown;
    schemaVersion?: unknown;
  };
  if (
    data.app !== 'glowmory' ||
    data.schemaVersion !== 1 ||
    !Array.isArray(data.memories) ||
    data.memories.length > 5000
  )
    throw new Error('This backup version is not supported.');
  const memories = data.memories
    .filter((m): m is Memory => {
      if (!m || typeof m !== 'object') return false;
      const item = m as Partial<Memory>;
      return (
        typeof item.id === 'string' &&
        typeof item.text === 'string' &&
        item.text.length <= 280 &&
        ['proud', 'loved', 'peaceful', 'silly', 'brave', 'thankful'].includes(
          item.feeling as string,
        ) &&
        ['active', 'sleeping', 'sealed'].includes(item.status as string)
      );
    })
    .map((m) => ({ ...m, text: m.text.slice(0, 280) }));
  if (memories.length !== data.memories.length)
    throw new Error('Some memories in this backup are invalid.');
  return {
    memories,
    settings: (data.settings && typeof data.settings === 'object'
      ? data.settings
      : {}) as Settings,
  };
}
