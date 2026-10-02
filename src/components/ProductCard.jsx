import { useEffect, useRef, useState } from 'react';
import ReferenceCan3D from './ReferenceCan3D';
import ProductSelector from './ProductSelector';
import { useBasket, money } from '../context/BasketContext';
import { getPack } from '../data/products';
import './ProductCard.css';

const productImages = {
  'natural-pure': '/reference/palmo-products/coconut.webp',
  'golden-pineapple': '/reference/palmo-products/pineapple.webp',
  'ruby-watermelon': '/reference/palmo-products/watermelon.webp',
  'tropical-guava': '/reference/palmo-products/guava.webp',
  'lush-lychee': '/reference/palmo-products/lychee.webp',
  'alphonso-mango': '/reference/palmo-products/mango.webp',
};

/**
 * Full-bleed product panel (not a boxed card). `layout`:
 *  - 'panel' : tall coloured column used in the Home shop row
 *  - 'row'   : wide split layout used on the Flavours page
 */
export default function ProductCard({ product, layout = 'panel', index = 0 }) {
  const { add, setOpen } = useBasket();
  const [pack, setPack] = useState('single');
  const [added, setAdded] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const timer = useRef();
  const cardRef = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setRevealed(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const onAdd = () => {
    add(product.id, pack);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  };
  const price = getPack(pack).price;

  return (
    <article
      ref={cardRef}
      className={`pcard pcard--${layout} ${revealed ? 'is-in' : ''} ${added ? 'is-added' : ''}`}
      style={{ '--i': index, '--stagger': index % 3, '--c': product.color, '--deep': product.deep, '--ink': product.ink, '--bg': product.bg, '--sel-bg': product.ink, '--sel-fg': product.bg }}
      aria-labelledby={`pc-${layout}-${product.id}`}
    >
      <div className="pcard__visual">
        <span className="pcard__num display" aria-hidden="true">0{index + 1}</span>
        <div className="pcard__blob" aria-hidden="true" />
        <ReferenceCan3D className="pcard__can" texture={productImages[product.id]} cameraDistance={9} rotateOnHover />
        <span className="pcard__splash" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => <i key={i} style={{ '--a': `${i * 45}deg` }} />)}
        </span>
      </div>
      <div className="pcard__body">
        <p className="pcard__tag serif-it">{product.tagline}</p>
        <h3 id={`pc-${layout}-${product.id}`} className="pcard__name display">{product.name}</h3>
        {layout === 'row' && <p className="pcard__desc">{product.description}</p>}
        {layout === 'row' && (
          <ul className="pcard__notes" aria-label="Tasting notes">
            {product.notes.map((n) => <li key={n}>{n}</li>)}
          </ul>
        )}
        <ProductSelector productId={`${layout}-${product.id}`} value={pack} onChange={setPack} compact={layout === 'panel'} />
        <div className="pcard__cta">
          <button type="button" className="pcard__add" onClick={onAdd} aria-label={`Add ${product.name}, ${getPack(pack).label}, to basket`}>
            <span className="pcard__add-roll">
              <span>Add to basket · {money(price)}</span>
              <span>Poured in ✓</span>
            </span>
          </button>
          {added && (
            <button type="button" className="pcard__view" onClick={() => setOpen(true)}>View basket</button>
          )}
        </div>
        <p className="sr-only" aria-live="polite">{added ? `${product.name} added to basket` : ''}</p>
      </div>
    </article>
  );
}
