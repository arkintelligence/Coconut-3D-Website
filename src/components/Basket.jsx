import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBasket, money } from '../context/BasketContext';
import { packs } from '../data/products';
import { site } from '../data/site';
import Can from './Can';
import './Basket.css';

export default function Basket() {
  const b = useBasket();
  const panel = useRef(null);
  const lastFocus = useRef(null);
  const navigate = useNavigate();

  // focus management + Esc + simple focus trap
  useEffect(() => {
    if (!b.open) return;
    lastFocus.current = document.activeElement;
    document.body.classList.add('is-locked');
    document.body.classList.add('basket-open');
    const t = setTimeout(() => panel.current?.querySelector('.bskt__close')?.focus(), 60);
    const onKey = (e) => {
      if (e.key === 'Escape') b.setOpen(false);
      if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll('button:not([disabled]), a[href], select, input');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-locked');
      document.body.classList.remove('basket-open');
      lastFocus.current?.focus?.();
    };
  }, [b.open]); // eslint-disable-line react-hooks/exhaustive-deps

  const empty = b.lines.length === 0;

  return (
    <div className={`bskt ${b.open ? 'is-open' : ''} ${empty ? 'is-empty' : ''}`} aria-hidden={!b.open} inert={b.open ? undefined : ''}>
      <div className="bskt__scrim" onClick={() => b.setOpen(false)} />
      <aside ref={panel} className="bskt__panel" role="dialog" aria-modal="true" aria-labelledby="bskt-title">
        <div className="bskt__head">
          <div><h2 id="bskt-title">Basket <sup>{b.count}</sup></h2>{empty && <p>Nothing poured yet</p>}</div>
          <button type="button" className="bskt__close" onClick={() => b.setOpen(false)} aria-label="Close basket">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>

        {!empty && <div className="bskt__ship" aria-live="polite">
          <p>
            {empty ? 'Nothing poured yet' : b.toFree > 0
              ? <>Add <strong>{money(b.toFree)}</strong> more for free shipping</>
              : <><strong>Free shipping</strong> unlocked — nice pour.</>}
          </p>
          <div className="bskt__meter" role="progressbar" aria-label="Free shipping progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(b.freeProgress * 100)}>
            <span style={{ transform: `scaleX(${b.freeProgress})` }} />
          </div>
          <p className="bskt__ship-sub">Free shipping over {money(site.freeShippingThreshold)}</p>
        </div>}

        <div className="bskt__body">
          {empty ? (
            <div className="bskt__empty">
              <div className="bskt__empty-art" aria-hidden="true">
                <svg viewBox="0 0 120 120"><circle cx="60" cy="66" r="44" fill="#6b4a2f" /><circle cx="60" cy="66" r="34" fill="#f6efe2" /><path d="M36 66a24 10 0 0 0 48 0" fill="#e7dfcf" /><path d="M60 22c7-10 22-10 28-5-10 0-18 2-28 10z" fill="#3f7d4e" /></svg>
              </div>
              <p className="bskt__empty-title">Your basket is thirsty.</p>
              <button type="button" className="bskt__shop" onClick={() => { b.setOpen(false); navigate('/flavours'); }}>Go pick a flavour</button>
            </div>
          ) : (
            <ul className="bskt__lines">
              {b.lines.map((l) => (
                <li key={l.id} className="bskt__line" style={{ '--c': l.product.color, '--bg': l.product.bg }}>
                  <div className="bskt__thumb"><Can product={l.product} title="" /></div>
                  <div className="bskt__info">
                    <div className="bskt__row">
                      <p className="bskt__name">{l.product.name}</p>
                      <p className="bskt__price">{money(l.lineTotal)}</p>
                    </div>
                    <label className="bskt__pack">
                      <span className="sr-only">Pack size for {l.product.name}</span>
                      <select value={l.packId} onChange={(e) => b.changePack(l.id, e.target.value)}>
                        {packs.map((p) => <option key={p.id} value={p.id}>{p.label} · {money(p.price)}</option>)}
                      </select>
                    </label>
                    <div className="bskt__row">
                      <div className="bskt__qty" role="group" aria-label={`Quantity of ${l.product.name}`}>
                        <button type="button" onClick={() => b.setQty(l.id, l.qty - 1)} aria-label="Decrease quantity">−</button>
                        <span aria-live="polite">{l.qty}</span>
                        <button type="button" onClick={() => b.setQty(l.id, l.qty + 1)} aria-label="Increase quantity">+</button>
                      </div>
                      <button type="button" className="bskt__remove" onClick={() => b.remove(l.id)}>Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bskt__foot">
          <dl className="bskt__sum">
            <div><dt>Subtotal</dt><dd>{money(b.subtotal)}</dd></div>
            <div><dt>Shipping</dt><dd>{empty ? '—' : b.shipping === 0 ? 'Free' : money(b.shipping)}</dd></div>
            <div className="bskt__total"><dt>Total</dt><dd>{money(b.total)}</dd></div>
          </dl>
          <button type="button" className="bskt__checkout" disabled={empty} onClick={() => alert('This is a frontend prototype — no payment is taken.')}>Checkout</button>
          <button type="button" className="bskt__clear" disabled={empty} onClick={b.empty}>Empty the basket</button>
          <p className="bskt__disclaimer">Concept prototype. No orders are processed.</p>
        </div>
      </aside>
    </div>
  );
}
