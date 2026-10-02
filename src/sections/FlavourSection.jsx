import { useEffect, useRef, useState } from 'react';
import ReferenceCan3D from '../components/ReferenceCan3D';
import { packs, products } from '../data/products';
import { money } from '../context/BasketContext';
import { useBasket } from '../context/BasketContext';
import useScrollProgress from '../hooks/useScrollProgress';
import './FlavourSection.css';

const textures = [
  '/reference/palmo-products/coconut.webp',
  '/reference/palmo-products/pineapple.webp',
  '/reference/palmo-products/watermelon.webp',
  '/reference/palmo-products/guava.webp',
  '/reference/palmo-products/lychee.webp',
  '/reference/palmo-products/mango.webp',
];
const cardColors = products.map(() => '#ede7a6');
// Hover colours sampled from the reference (pineapple olive, watermelon red).
const hoverColors = ['#a0713d', '#545511', '#c34732', '#6f8d42', '#a74f67', '#c88b22'];

export function FlavourCard({ product, index }) {
  const basket = useBasket();
  const [open, setOpen] = useState(false);

  return (
    <article className="flv__card" style={{ '--i': index % 3, '--card-bg': cardColors[index], '--hover-bg': hoverColors[index] }}>
      <div className="flv__art"><i aria-hidden="true" /><i aria-hidden="true" /><ReferenceCan3D texture={textures[index]} cameraDistance={9.8} rotateOnHover /></div>
      <div className="flv__caption"><h3>{product.name}</h3><button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={`Choose a pack of ${product.name}`}>{open ? '×' : '+'}</button></div>
      {open && <div className="flv__picker">
        <p>Pick a pack</p>
        {packs.map((pack) => <button key={pack.id} type="button" onClick={() => { basket.add(product.id, pack.id); setOpen(false); }}><span><strong>{pack.label}</strong><small>{pack.note}</small></span><b>{money(pack.price)}</b></button>)}
        <button type="button" className="flv__view" onClick={() => basket.setOpen(true)}>View basket</button>
      </div>}
    </article>
  );
}

export default function FlavourSection() {
  const cardsRef = useRef(null);
  const ref = useScrollProgress((p) => {
    if (!ref.current) return;
    ref.current.style.setProperty('--flv-p', p.toFixed(4));
    const wordIndex = p < .26 ? 0 : p < .36 ? 1 : 2;
    ref.current.style.setProperty('--word-step', wordIndex);
    ref.current.dataset.word = wordIndex === 0 ? 'pre' : wordIndex === 1 ? 'fresh' : 'clean';
  });
  useEffect(() => {
    const node = cardsRef.current;
    if (!node) return undefined;
    const cards = [...node.querySelectorAll('.flv__card')];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); });
    }, { threshold: .16 });
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);
  return (
    <section ref={ref} className="flv" aria-label="Flavours">
      <div className="flv__lead">
        <h2>Keep Sipping.</h2>
        <ReferenceCan3D texture={textures[0]} tilt={-7} className="flv__lead-can" scrollTurns={2} />
        <div className="flv__scallop" aria-hidden="true" />
      </div>
      <div className="flv__statement">
        <div className="flv__statement-inner"><img src="/reference/story-smile.svg" alt="" /><p>Pure coconut water.<br />Naturally hydrating,<br />refreshingly <span className="flv__words"><span><b>Pre</b><b>Fresh</b><b>Clean</b></span></span>, from<br />nature’s source.</p><small>That’s why people<br />love to drink it!</small></div>
      </div>
      <header className="flv__cards-head"><h2>Explore All<br />Flavours</h2><span>Made under the sun</span></header>
      <div ref={cardsRef} className="flv__cards">
        {products.slice(0, 3).map((product, index) => <FlavourCard key={product.id} product={product} index={index} />)}
      </div>
    </section>
  );
}
