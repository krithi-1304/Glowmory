import { strings } from '../strings';
import { Room } from '../scene/Room';

export function App() {
  return (
    <main className="app-shell app-shell--scene">
      <Room />
      <section className="scene-copy" aria-label="Glowmory">
        <h1>{strings.appName}</h1>
        <p className="tagline">{strings.tagline}</p>
        <p className="helper">{strings.helper}</p>
      </section>
    </main>
  );
}
