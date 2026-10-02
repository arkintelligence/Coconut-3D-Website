import useInView from '../hooks/useInView';
import useCountUp from '../hooks/useCountUp';
import './Statistics.css';

function Stat({ value, unit, label, start, delay }) {
  const n = useCountUp(value, start, 1600 + delay * 400);
  return (
    <li className="stat" style={{ '--d': `${delay * 0.12}s` }}>
      <p className="stat__value display" aria-label={`${value} ${unit} ${label}`}>
        <span aria-hidden="true">{n}</span><small aria-hidden="true">{unit}</small>
      </p>
      <p className="stat__label">{label}</p>
    </li>
  );
}

export default function Statistics({ items }) {
  const [ref, inView] = useInView({ threshold: 0.3 });
  return (
    <ul ref={ref} className={`stats ${inView ? 'is-in' : ''}`}>
      {items.map((s, i) => <Stat key={s.label} {...s} start={inView} delay={i} />)}
    </ul>
  );
}
