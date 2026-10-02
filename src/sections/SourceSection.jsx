import { Lines, Reveal, RevealImage } from '../components/Reveal';
import Statistics from '../components/Statistics';
import { stats } from '../data/nutrition';
import { images } from '../assets';
import './SourceSection.css';

export default function SourceSection() {
  return (
    <section id="source" className="src" aria-labelledby="src-title">
      <div className="wrap">
        <div className="src__head">
          <Reveal as="p" className="eyebrow">01 — The origin</Reveal>
          <Lines as="h2" id="src-title" className="src__title display" lines={['The real', <>Source <em className="serif-it">of every</em> Sip.</>]} />
        </div>
        <div className="src__grid">
          <RevealImage className="src__img" img={images.story.hold} alt="Two hands holding a freshly picked green coconut" sizes="(max-width: 860px) 100vw, 40vw" />
          <div className="src__text">
            <Reveal as="p" className="src__lead serif">Before it is a drink, it is a coconut — young, green and heavy with water the palm has spent nine months filtering through its own roots.</Reveal>
            <Reveal as="p" delay={0.1}>We open each one within a day of picking. Nothing is boiled, concentrated or rebuilt from powder. What you taste is simply what the tree made, kept cold.</Reveal>
          </div>
        </div>
        <Statistics items={stats} />
      </div>
    </section>
  );
}
