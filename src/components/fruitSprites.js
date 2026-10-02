/**
 * Procedural fruit sprites for the slicing game. Each fruit is drawn once to
 * an offscreen canvas (whole + cut face) so the game loop only blits images.
 */
const TAU = Math.PI * 2;

const defs = {
  coconut: {
    r: 1, skin: '#754225', skinDark: '#382013', flesh: '#fbf8f1', fleshEdge: '#6b4a2f', juice: '#f3f7ee', points: 2,
    whole(g, R) {
      const grd = g.createRadialGradient(-R * .35, -R * .35, R * .1, 0, 0, R);
      grd.addColorStop(0, '#a86c3d'); grd.addColorStop(.58, this.skin); grd.addColorStop(1, this.skinDark);
      g.fillStyle = grd; g.beginPath(); g.ellipse(0, 0, R * .94, R, 0, 0, TAU); g.fill();
      g.fillStyle = '#6b4a2f'; g.beginPath(); g.arc(0, -R * .95, R * .14, 0, TAU); g.fill();
    },
    face(g, R) {
      g.fillStyle = this.fleshEdge; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill();
      g.fillStyle = this.flesh; g.beginPath(); g.arc(0, 0, R * .82, 0, TAU); g.fill();
      g.fillStyle = '#e4efe2'; g.beginPath(); g.arc(0, 0, R * .55, 0, TAU); g.fill();
    },
  },
  pineapple: {
    r: .95, juice: '#f7cf4a', points: 1,
    whole(g, R) {
      g.fillStyle = '#3f7d4e';
      for (let i = -3; i <= 3; i++) {
        g.save(); g.rotate(i * .28); g.beginPath(); g.moveTo(-R * .12, -R * .7); g.quadraticCurveTo(0, -R * 1.7, R * .12, -R * .7); g.fill(); g.restore();
      }
      g.fillStyle = '#f2b632'; g.beginPath(); g.ellipse(0, R * .1, R * .78, R * .92, 0, 0, TAU); g.fill();
      g.strokeStyle = '#b9800f'; g.lineWidth = R * .05; g.save(); g.beginPath(); g.ellipse(0, R * .1, R * .78, R * .92, 0, 0, TAU); g.clip();
      for (let k = -4; k <= 4; k++) { g.beginPath(); g.moveTo(k * R * .3 - R, -R); g.lineTo(k * R * .3 + R, R * 1.2); g.stroke(); g.beginPath(); g.moveTo(k * R * .3 + R, -R); g.lineTo(k * R * .3 - R, R * 1.2); g.stroke(); }
      g.restore();
    },
    face(g, R) {
      g.fillStyle = '#d9a21c'; g.beginPath(); g.arc(0, 0, R * .85, 0, TAU); g.fill();
      g.fillStyle = '#ffe07a'; g.beginPath(); g.arc(0, 0, R * .72, 0, TAU); g.fill();
      g.fillStyle = '#f6c843'; g.beginPath(); g.arc(0, 0, R * .22, 0, TAU); g.fill();
    },
  },
  watermelon: {
    r: 1.1, juice: '#ea5b63', points: 1,
    whole(g, R) {
      g.fillStyle = '#3f7d4e'; g.beginPath(); g.ellipse(0, 0, R, R * .86, 0, 0, TAU); g.fill();
      g.strokeStyle = '#25502f'; g.lineWidth = R * .1;
      for (let i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(i * R * .34, 0, R * .1, R * .84, 0, 0, TAU); g.stroke(); }
    },
    face(g, R) {
      g.fillStyle = '#3f7d4e'; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill();
      g.fillStyle = '#d6efc0'; g.beginPath(); g.arc(0, 0, R * .9, 0, TAU); g.fill();
      g.fillStyle = '#ea5b63'; g.beginPath(); g.arc(0, 0, R * .8, 0, TAU); g.fill();
      g.fillStyle = '#2a1a0f';
      for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; g.beginPath(); g.ellipse(Math.cos(a) * R * .48, Math.sin(a) * R * .48, R * .05, R * .09, a, 0, TAU); g.fill(); }
    },
  },
  mango: {
    r: .9, juice: '#f9a825', points: 1,
    whole(g, R) {
      const grd = g.createRadialGradient(-R * .3, -R * .3, R * .1, 0, 0, R * 1.1);
      grd.addColorStop(0, '#ffd166'); grd.addColorStop(.6, '#f59e2b'); grd.addColorStop(1, '#d9480f');
      g.fillStyle = grd; g.beginPath(); g.ellipse(0, 0, R * .82, R, .5, 0, TAU); g.fill();
      g.fillStyle = '#3f7d4e'; g.beginPath(); g.ellipse(R * .2, -R * .95, R * .3, R * .12, -.5, 0, TAU); g.fill();
    },
    face(g, R) {
      g.fillStyle = '#e07b0c'; g.beginPath(); g.ellipse(0, 0, R * .82, R, .5, 0, TAU); g.fill();
      g.fillStyle = '#ffc04a'; g.beginPath(); g.ellipse(0, 0, R * .72, R * .9, .5, 0, TAU); g.fill();
      g.fillStyle = '#f5e7b8'; g.beginPath(); g.ellipse(0, 0, R * .25, R * .5, .5, 0, TAU); g.fill();
    },
  },
  guava: {
    r: .85, juice: '#f08a8f', points: 1,
    whole(g, R) {
      const grd = g.createRadialGradient(-R * .3, -R * .3, R * .1, 0, 0, R);
      grd.addColorStop(0, '#d7e98f'); grd.addColorStop(1, '#7fa043');
      g.fillStyle = grd; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill();
    },
    face(g, R) {
      g.fillStyle = '#9fbf5a'; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill();
      g.fillStyle = '#f08a8f'; g.beginPath(); g.arc(0, 0, R * .86, 0, TAU); g.fill();
      g.fillStyle = '#e05f6a'; g.beginPath(); g.arc(0, 0, R * .42, 0, TAU); g.fill();
      g.fillStyle = '#f6efe2';
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; g.beginPath(); g.arc(Math.cos(a) * R * .28, Math.sin(a) * R * .28, R * .05, 0, TAU); g.fill(); }
    },
  },
  lychee: {
    r: .7, juice: '#f7e6ea', points: 1,
    whole(g, R) {
      g.fillStyle = '#c94a62'; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill();
      g.fillStyle = '#9e2f47';
      for (let i = 0; i < 40; i++) { const a = Math.random() * TAU, d = Math.random() * R * .9; g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d, R * .07, 0, TAU); g.fill(); }
    },
    face(g, R) {
      g.fillStyle = '#c94a62'; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill();
      g.fillStyle = '#fbf4f2'; g.beginPath(); g.arc(0, 0, R * .86, 0, TAU); g.fill();
      g.fillStyle = '#5a3420'; g.beginPath(); g.ellipse(0, 0, R * .28, R * .4, 0, 0, TAU); g.fill();
    },
  },
  strawberry: {
    r: .72, juice: '#df3349', points: 1,
    whole(g, R) {
      g.fillStyle = '#3f7d4e';
      for (let i = -2; i <= 2; i++) { g.save(); g.rotate(i * .34); g.beginPath(); g.moveTo(-R * .08, -R * .65); g.quadraticCurveTo(0, -R * 1.18, R * .1, -R * .62); g.fill(); g.restore(); }
      const grd = g.createRadialGradient(-R * .28, -R * .3, R * .08, 0, 0, R);
      grd.addColorStop(0, '#ff7880'); grd.addColorStop(.55, '#df3349'); grd.addColorStop(1, '#9e1830');
      g.fillStyle = grd; g.beginPath(); g.moveTo(0, R); g.bezierCurveTo(-R * .95, R * .25, -R * .8, -R * .62, 0, -R * .68); g.bezierCurveTo(R * .8, -R * .62, R * .95, R * .25, 0, R); g.fill();
      g.fillStyle = '#ffe7a6';
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, d = R * (.28 + (i % 3) * .13); g.beginPath(); g.ellipse(Math.cos(a) * d, Math.sin(a) * d * .72, R * .035, R * .07, a, 0, TAU); g.fill(); }
    },
    face(g, R) {
      g.fillStyle = '#a51d32'; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill();
      g.fillStyle = '#f56b74'; g.beginPath(); g.arc(0, 0, R * .86, 0, TAU); g.fill();
      g.fillStyle = '#f8c5b5'; g.beginPath(); g.arc(0, 0, R * .25, 0, TAU); g.fill();
    },
  },
};

export const fruitTypes = ['coconut', 'watermelon', 'strawberry'];

/** Builds { whole, halfA, halfB, radius, juice, points } per fruit at the given pixel radius. */
export function buildSprites(baseRadius) {
  const out = {};
  for (const [key, d] of Object.entries(defs)) {
    const R = Math.round(baseRadius * d.r);
    const size = Math.ceil(R * 3.6);
    const mk = () => { const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d'); g.translate(size / 2, size / 2); return [c, g]; };
    const [whole, gw] = mk();
    d.whole(gw, R);
    // a half: the cut face clipped to one side, plus a sliver of skin for depth
    const half = (side) => {
      const [c, g] = mk();
      g.save(); g.beginPath(); g.rect(side < 0 ? -size : 0, -size, size, size * 2); g.clip();
      g.save(); g.translate(side * R * .06, 0); d.whole(g, R); g.restore();
      d.face(g, R * .94);
      g.restore();
      return c;
    };
    out[key] = { whole, halfA: half(-1), halfB: half(1), radius: R, size, juice: d.juice, points: d.points };
  }
  return out;
}
