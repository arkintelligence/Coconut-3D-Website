import { useState } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import './FinalCTA.css';

export default function FinalCTA() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const realProducts = products;
  const product = realProducts[index];
  const step = (n) => { setDirection(n); setIndex((index + n + realProducts.length) % realProducts.length); };
  const photos = ['/reference/natural-can-cutout.png', '/reference/pineapple-can-cutout.png', '/reference/watermelon-can-cutout.png', '/reference/guava-can-cutout.png', '/reference/lychee-can-cutout.png', '/reference/mango-can-cutout.png'];
  const backgrounds = ['#9d6d36', '#626912', '#cf523a', '#c06b73', '#9f5268', '#d87826'];
  return (
    <section id="box-health" className="fcta" data-observe aria-labelledby="fcta-title">
      <div className="fcta__panel fcta__panel--copy">
        <span className="fcta__eyebrow">Straight from the shell</span>
        <h2 id="fcta-title">The box of<br />health.</h2>
        <p>Chilled, clean, ready to sip. Order before the batch runs dry.</p>
        <div className="fcta__btns"><Link className="fcta__sketch-link" to="/flavours">Get Your Drink</Link><Link className="fcta__sketch-link" to="/flavours">Explore Flavors</Link></div>
      </div>
      <div className="fcta__panel fcta__panel--product" style={{ '--product-bg': backgrounds[index] }}><span className="fcta__product-top">{product.name} Coco Water</span><button className="fcta__prev" onClick={() => step(-1)} aria-label="Previous flavour">←</button><div className={`fcta__can ${direction < 0 ? 'is-back' : ''}`} key={product.id}><img className="fcta__cutout" src={photos[index]} alt={`${product.name} can`} /></div><p>{product.name} Coco Water</p><button className="fcta__next" onClick={() => step(1)} aria-label="Next flavour">→</button></div>
    </section>
  );
}
