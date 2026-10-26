import { useEffect, useRef, useState } from 'react';
import { strings } from '../strings';
import { Room } from '../scene/Room';
import { useMemoryStore } from '../store/memoryStore';
import type { FeelingId } from '../store/types';
import { exportData, parseImport } from '../storage/exportImport';
import { playBirthRitual } from '../ritual/birthRitual';

const feelings = Object.entries(strings.feelings) as [FeelingId, string][];

export function App() {
  const hydrate = useMemoryStore((s) => s.hydrate);
  const ready = useMemoryStore((s) => s.ready);
  const memories = useMemoryStore((s) => s.memories);
  const settings = useMemoryStore((s) => s.settings);
  const selected = useMemoryStore((s) => s.selected);
  const draws = useMemoryStore((s) => s.draws);
  const add = useMemoryStore((s) => s.add);
  const draw = useMemoryStore((s) => s.draw);
  const update = useMemoryStore((s) => s.update);
  const setSettings = useMemoryStore((s) => s.setSettings);
  const merge = useMemoryStore((s) => s.merge);
  const clear = useMemoryStore((s) => s.clear);
  const [panel, setPanel] = useState<
    'write' | 'low' | 'settings' | 'reader' | 'sleeping' | null
  >(null);
  const [text, setText] = useState('');
  const [sense, setSense] = useState('');
  const [feeling, setFeeling] = useState<FeelingId>('proud');
  const [notice, setNotice] = useState('');
  const ritualRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  const save = async () => {
    if (!text.trim()) {
      setNotice(strings.write.emptyHint);
      return;
    }
    const memory = await add(text, sense, feeling);
    setText('');
    setSense('');
    setPanel(null);
    setNotice('A new firefly was born.');
    playBirthRitual(ritualRef.current, settings.calmMode, memories.length >= 2);
    void memory;
  };
  const choose = (id: FeelingId | 'any') => {
    const memory = draw(id);
    if (!memory)
      setNotice(
        id === 'any' ? strings.low.emptyJar : strings.low.noneOfFeeling,
      );
    else {
      setNotice('A little light is coming closer.');
      setPanel('reader');
    }
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
    <main ref={ritualRef} className="app-shell app-shell--scene">
      <Room />
      <section className="scene-copy" aria-label="Glowmory">
        <h1>{strings.appName}</h1>
        <p className="tagline">{strings.tagline}</p>
        <p className="helper">{strings.helper}</p>
      </section>
      <nav className="scene-actions" aria-label="Jar actions">
        <button onClick={() => setPanel('write')}>Write</button>
        <button onClick={() => setPanel('low')}>Shake the jar</button>
        <button
          className="quiet-button"
          onClick={() => setPanel('settings')}
          aria-label="Settings"
        >
          Settings
        </button>
      </nav>
      <div className="live-region" aria-live="polite">
        {notice}
      </div>
      {panel && (
        <div
          className="panel-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) setPanel(null);
          }}
        >
          <section
            className="panel"
            role="dialog"
            aria-modal="true"
            aria-label={
              panel === 'write'
                ? 'Write a memory'
                : panel === 'low'
                  ? 'Choose what you need'
                  : panel === 'reader'
                    ? 'Memory'
                    : panel === 'sleeping'
                      ? 'Sleeping memories'
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
                <label>
                  What did it smell like?{' '}
                  <input
                    value={sense}
                    maxLength={140}
                    onChange={(e) => setSense(e.target.value)}
                  />
                </label>
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
                <button className="primary-button" onClick={() => void save()}>
                  {strings.write.cta}
                </button>
              </>
            )}
            {panel === 'low' && (
              <>
                <p className="panel-kicker">A little light</p>
                <h2>{strings.low.ask}</h2>
                <div className="feeling-grid feeling-grid--large">
                  {feelings.map(([id, label]) => (
                    <button key={id} onClick={() => choose(id)}>
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  className="primary-button"
                  onClick={() => choose('any')}
                >
                  {strings.low.surprise}
                </button>
                {draws >= 3 && (
                  <p className="gentle-note">{strings.low.enough}</p>
                )}
              </>
            )}
            {panel === 'reader' && selected && (
              <>
                <p className="panel-kicker">A memory you saved</p>
                <h2>{strings.feelings[selected.feeling]}</h2>
                <p className="memory-text">{selected.text}</p>
                {selected.senseAnswer && (
                  <p className="sense-text">{selected.senseAnswer}</p>
                )}
                <div className="reader-actions">
                  <button onClick={() => setPanel('low')}>
                    {strings.low.another}
                  </button>
                  <button onClick={() => setPanel(null)}>
                    {strings.low.done}
                  </button>
                </div>
                <button
                  className="text-button"
                  onClick={() => {
                    void update(selected.id, { status: 'sleeping' });
                    setNotice('Tucked away safely.');
                    setPanel(null);
                  }}
                >
                  {strings.low.notMe}
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
                    onChange={(e) =>
                      void setSettings({ sound: e.target.checked })
                    }
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
          </section>
        </div>
      )}
    </main>
  );
}
