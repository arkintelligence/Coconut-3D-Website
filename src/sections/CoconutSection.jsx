import { Lines, Reveal } from '../components/Reveal';
import { images } from '../assets';
import useScrollProgress from '../hooks/useScrollProgress';
import './CoconutSection.css';

const points = [
  { k: 'Origin', v: 'Coastal groves on India’s south-west coast, picked by hand.' },
  { k: 'Freshness', v: 'Harvested young, at the week the water is sweetest.' },
  { k: 'Pressing', v: 'Opened and pressed within 24 hours, then cold-filtered.' },
  { k: 'Natural', v: 'Electrolytes, minerals and nothing we put there ourselves.' },
];

export default function CoconutSection() {
  // the coconut slowly turns and rises as the section passes
  const ref = useScrollProgress((p) => ref.current?.style.setProperty('--cp', p.toFixed(3)));
  return (
    <section ref={ref} className="coco" aria-labelledby="coco-title">
      <div className="coco__ring" aria-hidden="true" />
      <div className="wrap coco__grid">
        <div className="coco__visual">
          <img src={images.coconuts.whole.src} alt="A whole young green coconut" className="coco__whole" loading="lazy" />
          <img src={images.coconuts.half.src} alt="" aria-hidden="true" className="coco__half" loading="lazy" />
        </div>
        <div className="coco__copy">
          <Reveal as="p" className="eyebrow">02 — One coconut</Reveal>
          <Lines as="h2" id="coco-title" className="coco__title serif" lines={['One green coconut.', <em className="serif-it" key="e">One day. One can.</em>]} />
          <dl className="coco__list">
            {points.map((p, i) => (
              <Reveal key={p.k} className="coco__item" delay={i * 0.08}>
                <dt className="display">{p.k}</dt>
                <dd>{p.v}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
