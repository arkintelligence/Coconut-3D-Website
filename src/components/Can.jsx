import { memo } from 'react';
import { images } from '../assets';

/**
 * Illustrated can for a flavour. Used anywhere a product shot is needed.
 * If a product has a real `image`, that photo is shown instead.
 */
function Can({ product, className = '', title }) {
  if (product.image) {
    return <img src={product.image} alt={title || `${product.name} can`} className={className} loading="lazy" />;
  }
  const id = product.id;
  const fruit = images.fruits[product.fruit];
  return (
    <svg className={className} viewBox="0 0 220 470" role="img" aria-label={title || `${product.name} can of Palmo coconut water`}>
      <defs>
        <linearGradient id={`body-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor={product.deep} />
          <stop offset=".18" stopColor={product.color} />
          <stop offset=".34" stopColor="#ffffff" stopOpacity=".55" />
          <stop offset=".42" stopColor={product.color} />
          <stop offset=".85" stopColor={product.deep} />
          <stop offset="1" stopColor={product.ink} />
        </linearGradient>
        <linearGradient id={`metal-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#8d928e" />
          <stop offset=".35" stopColor="#f1f2ef" />
          <stop offset=".7" stopColor="#b9bdb8" />
          <stop offset="1" stopColor="#7a7f7b" />
        </linearGradient>
        <linearGradient id={`shade-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".28" />
          <stop offset=".25" stopColor="#000" stopOpacity="0" />
          <stop offset=".7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".35" />
        </linearGradient>
        <clipPath id={`clip-${id}`}><rect x="14" y="30" width="192" height="412" rx="20" /></clipPath>
      </defs>
      <ellipse cx="110" cy="455" rx="88" ry="10" fill="#000" opacity=".14" />
      <rect x="14" y="30" width="192" height="412" rx="20" fill={`url(#body-${id})`} />
      <g clipPath={`url(#clip-${id})`}>
        <rect x="14" y="150" width="192" height="168" fill="#f6efe2" opacity=".96" />
        <text x="110" y="122" textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize="58" fill="#f6efe2" letterSpacing="2">PALMO</text>
        <image href={fruit} x="62" y="160" width="96" height="96" preserveAspectRatio="xMidYMid meet" />
        <text x="110" y="284" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontStyle="italic" fontSize="21" fill={product.ink}>{product.short === 'Pure' ? 'Natural Pure' : product.short}</text>
        <text x="110" y="304" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontSize="9.5" fontWeight="700" letterSpacing="2.6" fill={product.ink} opacity=".7">COCONUT WATER</text>
        <text x="110" y="378" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontSize="10" fontWeight="600" letterSpacing="2" fill="#f6efe2" opacity=".9">NO ADDED SUGAR</text>
        <text x="110" y="396" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontSize="10" fontWeight="600" letterSpacing="2" fill="#f6efe2" opacity=".9">330 ML</text>
        <rect x="14" y="30" width="192" height="412" fill={`url(#shade-${id})`} />
      </g>
      <rect x="20" y="16" width="180" height="22" rx="10" fill={`url(#metal-${id})`} />
      <rect x="20" y="434" width="180" height="18" rx="8" fill={`url(#metal-${id})`} />
    </svg>
  );
}

export default memo(Can);

/** Flat label artwork drawn to a 2D canvas — used as the texture on the 3D can. */
export function drawCanLabel(product, w = 1024, h = 512) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = product.color; g.fillRect(0, 0, w, h);
  // subtle vertical ink band on the back
  g.fillStyle = product.deep; g.globalAlpha = .35; g.fillRect(w * .62, 0, w * .38, h); g.globalAlpha = 1;
  // cream label band
  g.fillStyle = '#f6efe2'; g.fillRect(0, h * .36, w, h * .38);
  g.textAlign = 'center';
  g.fillStyle = '#f6efe2';
  g.font = `${h * .2}px Anton, Impact, sans-serif`;
  g.fillText('PALMO', w * .25, h * .3);
  g.font = `600 ${h * .035}px "DM Sans", sans-serif`;
  g.fillText('NO ADDED SUGAR  ·  330 ML', w * .25, h * .88);
  g.fillStyle = product.ink;
  g.font = `italic ${h * .09}px Fraunces, Georgia, serif`;
  g.fillText(product.name, w * .25, h * .6);
  g.font = `700 ${h * .032}px "DM Sans", sans-serif`;
  g.fillText('C O C O N U T   W A T E R', w * .25, h * .68);
  // back panel copy
  g.fillStyle = product.ink;
  g.font = `700 ${h * .03}px "DM Sans", sans-serif`;
  g.fillText('PRESSED WITHIN A DAY OF HARVEST', w * .76, h * .5);
  g.font = `italic ${h * .06}px Fraunces, Georgia, serif`;
  g.fillText('made under the sun', w * .76, h * .6);
  return c;
}
