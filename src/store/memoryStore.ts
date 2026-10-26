import { create } from 'zustand';
import {
  clearSnapshot,
  defaultSettings,
  loadSnapshot,
  saveSnapshot,
} from '../storage/db';
import type { FeelingId, Memory, Settings } from './types';
import { pickMemory } from '../logic/recall';

interface MemoryState {
  memories: Memory[];
  settings: Settings;
  ready: boolean;
  recentIds: string[];
  draws: number;
  selected: Memory | null;
  hydrate: () => Promise<void>;
  add: (
    text: string,
    senseAnswer: string,
    feeling: FeelingId,
  ) => Promise<Memory>;
  update: (id: string, patch: Partial<Memory>) => Promise<void>;
  setSettings: (patch: Partial<Settings>) => Promise<void>;
  merge: (memories: Memory[], settings: Settings) => Promise<void>;
  draw: (feeling: FeelingId | 'any') => Memory | null;
  clear: () => Promise<void>;
}
const persist = async (memories: Memory[], settings: Settings) =>
  saveSnapshot({ memories, settings });
export const useMemoryStore = create<MemoryState>((set, get) => ({
  memories: [],
  settings: defaultSettings,
  ready: false,
  recentIds: [],
  draws: 0,
  selected: null,
  hydrate: async () => {
    const snapshot = await loadSnapshot();
    set({ ...snapshot, ready: true });
  },
  add: async (text, senseAnswer, feeling) => {
    const memory: Memory = {
      id: crypto.randomUUID(),
      text: text.trim().slice(0, 280),
      ...(senseAnswer.trim()
        ? { senseAnswer: senseAnswer.trim().slice(0, 140) }
        : {}),
      feeling,
      createdAt: Date.now(),
      status: 'active',
      openCount: 0,
      look: {
        size: 0.9 + Math.random() * 0.25,
        wing: Math.random(),
        hue: Math.random(),
        seed: Math.random(),
      },
    };
    const memories = [...get().memories, memory];
    set({ memories });
    await persist(memories, get().settings);
    return memory;
  },
  update: async (id, patch) => {
    const memories = get().memories.map((m) =>
      m.id === id ? { ...m, ...patch } : m,
    );
    set({ memories });
    await persist(memories, get().settings);
  },
  setSettings: async (patch) => {
    const settings = { ...get().settings, ...patch };
    set({ settings });
    await persist(get().memories, settings);
  },
  merge: async (incoming, incomingSettings) => {
    const memories = [
      ...get().memories,
      ...incoming.filter(
        (m) => !get().memories.some((existing) => existing.id === m.id),
      ),
    ];
    const settings = { ...get().settings, ...incomingSettings };
    set({ memories, settings });
    await persist(memories, settings);
  },
  draw: (feeling) => {
    const state = get();
    const memory = pickMemory(
      state.memories,
      feeling,
      Date.now(),
      Math.random,
      state.recentIds,
    );
    if (!memory) return null;
    const recentIds = [...state.recentIds, memory.id].slice(-3);
    const draws = state.draws + 1;
    set({ selected: memory, recentIds, draws });
    void state.update(memory.id, {
      openCount: memory.openCount + 1,
      lastOpenedAt: Date.now(),
    });
    return memory;
  },
  clear: async () => {
    await clearSnapshot();
    set({
      memories: [],
      settings: defaultSettings,
      selected: null,
      recentIds: [],
      draws: 0,
    });
  },
}));
