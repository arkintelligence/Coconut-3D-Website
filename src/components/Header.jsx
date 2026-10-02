import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { site } from '../data/site';
import { useBasket } from '../context/BasketContext';
import './Header.css';

export default function Header() {
  const { count, setOpen, pulse } = useBasket();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bump, setBump] = useState(false);
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const location = useLocation();

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle('is-locked', menuOpen);
    if (!menuOpen) return;
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!pulse) return;
    headerRef.current?.classList.remove('is-hidden'); // reveal the header so the badge bump is seen
    setBump(true);
    const t = setTimeout(() => setBump(false), 600);
    return () => clearTimeout(t);
  }, [pulse]);

  const sayHello = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
    } catch {
      window.location.href = `mailto:${site.email}`;
      return;
    }
    setTimeout(() => setCopied(false), 1800);
  };

  const moveMenu = (event) => {
    if (!menuRef.current) return;
    const x = event.clientX / innerWidth - .5;
    const y = event.clientY / innerHeight - .5;
    menuRef.current.style.setProperty('--tree-x', `${x * 38}px`);
    menuRef.current.style.setProperty('--tree-y', `${y * 26}px`);
    menuRef.current.style.setProperty('--tree-r', `${x * 2.2}deg`);
    menuRef.current.style.setProperty('--cursor-x', `${event.clientX}px`);
    menuRef.current.style.setProperty('--cursor-y', `${event.clientY}px`);
  };

  return (
    <>
      <header ref={headerRef} className={`hdr ${menuOpen ? 'is-menu' : ''}`}>
        <div className="hdr__bar">
          <Link to="/" className="hdr__logo" aria-label="Palmo home">
            <img src="/palm-mark.svg" alt="" />
          </Link>

          <div className="hdr__actions">
            <button type="button" className={`hdr__basket ${bump ? 'is-bump' : ''}`} onClick={() => setOpen(true)} aria-label={`Open basket, ${count} item${count === 1 ? '' : 's'}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M2.9 9c.3 0 .6-.2.9-.5-.4.8-.7 1.8-.8 3.4V13c0 5 4 9 9 9s9-4 9-9c0-1.7-.4-3.2-1.2-4.5-.2-.3-.5-.5-.9-.5h-3.5l1.2-2.8 3.2.8c.5.1 1.1-.2 1.2-.7.1-.5-.2-1.1-.7-1.2l-4-1c-.5-.1-1 .1-1.2.6L13.2 8H8.4L6.9 6.5l1.5-1.1c.6-.5.5-1.3 0-1.6C7.7 3.3 6.9 3 6 3 3.8 3 2 4.8 2 6.9c0 .8.3 1.8.9 2.1ZM19 13c0 3.9-3.1 7-7 7s-7-3.1-7-7h14ZM5.3 11c.1-.3.2-.7.4-1h12.6c.2.3.3.7.4 1H5.3Z" /></svg>
              {count > 0 && <span className="hdr__count">{count > 9 ? '9+' : count}</span>}
            </button>
            <button type="button" className="hdr__burger" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
              <span>{menuOpen ? 'CLOSE' : 'MENU'}</span>
            </button>
          </div>
        </div>
      </header>

      <div ref={menuRef} id="mobile-menu" className={`mmenu ${menuOpen ? 'is-open' : ''}`} onPointerMove={moveMenu} aria-hidden={!menuOpen} inert={menuOpen ? undefined : ''}>
        <nav aria-label="Mobile">
          <ul>
            {site.nav.map((n, i) => (
              <li key={n.to} style={{ '--i': i }}>
                <NavLink to={n.to} end={n.to === '/'} className="mmenu__link">
                  <span>{n.label}</span><span aria-hidden="true">{n.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mmenu__foot">
          <button type="button" onClick={sayHello}>{copied ? 'Copied!' : 'Say hello'}</button>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </div>
        <span className="mmenu__cursor" aria-hidden="true">Move<br />Cursor</span>
      </div>
    </>
  );
}
