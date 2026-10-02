import { lazy, Suspense, useCallback, useState } from 'react';
import Button from '../components/Button';
import Can from '../components/Can';
import { products } from '../data/products';
import { images } from '../assets';
import { useLoaded } from '../context/LoadedContext';
import useScrollProgress from '../hooks/useScrollProgress';
import './Hero.css';

const Can3D = lazy(() => import('../components/Can3D'));
const heroProduct = products[0];

export default function Hero() {
  const loaded = useLoaded();
  const [glReady, setGlReady] = useState(false);
  const onReady = useCallback(() => setGlReady(true), []);
  // as the hero scrolls away, the visual sinks and the headline drifts
  const ref = useScrollProgress((p) => ref.current?.style.setProperty('--hp', p.toFixed(3)), { mode: 'through' });

  return (
    <section ref={ref} className={`hero ${loaded ? 'is-in' : ''}`} aria-labelledby="hero-title">
      <div className="hero__bg" aria-hidden="true">
        <img src={images.textures.leaves.src} srcSet={images.textures.leaves.srcSet} sizes="100vw" alt="" className="cover" />
      </div>

      <div className="hero__grid wrap">
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow">Pure coconut water · Est. under the sun</p>
          <h1 id="hero-title" className="hero__title display">
            <span className="line-mask"><span>Paradise</span></span>
            <span className="line-mask"><span>in every</span></span>
            <span className="line-mask"><span><em className="serif-it">sip.</em></span></span>
          </h1>
          <p className="hero__lead lead">Water from young green coconuts, pressed within a day of the harvest. Cold, clean and nothing else.</p>
          <ul className="hero__facts">
            <li><strong className="display">5</strong><span>Natural<br />electrolytes</span></li>
            <li><strong className="display">0g</strong><span>Added<br />sugar</span></li>
          </ul>
          <div className="hero__cta">
            <Button to="/flavours" variant="dark" size="lg">Discover flavours</Button>
            <a href="#source" className="hero__scroll">Scroll <span aria-hidden="true">↓</span></a>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__sun" aria-hidden="true" />
          <img className="hero__coco hero__coco--a" src={images.coconuts.half.src} alt="" aria-hidden="true" />
          <img className="hero__coco hero__coco--b" src={images.coconuts.whole.src} alt="" aria-hidden="true" />
          <div className="hero__stage">
            <Can product={heroProduct} className={`hero__fallback ${glReady ? 'is-hidden' : ''}`} title="A can of Palmo Natural Pure coconut water" />
            {loaded && (
              <Suspense fallback={null}>
                <Can3D product={heroProduct} onReady={onReady} />
              </Suspense>
            )}
          </div>
          <p className="hero__badge serif-it" aria-hidden="true"><span>330 ml · cold-filtered · single origin ·&nbsp;</span></p>
        </div>
      </div>

      <div className="hero__ticker" aria-hidden="true">
        <div>
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k}>Natural Pure ✺ Golden Pineapple ✺ Ruby Watermelon ✺ Tropical Guava ✺ Lush Lychee ✺ Alphonso Mango ✺&nbsp;</span>
          ))}
        </div>
      </div>
    </section>
  );
}
