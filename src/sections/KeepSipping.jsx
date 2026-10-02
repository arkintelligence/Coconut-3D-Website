import { Reveal } from '../components/Reveal';
import { images } from '../assets';
import useScrollProgress from '../hooks/useScrollProgress';
import './KeepSipping.css';

/** Oversized, scroll-scrubbed type with images drifting at different speeds. */
export default function KeepSipping() {
  const ref = useScrollProgress((p) => ref.current?.style.setProperty('--kp', p.toFixed(4)));
  return (
    <section ref={ref} className="ks" aria-labelledby="ks-title">
      <h2 id="ks-title" className="ks__title display">
        <span className="ks__row ks__row--a">Keep</span>
        <span className="ks__row ks__row--b">Sipping..</span>
      </h2>
      <div className="ks__imgs" aria-hidden="true">
        <div className="ks__img ks__img--1"><img src={images.story.grove.src} srcSet={images.story.grove.srcSet} sizes="30vw" alt="" loading="lazy" className="cover" /></div>
        <div className="ks__img ks__img--2"><img src={images.textures.husk.src} srcSet={images.textures.husk.srcSet} sizes="22vw" alt="" loading="lazy" className="cover" /></div>
        <img className="ks__coco" src={images.coconuts.half.src} alt="" loading="lazy" />
      </div>
      <div className="wrap ks__copy">
        <Reveal as="p" className="ks__lead serif">Coconut water was the first sports drink — <em className="serif-it">the palm just never marketed it.</em></Reveal>
        <Reveal as="p" delay={0.1} className="ks__body">Naturally isotonic, light on the stomach and gently sweet, it puts back what a hot day takes out. No neon, no syrup, no long list. Just keep sipping.</Reveal>
      </div>
    </section>
  );
}
