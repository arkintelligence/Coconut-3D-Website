import { packs } from '../data/products';
import { money } from '../context/BasketContext';
import './ProductSelector.css';

/** Radio-group of pack sizes. Accessible as a real radio set. */
export default function ProductSelector({ productId, value, onChange, compact = false }) {
  const name = `pack-${productId}`;
  return (
    <fieldset className={`psel ${compact ? 'psel--compact' : ''}`}>
      <legend className="sr-only">Choose a pack size</legend>
      {packs.map((p) => (
        <label key={p.id} className={`psel__opt ${value === p.id ? 'is-on' : ''}`}>
          <input type="radio" name={name} value={p.id} checked={value === p.id} onChange={() => onChange(p.id)} className="sr-only" />
          <span className="psel__top">
            <span className="psel__label">{p.label}</span>
            <span className="psel__price">{money(p.price)}</span>
          </span>
          {!compact && <span className="psel__note">{p.note}</span>}
        </label>
      ))}
    </fieldset>
  );
}
