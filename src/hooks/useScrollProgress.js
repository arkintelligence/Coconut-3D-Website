import { useEffect, useRef } from 'react';
import { subscribeScroll } from './scrollLoop';

/**
 * Calls onProgress(p) with 0..1 for how far the element has travelled through
 * the viewport (or through itself when mode = 'pin', for sticky sections).
 * Writes go straight to the DOM via the callback — no React re-renders per frame.
 */
export default function useScrollProgress(onProgress, { mode = 'through' } = {}) {
  const ref = useRef(null);
  const cb = useRef(onProgress);
  cb.current = onProgress;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let last = -1;
    return subscribeScroll(() => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      let p;
      if (mode === 'pin') p = -r.top / Math.max(1, r.height - vh);
      else p = (vh - r.top) / (vh + r.height);
      p = Math.min(1, Math.max(0, p));
      if (Math.abs(p - last) > 0.0005) { last = p; cb.current(p, r); }
    });
  }, [mode]);
  return ref;
}
