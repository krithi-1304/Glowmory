import { get, set, del } from 'idb-keyval';
import type { Memory, Settings } from '../store/types';

const KEY = 'glowmory-v1';
export interface Snapshot {
  memories: Memory[];
  settings: Settings;
}
const defaults: Settings = {
  sound: true,
  volume: 0.3,
  calmMode:
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  handsEnabled: false,
  alwaysFullRitual: false,
  schemaVersion: 1,
};
export const defaultSettings = defaults;
export async function loadSnapshot(): Promise<Snapshot> {
  try {
    const value = await get<Snapshot>(KEY);
    if (value?.memories && value.settings) return value;
  } catch {
    /* fallback below */
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Snapshot;
  } catch {
    /* corrupt data is treated as empty, never thrown */
  }
  return { memories: [], settings: defaults };
}
export async function saveSnapshot(snapshot: Snapshot): Promise<void> {
  try {
    await set(KEY, snapshot);
  } catch {
    try {
      localStorage.setItem(KEY, JSON.stringify(snapshot));
    } catch {
      /* storage errors are surfaced by the UI on the next save */
    }
  }
}
export async function clearSnapshot(): Promise<void> {
  try {
    await del(KEY);
  } catch {
    /* fallback */
  }
  localStorage.removeItem(KEY);
}
