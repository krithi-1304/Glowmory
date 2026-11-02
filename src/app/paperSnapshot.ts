export interface PaperSnapshot {
  html: string;
  left: number;
  top: number;
  width: number;
  height: number;
  targetX: number;
  targetY: number;
}

// Snapshot only our rendered parchment, never external HTML. Textarea content is
// assigned as textContent before serializing so memory text cannot become markup.
export function capturePaper(): PaperSnapshot | null {
  const paper = document.querySelector<HTMLElement>('.panel--parchment');
  const mouth = document.querySelector<HTMLElement>('.jar-overlay-anchor');
  if (!paper || !mouth) return null;
  const rect = paper.getBoundingClientRect();
  const target = mouth.getBoundingClientRect();
  const clone = paper.cloneNode(true) as HTMLElement;
  const input = clone.querySelector('textarea');
  if (input) {
    const writing = document.createElement('div');
    writing.className = 'fold-writing';
    writing.textContent = paper.querySelector('textarea')?.value ?? '';
    input.replaceWith(writing);
  }
  clone.removeAttribute('role');
  clone.removeAttribute('aria-modal');
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.margin = '0';
  return { html: clone.outerHTML, left: rect.left, top: rect.top,
    width: rect.width, height: rect.height, targetX: target.left, targetY: target.top - 12 };
}

