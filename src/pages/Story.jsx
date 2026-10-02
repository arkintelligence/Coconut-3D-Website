import { useEffect, useRef } from 'react';
import FinalCTA from '../sections/FinalCTA';
import { chapters, differentiators } from '../data/story';
import { images } from '../assets';
import useScrollProgress from '../hooks/useScrollProgress';
import usePageTitle from '../hooks/usePageTitle';
import './Story.css';

function StoryHero() {
  return <section className="story-hero" aria-labelledby="story-hero-title">
    <div className="story-hero__copy"><p><span>We Believe The Best Drinks Don't Need A Long List Of Ingredients. That's Why Every Bottle Starts With One Simple Idea: Keep It Real.</span></p><h1 id="story-hero-title"><span>Pure Energy</span><span>In Every Sip.</span></h1></div>
    <div className="story-hero__photo"><img src="/reference/story-hero.jpg" alt="Tropical palm trees top-down canopy view" /></div>
    <img className="story-hero__smile" src="/reference/story-smile.svg" alt="" />
  </section>;
}

function StoryRail() {
  const ref = useScrollProgress((p) => {
    ref.current?.style.setProperty('--rail-progress', p.toFixed(4));
    const index = Math.min(3, Math.floor(p * 4.05));
    ref.current?.style.setProperty('--rail-index', index);
    const current = ref.current?.querySelector('[data-rail-current]');
    if (current) current.textContent = String(index + 1).padStart(2, '0');
  }, { mode: 'pin' });
  return <section ref={ref} className="story-rail" aria-labelledby="story-title"><div className="story-rail__stage">
    <header className="story-rail__head"><h2 id="story-title">Our Story</h2><div className="story-rail__counter"><span data-rail-current>01</span><small>/ 04</small></div><div className="story-rail__ticks" aria-hidden="true"><i /><i /><i /><i /></div></header>
    <div className="story-rail__viewport"><div className="story-rail__track">
      {chapters.map((chapter) => <article className="story-card" key={chapter.id}><img src={chapter.image.src} srcSet={chapter.image.srcSet} alt={chapter.alt} /><div className="story-card__copy"><span>{chapter.num} / {chapter.label}</span><h3>{chapter.title}</h3><p>{chapter.id === 'harvest' ? 'Hands in the trees, not a factory floor. Every bottle begins with a farmer and a palm.' : chapter.id === 'cluster' ? 'Still on the frond, still catching light. This is the fruit we wait for: nothing added, nothing rushed.' : chapter.id === 'canopy' ? 'Tall palms, heat, and the kind of light you cannot bottle. The grove does the work. We just show up for it.' : 'Ripe, cracked, canned. No long list, no extra fuss - the same idea we started with, sealed in a bottle.'}</p><em>{chapter.id === 'harvest' ? 'picked at peak' : chapter.id === 'cluster' ? 'left on the palm' : chapter.id === 'canopy' ? 'from the trees' : 'keep it real'}</em></div></article>)}
    </div></div>
  </div></section>;
}

function StoryDifference() {
  const photos = useRef(null);
  const drag = useRef(null);
  const move = (e) => {
    const root = photos.current;
    if (!root) return;
    const r = root.getBoundingClientRect();
    root.style.setProperty('--mx', `${((e.clientX - r.left) / r.width - .5) * 18}px`);
    root.style.setProperty('--my', `${((e.clientY - r.top) / r.height - .5) * 14}px`);
    if (!drag.current) return;
    const { el, x, y, ox, oy } = drag.current;
    el.style.setProperty('--dx', `${ox + e.clientX - x}px`);
    el.style.setProperty('--dy', `${oy + e.clientY - y}px`);
  };
  const down = (e) => {
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    drag.current = { el, x: e.clientX, y: e.clientY, ox: Number(el.dataset.x || 0), oy: Number(el.dataset.y || 0) };
    el.classList.add('is-dragging');
  };
  const up = (e) => {
    if (!drag.current) return;
    const { el, x, y, ox, oy } = drag.current;
    el.dataset.x = String(ox + e.clientX - x);
    el.dataset.y = String(oy + e.clientY - y);
    el.classList.remove('is-dragging');
    drag.current = null;
  };
  return <section className="story-difference" data-observe onPointerMove={move} aria-labelledby="difference-title"><div ref={photos} className="story-difference__photos"><figure onPointerDown={down} onPointerUp={up} onPointerCancel={up}><img src={images.story.hold.src} alt="Coconut hanging over a tropical beach" draggable="false" /></figure><figure onPointerDown={down} onPointerUp={up} onPointerCancel={up}><img src={images.story.grove.src} alt="Coconut resting on a tropical beach" draggable="false" /></figure></div><div className="story-difference__copy"><h2 id="difference-title"><span>What Makes</span><span>Us Different?</span></h2><ol>{differentiators.slice(0, 4).map((item) => <li key={item.title}>{item.body || item.title}</li>)}</ol></div></section>;
}

export default function Story() {
  usePageTitle('Our Story');
  useEffect(() => () => { document.body.dataset.hdr = ''; }, []);
  return <><StoryHero /><StoryRail /><StoryDifference /><FinalCTA /></>;
}
