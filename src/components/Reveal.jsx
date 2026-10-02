import { createElement } from 'react';

/**
 * <Lines> renders text split into masked lines that slide up when the
 * global reveal observer adds .is-in. Pass an array for explicit line breaks.
 */
export function Lines({ as = 'h2', lines, className = '', delay = 0, ...rest }) {
  const arr = Array.isArray(lines) ? lines : [lines];
  return createElement(
    as,
    { className: `lines ${className}`, 'data-observe': '', style: { '--d': `${delay}s` }, ...rest },
    arr.map((line, i) => (
      <span className="line-mask" key={i} style={{ '--i': i }}>
        <span>{line}</span>
      </span>
    )),
  );
}

/** Generic block reveal. variant: undefined | 'fade' | 'scale' */
export function Reveal({ as = 'div', variant, delay = 0, className = '', children, ...rest }) {
  return createElement(
    as,
    { 'data-reveal': variant || '', className, style: { '--d': `${delay}s`, ...(rest.style || {}) }, ...rest },
    children,
  );
}

/** Responsive image with clip reveal. `img` comes from the assets registry. */
export function RevealImage({ img, alt, className = '', sizes = '(max-width: 760px) 100vw, 60vw', eager = false, imgClass = 'cover', ...rest }) {
  return (
    <div className={`img-reveal ${className}`} data-observe="" {...rest}>
      <img
        src={img.src}
        srcSet={img.srcSet}
        sizes={img.srcSet ? sizes : undefined}
        width={img.width}
        height={img.height}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={imgClass}
      />
    </div>
  );
}
