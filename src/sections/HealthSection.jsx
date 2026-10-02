import { Lines, Reveal } from '../components/Reveal';
import './HealthSection.css';

const pillars = [
  { n: '01', t: 'Clean label', d: 'If it isn’t coconut or real fruit, it isn’t in the can.' },
  { n: '02', t: 'Light by nature', d: 'Around 45 kcal a can, with sweetness the fruit grew itself.' },
  { n: '03', t: 'Honest science', d: 'Electrolytes your body recognises, in the ratio it already uses.' },
];

export default function HealthSection() {
  return (
    <section className="hlth" aria-labelledby="hlth-title">
      <div className="wrap">
        <Reveal as="p" className="eyebrow hlth__eyebrow">05 — Our promise</Reveal>
        <Lines
          as="h2"
          id="hlth-title"
          className="hlth__title serif"
          lines={[<>you <em className="serif-it">deserve</em></>, 'the best for', <>your <span className="hlth__hl">health.</span></>]}
        />
        <div className="hlth__grid">
          <Reveal as="p" className="hlth__statement">
            Good nutrition shouldn’t need a glossary. We make one simple thing as well as it can be made, and we tell you exactly what’s in it — so the healthy choice is also the easy one.
          </Reveal>
          <ol className="hlth__pillars">
            {pillars.map((p, i) => (
              <Reveal as="li" key={p.n} delay={i * 0.08}>
                <span className="hlth__n">{p.n}</span>
                <span className="hlth__t display">{p.t}</span>
                <span className="hlth__d">{p.d}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
