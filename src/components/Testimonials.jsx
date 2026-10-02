import { useEffect, useRef, useState } from 'react';
import './Testimonials.css';

const accents = ['#ffe386', '#f2c14e', '#ea5b63', '#f08a8f', '#e9b4c3', '#f59e2b'];

export default function Testimonials({ items }) {
  const count = items.length;
  const slides = [...items, ...items, ...items];
  const [index, setIndex] = useState(count);
  const [motion, setMotion] = useState(0);
  const [resetting, setResetting] = useState(false);
  const [moving, setMoving] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const resetTimer = useRef();
  const rootRef = useRef(null);
  const step = (n) => {
    if (moving || resetting) return;
    setMoving(true);
    setMotion(n);
    setIndex((current) => current + n);
  };
  const settle = (event) => {
    if (event.target !== event.currentTarget) return;
    setMoving(false);
    setMotion(0);
    let target = index;
    if (index >= count * 2) target = index - count;
    if (index < count) target = index + count;
    if (target === index) return;
    setResetting(true);
    setIndex(target);
    clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setResetting(false), 40);
  };
  useEffect(() => () => clearTimeout(resetTimer.current), []);
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setRevealed(true); observer.disconnect(); }
    }, { threshold: .12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={rootRef} className={`tms ${revealed ? 'is-in' : ''} ${resetting ? 'is-resetting' : ''} ${motion > 0 ? 'is-next' : motion < 0 ? 'is-prev' : ''}`} style={{ '--slide': index }}>
    <div className="tms__controls">
      <button type="button" onClick={() => step(-1)} aria-label="Previous testimonial">←</button>
      <button type="button" onClick={() => step(1)} aria-label="Next testimonial">→</button>
    </div>
    <div className="tmq"><div className="tmq__track" onTransitionEnd={settle}>
      {slides.map((t, i) => <figure className="tmq__item" key={`${t.handle}-${i}`} style={{ '--ac': accents[i % accents.length], '--qi': i % count }}><span aria-hidden="true">”</span><blockquote>{t.quote}</blockquote><figcaption>{t.handle}</figcaption></figure>)}
    </div></div>
  </div>;
}
