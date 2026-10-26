import { strings } from '../strings';

export function App() {
  return (
    <main className="app-shell">
      <h1>{strings.appName}</h1>
      <p className="tagline">{strings.tagline}</p>
      <p className="helper">{strings.helper}</p>
    </main>
  );
}
