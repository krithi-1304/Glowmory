import type { CSSProperties } from 'react';

import type { PaperSnapshot } from './paperSnapshot';

export function MemoryFold({ paper }: { paper: PaperSnapshot }) {
  return <div className="memory-fold" aria-hidden="true" inert style={{
    left: paper.left, top: paper.top, width: paper.width, height: paper.height,
    '--paper-x': `${paper.targetX - paper.left - paper.width / 2}px`,
    '--paper-y': `${paper.targetY - paper.top - paper.height / 2}px`,
  } as CSSProperties}>
    {[0, 1].map(row => <div className={`memory-fold__row memory-fold__row--${row}`} key={row}>
      {[0, 1].map(col => <div className={`memory-fold__quarter memory-fold__quarter--${col}`} key={col}>
        <div className="memory-fold__front"><div className="memory-fold__face" style={{ width: paper.width, height: paper.height, left: -col * paper.width / 2, top: -row * paper.height / 2 }} dangerouslySetInnerHTML={{ __html: paper.html }} /></div>
        <span className="memory-fold__back" />
      </div>)}
    </div>)}
    <span className="memory-fold__light" />
  </div>;
}
