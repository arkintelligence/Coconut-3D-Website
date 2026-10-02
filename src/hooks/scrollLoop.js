/**
 * A single requestAnimationFrame loop that feeds every scroll-driven effect.
 * Subscribers receive nothing; they read layout themselves in the frame.
 * Only runs while the page is scrolling or resizing, then idles.
 */
const subs = new Set();
let ticking = false;
let bound = false;

function frame() {
  ticking = false;
  subs.forEach((fn) => fn());
}
function request() {
  if (!ticking) { ticking = true; requestAnimationFrame(frame); }
}
export function subscribeScroll(fn) {
  subs.add(fn);
  if (!bound) {
    bound = true;
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request, { passive: true });
  }
  request();
  return () => subs.delete(fn);
}
export const refreshScroll = request;
