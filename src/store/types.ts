export type FeelingId =
  'proud' | 'loved' | 'peaceful' | 'silly' | 'brave' | 'thankful';
export type MemoryStatus = 'active' | 'sleeping' | 'sealed';
export interface Memory {
  id: string;
  text: string;
  senseAnswer?: string;
  feeling: FeelingId;
  createdAt: number;
  status: MemoryStatus;
  openCount: number;
  lastOpenedAt?: number;
  look: { size: number; wing: number; hue: number; seed: number };
}
export interface Settings {
  sound: boolean;
  volume: number;
  calmMode: boolean;
  handsEnabled: boolean;
  alwaysFullRitual: boolean;
  schemaVersion: number;
}
