import Button from '../components/Button';
import useScrollProgress from '../hooks/useScrollProgress';
import './ImageStory.css';
export default function ImageStory() {
  const ref = useScrollProgress((p) => ref.current?.style.setProperty('--is-p', p.toFixed(4)));
  const move = (e) => { const r = ref.current?.getBoundingClientRect(); if (!r) return; ref.current.style.setProperty('--ix', `${((e.clientX-r.left)/r.width-.5)*28}px`); ref.current.style.setProperty('--iy', `${((e.clientY-r.top)/r.height-.5)*20}px`); };
  return (
    <section ref={ref} onPointerMove={move} className="istory" aria-labelledby="istory-title">
      <div className="istory__slices" aria-hidden="true"><i /><i /><i /></div>
      <div className="istory__copy" data-observe="">
        <h2 id="istory-title">You deserve the best for your health.</h2>
        <p>We want to make healthy, science-backed nutrition simple and accessible so you can feel better, perform better, and enjoy life every single day.</p>
        <Button to="/flavours">Get Your Drink</Button>
      </div>
      <div className="istory__collage" aria-label="Coconut life">
        <figure className="istory__photo istory__photo--one"><img src="/reference/good-coconut.webp" alt="Fresh harvested coconut held in hand" loading="lazy" /></figure>
        <figure className="istory__photo istory__photo--two"><img src="/reference/bunch-of-coconut.webp" alt="Organic fresh coconuts bunched on palm grove floor" loading="lazy" /></figure>
        <figure className="istory__photo istory__photo--three"><img src="/reference/coconut-holding.webp" alt="Coconut water being sipped fresh" loading="lazy" /></figure>
      </div>
    </section>
  );
}
