import './Curtain.css';

/** Brown cover -> yellow panel grows from the centre -> splits open to the sides. */
export default function Curtain({ delay = 0, className = '' }) {
  return (
    <div className={`curtain ${className}`} style={{ '--curtain-delay': `${delay}s` }} aria-hidden="true">
      <i className="curtain__brown" />
      <i className="curtain__door curtain__door--l" />
      <i className="curtain__door curtain__door--r" />
    </div>
  );
}
