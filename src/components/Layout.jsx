import { useEffect, useLayoutEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Basket from './Basket';
import PageTransition from './PageTransition';
import SiteNotices from './SiteNotices';
import { refreshScroll } from '../hooks/scrollLoop';

/**
 * App shell. Also owns the single reveal observer: any element with
 * [data-reveal], .lines or .img-reveal gets .is-in when it enters view.
 * A MutationObserver picks up nodes added later (lazy sections, route changes).
 */
export default function Layout({ ready }) {
  const { pathname } = useLocation();
  const mainRef = useRef(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    refreshScroll();
  }, [pathname]);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.add('rv-ready');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    const sel = '[data-reveal], [data-observe]';
    const scan = (root) => root.querySelectorAll(sel).forEach((el) => { if (!el.classList.contains('is-in')) io.observe(el); });
    scan(document.body);
    const mo = new MutationObserver((muts) => {
      for (const m of muts) m.addedNodes.forEach((n) => { if (n.nodeType === 1) { if (n.matches?.(sel)) io.observe(n); scan(n); } });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [ready]);

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <Basket />
      <SiteNotices />
      <PageTransition />
    </>
  );
}
