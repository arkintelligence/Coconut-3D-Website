import { useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { prefersReducedMotion } from '../hooks/useReducedMotion';
import Curtain from './Curtain';


/**
 * Route change: the same reveal that follows the loader. The new page renders underneath a brown
 * cover, a yellow panel grows out of the centre line, then splits open to both sides.
 */
export default function PageTransition() {
  const { pathname } = useLocation();
  const first = useRef(true);
  const [state, setState] = useState({ key: 0 });
  useLayoutEffect(() => {
    if (first.current) { first.current = false; return; }
    if (prefersReducedMotion()) return;
    setState((s) => ({ key: s.key + 1 }));
  }, [pathname]);
  if (!state.key) return null;
  return <Curtain key={state.key} delay={0.18} className="curtain--route" />;
}
