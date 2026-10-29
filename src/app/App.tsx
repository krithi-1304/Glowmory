import { useEffect, useRef, useState } from 'react';
import { strings } from '../strings';
import { Room } from '../scene/Room';
import { Wordmark } from './Wordmark';
import { feelingColors } from '../scene/palette';
import { useMemoryStore } from '../store/memoryStore';
import type { FeelingId, Memory } from '../store/types';
import { exportData, parseImport } from '../storage/exportImport';
import {
  playChime,
  startNightAmbience,
  stopNightAmbience,
} from '../audio/engine';

const feelings = Object.entries(strings.feelings) as [FeelingId, string][];

function JarAction({
  kind,
  label,
  onClick,
}: {
  kind: 'paper' | 'firefly';
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`jar-action jar-action--${kind}`}
      onClick={onClick}
      title={label}
    >
      {kind === 'paper' ? (
        <svg className="jar-action__art" viewBox="0 0 40 48" aria-hidden="true">
          <path d="M20 0v8m-4 0h8l-4 4-4-4Z" />
          <path d="M11 11h18v27H11z" />
          <path d="m23 11 6 6h-6z" />
        </svg>
      ) : (
        <svg className="jar-action__art" viewBox="0 0 48 40" aria-hidden="true">
          <path d="M24 20c-4-13-10-13-12-8 0 5 6 8 12 8Zm0 0c4-13 10-13 12-8 0 5-6 8-12 8Z" />
          <ellipse cx="24" cy="21" rx="3" ry="7" />
          <circle cx="24" cy="30" r="3" />
        </svg>
      )}
      <span className="jar-action__label">{label}</span>
    </button>
  );
}

function JarChit({
  memory,
  message,
  releasing,
  calm,
  onRelease,
  onClose,
  onAgain,
  onBreathe,
  onRest,
  onReleaseEnd,
}: {
  memory: Memory | null;
  message: string;
  releasing: boolean;
  calm: boolean;
  onRelease: () => void;
  onClose: () => void;
  onAgain: () => void;
  onBreathe: () => void;
  onRest: () => void;
  onReleaseEnd: () => void;
}) {
  return (
    <article
      className={`jar-chit${releasing ? ' jar-chit--releasing' : ''}${calm ? ' jar-chit--calm' : ''}`}
      role="dialog"
      aria-modal="false"
      aria-label={memory ? 'A memory you saved' : 'A comforting thought'}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && releasing) onReleaseEnd();
      }}
    >
      <span className="chit-fold chit-fold--left" aria-hidden="true" />
      <span className="chit-fold chit-fold--right" aria-hidden="true" />
      <button className="jar-chit__close" onClick={onClose} aria-label="Close note">
        ×
      </button>
      <p className="jar-chit__source">
        {memory ? 'A memory you saved' : 'A thought for this moment'}
      </p>
      {memory ? (
        <>
          <h2>{strings.feelings[memory.feeling]}</h2>
          <p className="jar-chit__message" role="status">{memory.text}</p>
          {memory.senseAnswer && (
            <p className="jar-chit__sense">{memory.senseAnswer}</p>
          )}
        </>
      ) : (
        <p className="jar-chit__message" role="status">{message}</p>
      )}
      <button className="jar-chit__release" onClick={onRelease} disabled={releasing}>
        Let this light go
      </button>
      {memory && (
        <div className="jar-chit__links">
          <button onClick={onAgain}>Ask again</button>
          <button onClick={onBreathe}>Breathe with it</button>
          <button onClick={onRest}>Let this memory rest</button>
        </div>
      )}
    </article>
  );
}

export function App() {
  const hydrate = useMemoryStore((s) => s.hydrate);
  const ready = useMemoryStore((s) => s.ready);
  const memories = useMemoryStore((s) => s.memories);
  const settings = useMemoryStore((s) => s.settings);
  const selected = useMemoryStore((s) => s.selected);
  const add = useMemoryStore((s) => s.add);
  const draw = useMemoryStore((s) => s.draw);
  const openMemory = useMemoryStore((s) => s.openMemory);
  const update = useMemoryStore((s) => s.update);
  const setSettings = useMemoryStore((s) => s.setSettings);
  const merge = useMemoryStore((s) => s.merge);
  const clear = useMemoryStore((s) => s.clear);
  const [panel, setPanel] = useState<
    'write' | 'low' | 'settings' | 'reader' | 'sleeping' | 'list' | null
  >(null);
  const [text, setText] = useState('');
  const [sense, setSense] = useState('');
  const [feeling, setFeeling] = useState<FeelingId>('proud');
  const [notice, setNotice] = useState('');
  const [birthKey, setBirthKey] = useState(0);
  const [birthMemoryId, setBirthMemoryId] = useState<string | null>(null);
  const [jarReply, setJarReply] = useState('');
  const [comfortCount, setComfortCount] = useState(0);
  const [releasingNote, setReleasingNote] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ritualBusy, setRitualBusy] = useState(false);
  const savingRef = useRef(false);
  useEffect(() => {
    if (!panel) return;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    if (!dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    const controls = () => Array.from(dialog.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), summary, [tabindex="0"]',
    )).filter((node) => node.getClientRects().length > 0);
    if (!dialog.contains(document.activeElement)) controls()[0]?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = controls();
      const first = items[0];
      const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    };
    dialog.addEventListener('keydown', trap);
    return () => {
      dialog.removeEventListener('keydown', trap);
      if (previous?.isConnected) previous.focus();
    };
  }, [panel, jarReply]);
  useEffect(() => {
    if (!birthKey) return;
    const calm = settings.calmMode || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => setRitualBusy(false), calm ? 3000 : 8700);
    return () => window.clearTimeout(timer);
  }, [birthKey, settings.calmMode]);
  const audioUnlocked = useRef(false);
  const enableMotion = async () => {
    const orientation =
      DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };
    if (orientation.requestPermission) {
      const result = await orientation.requestPermission();
      setNotice(
        result === 'granted'
          ? 'Motion is on. Tilt the jar gently.'
          : 'Motion permission was not granted.',
      );
    } else {
      setNotice('Motion tracking is ready on this device.');
    }
  };
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  useEffect(() => {
    if (!settings.sound) {
      audioUnlocked.current = false;
      stopNightAmbience();
    } else if (audioUnlocked.current && !document.hidden) {
      startNightAmbience(settings.volume, settings.calmMode);
    }
    const engage = () => {
      if (audioUnlocked.current) return;
      audioUnlocked.current = true;
      if (settings.sound)
        startNightAmbience(settings.volume, settings.calmMode);
    };
    const visibility = () => {
      if (document.hidden) stopNightAmbience();
      else if (audioUnlocked.current && settings.sound)
        startNightAmbience(settings.volume, settings.calmMode);
    };
    window.addEventListener('pointerdown', engage);
    window.addEventListener('keydown', engage);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('pointerdown', engage);
      window.removeEventListener('keydown', engage);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [settings.sound, settings.volume, settings.calmMode]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPanel(null);
      if (event.key.toLowerCase() === 's' && !panel) setPanel('low');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panel]);
  const save = async () => {
    if (savingRef.current) return;
    if (!text.trim()) {
      setNotice(strings.write.emptyHint);
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      const memory = await add(text, sense, feeling);
      setText('');
      setSense('');
      setPanel(null);
      setReleasingNote(false);
      setNotice('A new firefly was born.');
      setBirthMemoryId(memory.id);
      setRitualBusy(true);
      setBirthKey((key) => key + 1);
      if (settings.sound) playChime(settings.volume);
    } catch {
      setNotice('Your note could not be saved. Please try again.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };
  const nextComfortingMessage = () => {
    const index = comfortCount % strings.low.comforting.length;
    setComfortCount((count) => count + 1);
    return strings.low.comforting[index]!;
  };
  const openAsk = () => {
    setReleasingNote(false);
    setJarReply('');
    setPanel('low');
  };
  const choose = (id: FeelingId | 'any') => {
    setReleasingNote(false);
    const memory = draw(id);
    if (!memory) {
      const message = nextComfortingMessage();
      setJarReply(message);
      setNotice(message);
    } else {
      setJarReply('');
      setNotice('A little light is coming closer.');
      setPanel('reader');
    }
  };
  const selectFireflyMemory = (id: string) => {
    if (ritualBusy || panel !== null) return;
    if (!openMemory(id)) return;
    setPanel('reader');
  };
  const download = () => {
    const blob = new Blob([exportData(memories, settings)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `glowmory-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  if (!ready)
    return (
      <main className="app-shell app-shell--loading">
        <p>Waking the fireflies…</p>
      </main>
    );
  return (
    <main className="app-shell app-shell--scene">
      <Room
        memories={memories}
        birthKey={birthKey}
        birthMemoryId={birthMemoryId}
        calmMode={settings.calmMode}
        onSelectMemory={selectFireflyMemory}
      >
        {panel === null && !ritualBusy && (
          <div className="jar-interactions" aria-label="Jar interactions">
            <JarAction
              kind="paper"
              label="Leave a Little Light"
              onClick={() => setPanel('write')}
            />
            <JarAction kind="firefly" label="Ask the Jar" onClick={openAsk} />
          </div>
        )}
        {ritualBusy && (
          <button className="jar-feeling-choice" style={{ pointerEvents: 'auto', position: 'absolute', top: '16rem', left: '-3rem', width: '6rem' }} onClick={() => {
            setBirthKey(0);
            setRitualBusy(false);
          }}>Skip animation</button>
        )}
        {panel === 'low' && !jarReply && (
          <span className="jar-warm-glow" aria-hidden="true" />
        )}
        {panel === 'low' && !jarReply && (
          <div className="jar-feeling-choices" role="group" aria-label={strings.low.ask}>
            <p>{strings.low.ask}</p>
            {feelings.map(([id, label]) => (
              <button
                className="jar-feeling-choice"
                key={id}
                style={{ color: feelingColors[id] }}
                onClick={() => choose(id)}
              >
                <span aria-hidden="true" />
                {label}
              </button>
            ))}
            <button
              className="jar-feeling-choice jar-feeling-choice--surprise"
              onClick={() => choose('any')}
            >
              Surprise me
            </button>
            <button
              className="jar-feeling-choice jar-feeling-choice--close"
              onClick={() => setPanel(null)}
            >
              Close
            </button>
          </div>
        )}
        {((panel === 'low' && Boolean(jarReply)) ||
          (panel === 'reader' && selected !== null)) && (
          <>
            <span className="jar-warm-glow" aria-hidden="true" />
            <JarChit
              memory={panel === 'reader' ? selected : null}
              message={jarReply}
              releasing={releasingNote}
              calm={settings.calmMode}
              onRelease={() => setReleasingNote(true)}
              onClose={() => {
                setReleasingNote(false);
                setJarReply('');
                setPanel(null);
              }}
              onAgain={() => {
                setReleasingNote(false);
                setJarReply('');
                setPanel('low');
              }}
              onBreathe={() => setBreathing(true)}
              onRest={() => {
                if (selected) {
                  void update(selected.id, { status: 'sleeping' });
                  setNotice('Tucked away safely.');
                }
                setPanel(null);
              }}
              onReleaseEnd={() => {
                setReleasingNote(false);
                setJarReply('');
                setPanel(null);
              }}
            />
          </>
        )}
      </Room>
      <section className={`scene-copy${ritualBusy ? ' scene-copy--ritual' : ''}${panel === 'reader' || (panel === 'low' && jarReply) ? ' scene-copy--reading' : ''}`} aria-label="Glowmory">
        <img
          className="brand-mark"
          src={`${import.meta.env.BASE_URL}assets/glowmory-jar-thread.png`}
          alt="A glowing firefly inside a glass jar"
        />
        <h1 aria-label={strings.appName}><Wordmark /></h1>
        <p className="tagline">{strings.tagline}</p>
        <p className="helper">{strings.helper}</p>
      </section>
      <nav className="scene-actions" aria-label="Jar actions">
        <button
          className="scene-action-button"
          onClick={() => setPanel('settings')}
          aria-label="Settings"
        >
          <svg className="scene-action-icon" aria-hidden="true" viewBox="0 0 20 20">
            <path d="M3 5.2h14M3 10h14M3 14.8h14" />
          </svg>
          <span>Tend the Jar</span>
        </button>
      </nav>
      <div className="live-region" aria-live="polite">
        {notice}
      </div>
      {panel && panel !== 'low' && panel !== 'reader' && (
        <div
          className={`panel-backdrop${panel === 'write' ? ' panel-backdrop--writing' : ''}`}
          onClick={(event) => {
            if (event.target === event.currentTarget) setPanel(null);
          }}
        >
          <section
            className={panel === 'write' ? 'panel panel--parchment' : 'panel'}
            role="dialog"
            aria-modal="true"
            aria-label={
              panel === 'write'
                ? 'Write a memory'
              : panel === 'sleeping'
                ? 'Sleeping memories'
                : panel === 'list'
                  ? 'Memory list'
                  : 'Settings'
            }
          >
            <button
              className="close-button"
              onClick={() => setPanel(null)}
              aria-label="Close"
            >
              ×
            </button>
            {panel === 'write' && (
              <>
                <p className="panel-kicker">A small good thing</p>
                <h2>Tell me one good thing.</h2>
                <textarea
                  value={text}
                  maxLength={280}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write it down so it can glow…"
                  autoFocus
                />
                <span className="counter">{text.length}/280</span>
                <details className="sense-details">
                  <summary>Add a scent detail (optional)</summary>
                  <label>
                    What did it smell like?{' '}
                    <input
                      value={sense}
                      maxLength={140}
                      onChange={(e) => setSense(e.target.value)}
                    />
                  </label>
                </details>
                <div className="feeling-grid">
                  {feelings.map(([id, label]) => (
                    <button
                      key={id}
                      className={feeling === id ? 'selected' : ''}
                      onClick={() => setFeeling(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  className="primary-button"
                  onClick={() => void save()}
                  disabled={saving}
                >
                  {saving ? 'Keeping your light…' : strings.write.cta}
                </button>
              </>
            )}
            {panel === 'settings' && (
              <>
                <p className="panel-kicker">Your jar, your rules</p>
                <h2>Settings</h2>
                <label className="toggle-row">
                  Sound{' '}
                  <input
                    type="checkbox"
                    checked={settings.sound}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      void setSettings({ sound: enabled });
                      if (enabled) {
                        audioUnlocked.current = true;
                        startNightAmbience(settings.volume, settings.calmMode);
                      } else {
                        stopNightAmbience();
                      }
                    }}
                  />
                </label>
                <label className="toggle-row">
                  Calm mode{' '}
                  <input
                    type="checkbox"
                    checked={settings.calmMode}
                    onChange={(e) =>
                      void setSettings({ calmMode: e.target.checked })
                    }
                  />
                </label>
                <label>
                  Volume{' '}
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.volume}
                    onChange={(e) =>
                      void setSettings({ volume: Number(e.target.value) })
                    }
                  />
                </label>
                <div className="settings-actions">
                  <button onClick={() => void enableMotion()}>
                    Enable motion
                  </button>
                  <button onClick={download}>Export backup</button>
                  <label className="file-button">
                    Import backup
                    <input
                      type="file"
                      accept="application/json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        void file.text().then((raw) => {
                          try {
                            const incoming = parseImport(raw);
                            void merge(incoming.memories, incoming.settings);
                            setNotice(
                              `Restored ${incoming.memories.length} memories.`,
                            );
                          } catch (error) {
                            setNotice(
                              error instanceof Error
                                ? error.message
                                : 'That backup could not be opened.',
                            );
                          }
                        });
                      }}
                    />
                  </label>
                  <button onClick={() => setPanel('sleeping')}>
                    Sleeping shelf
                  </button>
                  <button onClick={() => setPanel('list')}>
                    Plain memory list
                  </button>
                  <button
                    className="danger-button"
                    onClick={() => {
                      if (
                        window.confirm('Delete every memory from this device?')
                      )
                        void clear();
                    }}
                  >
                    Delete everything
                  </button>
                </div>
                <p className="support-line">{strings.settings.support}</p>
              </>
            )}
            {panel === 'sleeping' && (
              <>
                <p className="panel-kicker">Resting safely</p>
                <h2>Sleeping shelf</h2>
                {memories
                  .filter((m) => m.status === 'sleeping')
                  .map((m) => (
                    <div className="sleeping-row" key={m.id}>
                      <span>{m.text}</span>
                      <button
                        onClick={() => void update(m.id, { status: 'active' })}
                      >
                        Wake
                      </button>
                    </div>
                  ))}
                {memories.every((m) => m.status !== 'sleeping') && (
                  <p>No memories are resting here.</p>
                )}
              </>
            )}
            {panel === 'list' && (
              <>
                <p className="panel-kicker">A simple view</p>
                <h2>All memories</h2>
                {memories.map((memory) => (
                  <article className="memory-row" key={memory.id}>
                    <strong>{strings.feelings[memory.feeling]}</strong>
                    <p>{memory.text}</p>
                    <small>
                      {new Date(memory.createdAt).toLocaleDateString()}
                    </small>
                  </article>
                ))}
              </>
            )}
          </section>
        </div>
      )}
      {breathing && (
        <div
          className="breathing-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Breathing moment"
        >
          <div className="breath-orb" />
          <p>Breathe with it</p>
          <small>Let the light move slowly.</small>
          <button onClick={() => setBreathing(false)}>I'm done</button>
        </div>
      )}
    </main>
  );
}
