import { Lines, Reveal, RevealImage } from '../components/Reveal';
import FinalCTA from '../sections/FinalCTA';
import { benefits, ritual } from '../data/benefits';
import usePageTitle from '../hooks/usePageTitle';
import { useLoaded } from '../context/LoadedContext';
import useScrollProgress from '../hooks/useScrollProgress';
import Can from '../components/Can';
import { products } from '../data/products';
import './Benefits.css';

function BoxOfHealth() {
  return (
    <section className="box-health" aria-labelledby="box-health-title">
      <h1 id="box-health-title" className="box-health__title display">
        <span>The Box</span><strong>Of Health.</strong>
      </h1>
      <div className="box-health__stage" aria-label="A mixed box of six Palmo flavours">
        <div className="box-health__cans">
          {products.map((product, i) => (
            <span className="box-health__can" style={{ '--i': i }} key={product.id}>
              <Can product={product} title={`${product.name} in the six flavour box`} />
            </span>
          ))}
        </div>
        <div className="box-health__box" aria-hidden="true">
          <span className="display">PALMO</span>
          <small>six flavours · chilled</small>
        </div>
      </div>
      <p className="box-health__note">Six flavours. Real coconut water. One very good-looking fridge.</p>
    </section>
  );
}

function Intro() {
  const loaded = useLoaded();
  return (
    <section className={`bintro ${loaded ? 'is-in' : ''}`} aria-labelledby="bintro-title">
      <div className="wrap">
        <p className="eyebrow">Benefits</p>
        <h1 id="bintro-title" className="bintro__title display">
          <span className="line-mask"><span>Hydration,</span></span>
          <span className="line-mask"><span><em className="serif-it">the way</em> the</span></span>
          <span className="line-mask"><span>palm made it.</span></span>
        </h1>
        <div className="bintro__row">
          <p className="lead">Six reasons coconut water belongs in an ordinary day — no supplements, no powders, no small print.</p>
          <ul className="bintro__index">
            {benefits.map((b, i) => <li key={b.id}><a href={`#b-${b.id}`}><span>0{i + 1}</span>{b.kicker}</a></li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Chapter({ b, i }) {
  return (
    <article id={`b-${b.id}`} className={`bch ${i % 2 ? 'bch--flip' : ''}`} aria-labelledby={`bch-${b.id}`}>
      <div className="bch__media">
        <RevealImage img={b.image.srcSet ? b.image : { ...b.image, srcSet: undefined }} alt="" className={`bch__img ${b.image.srcSet ? '' : 'bch__img--obj'}`} imgClass={b.image.srcSet ? 'cover' : 'bch__obj'} sizes="(max-width: 860px) 100vw, 45vw" />
        <Reveal className="bch__stat" variant="scale" delay={0.2}>
          <span className="display">{b.stat}</span>
          <small>{b.unit}</small>
        </Reveal>
      </div>
      <div className="bch__copy">
        <Reveal as="p" className="bch__kicker"><span>0{i + 1}</span>{b.kicker}</Reveal>
        <Lines as="h2" id={`bch-${b.id}`} className="bch__title serif" lines={b.title} />
        <Reveal as="p" className="bch__body" delay={0.1}>{b.body}</Reveal>
      </div>
    </article>
  );
}

function Ritual() {
  const ref = useScrollProgress((p) => ref.current?.style.setProperty('--rp', p.toFixed(4)));
  return (
    <section ref={ref} className="ritual" aria-labelledby="ritual-title">
      <div className="wrap">
        <Lines as="h2" id="ritual-title" className="ritual__title display" lines={['A day,', <em key="e" className="serif-it">sipped.</em>]} />
        <ol className="ritual__line">
          <span className="ritual__track" aria-hidden="true"><span /></span>
          {ritual.map((r, i) => (
            <Reveal as="li" key={r.time} delay={i * 0.1}>
              <time className="display">{r.time}</time>
              <h3 className="serif">{r.title}</h3>
              <p>{r.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default function Benefits() {
  usePageTitle('Benefits');
  return (
    <>
      <BoxOfHealth />
      <Intro />
      <section className="bchs" aria-label="Six benefits">
        {benefits.map((b, i) => <Chapter key={b.id} b={b} i={i} />)}
      </section>
      <Ritual />
      <FinalCTA />
    </>
  );
}
