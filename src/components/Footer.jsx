import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { site } from '../data/site';
import useScrollProgress from '../hooks/useScrollProgress';
import FruitGame from './FruitGame';
import './Footer.css';

export default function Footer() {
  const footerRef = useRef(null);
  // the giant wordmark rises as the footer scrolls in
  const ref = useScrollProgress((_, r) => {
    // 0 when the footer top meets the viewport bottom, 1 when its bottom does
    const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / r.height));
    ref.current?.style.setProperty('--fp', p.toFixed(3));
  });
  const move = (e) => {
    const r = footerRef.current?.getBoundingClientRect();
    if (!r) return;
    footerRef.current.style.setProperty('--fx', `${((e.clientX-r.left)/r.width-.5)*24}px`);
    footerRef.current.style.setProperty('--fy', `${((e.clientY-r.top)/r.height-.5)*18}px`);
  };
  return (
    <footer id="footer" ref={(node) => { ref.current = node; footerRef.current = node; }} onPointerMove={move} className="ftr">
      <div className="ftr__game"><FruitGame /></div>
      <div className="wrap ftr__top">
        <div className="ftr__claim">
          <p className="eyebrow">Palmo Coconut Co.</p>
          <p className="ftr__big">Cold Pressed, Never Concentrated.<br />Picked Ripe, Sipped Cold.</p>
        </div>
        <nav className="ftr__nav" aria-label="Footer">
          <p className="ftr__label">Explore</p>
          <ul>
            {site.footerNav.map((n) => (
              <li key={n.to}><Link to={n.to}>{n.label}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="ftr__mark" aria-hidden="true">
        <span>Palmo</span>
      </div>
      <div className="wrap ftr__base">
        <p>©2026 Palmo. All Rights Reserved.</p>
        <p className="ftr__script">Made Under The Sun</p>
      </div>
    </footer>
  );
}
