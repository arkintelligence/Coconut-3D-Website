import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../hooks/useReducedMotion';
import Curtain from './Curtain';
import './LoadingScreen.css';

/**
 * Full-screen intro. Progress is driven by real readiness signals
 * (fonts + window load) blended with a minimum timeline so it never
 * flashes. When it reaches 100 the panel lifts and onDone fires.
 */
const CURTAIN_START = .72;

export default function LoadingScreen({ onReveal, onDone }) {
  const [pct, setPct] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const revealRef = useRef(onReveal);
  revealRef.current = onReveal;

  useEffect(() => {
    // remove the static boot cover from index.html — this screen now owns the frame
    document.getElementById('boot')?.remove();
    document.body.classList.add('is-locked');
    const reduced = prefersReducedMotion();
    const minTime = reduced ? 400 : 2200;
    let ready = 0; // 0..1 from real signals
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise((r) => window.addEventListener('load', r, { once: true }));
    fonts.then(() => { ready += 0.5; });
    loaded.then(() => { ready += 0.5; });
    // safety: never block longer than 6s
    const cap = setTimeout(() => { ready = 1; }, 6000);

    let raf;
    let shown = 0;
    const t0 = performance.now();
    const tick = (t) => {
      const timeK = Math.min(1, (t - t0) / minTime);
      const target = Math.min(timeK, 0.15 + ready * 0.85) * 100;
      shown += (target - shown) * 0.12;
      if (target >= 100 && shown > 99.4) shown = 100;
      setPct(Math.floor(shown));
      if (shown < 100) raf = requestAnimationFrame(tick);
      else {
        setLeaving(true);
        // Palm and counter fade (0-.5s), brown holds, the yellow panel grows from the centre
        // (CURTAIN_START to +.3s) and then splits open. The page starts its entrance as the panel opens.
        setTimeout(() => {
          document.body.classList.remove('is-locked');
          revealRef.current?.();
        }, reduced ? 50 : (CURTAIN_START + .3) * 1000);
        setTimeout(() => doneRef.current?.(), reduced ? 60 : (CURTAIN_START + .3 + .45) * 1000);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); clearTimeout(cap); document.body.classList.remove('is-locked'); };
  }, []);

  return (
    <div className={`loader ${leaving ? 'is-leaving' : ''}`} role="status" aria-live="polite" aria-label={`Loading Palmo, ${pct} percent`}>
      <div className="loader__palm" aria-hidden="true">
        <img className="loader__palm-base" src="/palm-mark.svg" alt="" />
        <span className="loader__palm-fill" style={{ clipPath: `inset(${100 - pct}% 0 0 0)` }}>
          <img src="/palm-mark.svg" alt="" />
        </span>
      </div>
      <div className="loader__count display" aria-hidden="true">
        <span>{String(pct).padStart(3, '0')}</span><small>%</small>
      </div>
      {leaving && <Curtain delay={CURTAIN_START} />}
    </div>
  );
}
