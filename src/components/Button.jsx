import { Link } from 'react-router-dom';
import './Button.css';

/** Pill CTA with a rolling-label hover. Renders <Link>, <a> or <button>. */
export default function Button({ to, href, children, variant = 'dark', size, className = '', ...rest }) {
  const cls = `btn btn--${variant} ${size ? `btn--${size}` : ''} ${className}`;
  const inner = (
    <>
      <span className="btn__roll" aria-hidden="true">
        <span>{children}</span>
        <span>{children}</span>
      </span>
      <span className="sr-only">{children}</span>
      <span className="btn__dot" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    </>
  );
  if (to) return <Link to={to} className={cls} {...rest}>{inner}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{inner}</a>;
  return <button type="button" className={cls} {...rest}>{inner}</button>;
}
