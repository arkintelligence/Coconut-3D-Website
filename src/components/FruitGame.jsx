import { useCallback, useEffect, useRef, useState } from 'react';
import { buildSprites, fruitTypes } from './fruitSprites';
import { prefersReducedMotion } from '../hooks/useReducedMotion';
import './FruitGame.css';

const ROUND_SECONDS = 45;
const BEST_KEY = 'palmo.slice.best';

const readBest = () => { try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; } };
const writeBest = (v) => { try { localStorage.setItem(BEST_KEY, String(v)); } catch { /* ignore */ } };

/** Distance from point P to segment AB. */
function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len = dx * dx + dy * dy || 1;
  let t = ((px - ax) * dx + (py - ay) * dy) / len;
  t = Math.max(0, Math.min(1, t));
  const x = ax + t * dx - px, y = ay + t * dy - py;
  return Math.sqrt(x * x + y * y);
}

/**
 * Canvas fruit-slicing game. All simulation lives in refs and a single rAF
 * loop; React state only holds the HUD (score/time/phase), updated at most
 * a few times per second. The loop sleeps whenever the canvas is off-screen.
 */
export default function FruitGame() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const sim = useRef(null);
  const [phase, setPhase] = useState('idle'); // idle | playing | paused | over
  const [hud, setHud] = useState({ score: 0, time: ROUND_SECONDS, best: readBest(), combo: 0 });
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // ---------- setup + loop ----------
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx = canvas.getContext('2d');
    const reduced = prefersReducedMotion();
    const S = {
      w: 0, h: 0, dpr: 1, sprites: null, fruits: [], halves: [], drops: [], texts: [], trail: [],
      spawnT: 0, score: 0, timeLeft: ROUND_SECONDS, lastHudPush: 0, combo: 0, comboT: 0, visible: false, raf: 0, last: 0, shake: 0,
    };
    sim.current = S;

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      S.dpr = Math.min(2, window.devicePixelRatio || 1);
      S.w = r.width; S.h = r.height;
      canvas.width = Math.round(S.w * S.dpr); canvas.height = Math.round(S.h * S.dpr);
      canvas.style.width = `${S.w}px`; canvas.style.height = `${S.h}px`;
      const base = Math.max(26, Math.min(42, S.w / 24));
      S.sprites = buildSprites(base * S.dpr);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    const spawn = (attract = false) => {
      const type = fruitTypes[(Math.random() * fruitTypes.length) | 0];
      const sp = S.sprites[type];
      const x = S.w * (0.15 + Math.random() * 0.7);
      const apex = S.h * (attract ? 0.02 + Math.random() * 0.18 : 0.03 + Math.random() * 0.2);
      const g = attract ? 520 : 900;
      const vy = -Math.sqrt(2 * g * (S.h - apex + 60));
      const vx = (S.w / 2 - x) * (0.25 + Math.random() * 0.5) / 1.4;
      S.fruits.push({ type, x, y: S.h + 60, vx, vy, g, rot: Math.random() * 6, vr: (Math.random() - .5) * 4, r: sp.radius / S.dpr, attract });
    };

    const slice = (f, ax, ay, bx, by) => {
      const sp = S.sprites[f.type];
      const ang = Math.atan2(by - ay, bx - ax);
      const nx = -Math.sin(ang), ny = Math.cos(ang);
      const push = 140;
      for (const side of [-1, 1]) {
        S.halves.push({ img: side < 0 ? sp.halfA : sp.halfB, x: f.x, y: f.y, vx: f.vx * .5 + nx * push * side, vy: f.vy * .3 + ny * push * side - 120, g: f.g, rot: ang + Math.PI / 2, vr: side * (2 + Math.random() * 2), life: 1, size: sp.size / S.dpr });
      }
      const n = reduced ? 6 : 16;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, v = 80 + Math.random() * 320;
        S.drops.push({ x: f.x, y: f.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, r: 2 + Math.random() * 5, life: 1, c: sp.juice });
      }
      // juice splat that lingers on the "wall"
      S.drops.push({ x: f.x, y: f.y, vx: 0, vy: 0, r: f.r * 0.9, life: 1, c: sp.juice, splat: true });
      const now = performance.now();
      S.combo = now - S.comboT < 280 ? S.combo + 1 : 1;
      S.comboT = now;
      const gained = sp.points * (S.combo >= 3 ? 2 : 1);
      S.score += gained;
      S.texts.push({ x: f.x, y: f.y - f.r, t: S.combo >= 3 ? `+${gained} combo x${S.combo}` : `+${gained}`, life: 1 });
      S.shake = S.combo >= 3 ? 6 : 0;
      if (f.attract) setHud((h) => ({ ...h, score: S.score, combo: S.combo }));
    };

    const step = (dt) => {
      const playing = phaseRef.current === 'playing';
      const idle = phaseRef.current === 'idle' || phaseRef.current === 'over';
      if (playing) {
        S.timeLeft -= dt;
        S.spawnT -= dt;
        const rate = 0.95 - Math.min(0.5, (ROUND_SECONDS - S.timeLeft) / ROUND_SECONDS * 0.5);
        if (S.spawnT <= 0) {
          const burst = Math.random() < 0.35 ? 4 : Math.random() < 0.7 ? 3 : 2;
          for (let i = 0; i < burst; i++) spawn();
          S.spawnT = rate + Math.random() * 0.4;
        }
        if (S.timeLeft <= 0) {
          S.timeLeft = 0;
          const best = Math.max(readBest(), S.score);
          writeBest(best);
          setHud({ score: S.score, time: 0, best, combo: 0 });
          setPhase('over');
        }
      } else if (idle && !reduced) {
        S.spawnT -= dt;
        if (S.spawnT <= 0 && S.fruits.length < 8) {
          const burst = Math.random() < 0.45 ? 2 : 1;
          for (let i = 0; i < burst; i++) spawn(true);
          S.spawnT = 0.55 + Math.random() * 0.45;
        }
      }
      for (const f of S.fruits) { f.vy += f.g * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vr * dt; }
      S.fruits = S.fruits.filter((f) => f.y < S.h + 120);
      for (const h of S.halves) { h.vy += h.g * dt; h.x += h.vx * dt; h.y += h.vy * dt; h.rot += h.vr * dt; }
      S.halves = S.halves.filter((h) => h.y < S.h + 200);
      for (const d of S.drops) {
        if (d.splat) { d.life -= dt * 0.35; continue; }
        d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.life -= dt * 1.4;
      }
      S.drops = S.drops.filter((d) => d.life > 0);
      for (const t of S.texts) { t.y -= 50 * dt; t.life -= dt * 1.2; }
      S.texts = S.texts.filter((t) => t.life > 0);
      const now = performance.now();
      S.trail = S.trail.filter((p) => now - p.t < 160);
      S.shake *= 0.85;
      if (playing && now - S.lastHudPush > 200) {
        S.lastHudPush = now;
        setHud((h) => (h.score === S.score && Math.ceil(h.time) === Math.ceil(S.timeLeft) ? h : { ...h, score: S.score, time: S.timeLeft, combo: S.combo }));
      }
    };

    const draw = () => {
      const { dpr } = S;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const sx = S.shake ? (Math.random() - .5) * S.shake : 0;
      ctx.setTransform(dpr, 0, 0, dpr, sx * dpr, sx * dpr);
      for (const d of S.drops) if (d.splat) { ctx.globalAlpha = d.life * 0.16; ctx.fillStyle = d.c; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1;
      for (const f of S.fruits) {
        const sp = S.sprites[f.type];
        const s = sp.size / dpr;
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.rot); ctx.drawImage(sp.whole, -s / 2, -s / 2, s, s); ctx.restore();
      }
      for (const h of S.halves) {
        ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(h.rot); ctx.drawImage(h.img, -h.size / 2, -h.size / 2, h.size, h.size); ctx.restore();
      }
      for (const d of S.drops) if (!d.splat) { ctx.globalAlpha = Math.max(0, d.life); ctx.fillStyle = d.c; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1;
      // blade trail: tapered, fading
      const tr = S.trail;
      if (tr.length > 1) {
        const now = performance.now();
        for (let i = 1; i < tr.length; i++) {
          const k = 1 - (now - tr[i].t) / 160;
          ctx.strokeStyle = `rgba(255,253,248,${Math.max(0, k)})`;
          ctx.lineWidth = Math.max(1, k * 9);
          ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(tr[i - 1].x, tr[i - 1].y); ctx.lineTo(tr[i].x, tr[i].y); ctx.stroke();
        }
      }
      ctx.textAlign = 'center';
      for (const t of S.texts) {
        ctx.globalAlpha = Math.max(0, t.life);
        ctx.fillStyle = '#c9dc7a';
        ctx.font = `${t.t.length > 4 ? 28 : 40}px Anton, Impact, sans-serif`;
        ctx.fillText(t.t.toUpperCase(), t.x, t.y);
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t) => {
      S.raf = 0;
      if (!S.visible) return;
      const dt = Math.min(0.033, (t - (S.last || t)) / 1000);
      S.last = t;
      if (phaseRef.current !== 'paused') step(dt);
      draw();
      S.raf = requestAnimationFrame(loop);
    };
    S.kick = () => { if (!S.raf && S.visible) { S.last = 0; S.raf = requestAnimationFrame(loop); } };

    const io = new IntersectionObserver(([e]) => {
      S.visible = e.isIntersecting;
      if (S.visible) S.kick();
      else if (phaseRef.current === 'playing') setPhase('paused');
    }, { threshold: 0.15 });
    io.observe(wrap);

    // ---------- pointer / touch ----------
    const pos = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    let down = false;
    const onDown = (e) => { down = true; const p = pos(e); S.trail = [{ ...p, t: performance.now() }]; };
    const onMove = (e) => {
      // mouse slices on hover; touch/pen only while pressed
      if (e.pointerType !== 'mouse' && !down) return;
      const p = pos(e);
      const now = performance.now();
      const prev = S.trail[S.trail.length - 1];
      S.trail.push({ ...p, t: now });
      if (!prev) return;
      const dist = Math.hypot(p.x - prev.x, p.y - prev.y);
      if (dist < 4) return; // needs a real swipe
      const ph = phaseRef.current;
      if (ph === 'paused') return;
      for (const f of S.fruits) {
        if (f.dead) continue;
        if (ph === 'playing' && f.attract) continue;
        if (segDist(f.x, f.y, prev.x, prev.y, p.x, p.y) < f.r * 0.95) { f.dead = true; slice(f, prev.x, prev.y, p.x, p.y); }
      }
      S.fruits = S.fruits.filter((f) => !f.dead);
    };
    const onUp = () => { down = false; };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    return () => {
      cancelAnimationFrame(S.raf);
      io.disconnect(); ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, []);

  const start = useCallback(() => {
    const S = sim.current;
    S.fruits = []; S.halves = []; S.drops = []; S.texts = [];
    S.score = 0; S.timeLeft = ROUND_SECONDS; S.spawnT = 0.3; S.combo = 0;
    setHud((h) => ({ ...h, score: 0, time: ROUND_SECONDS, combo: 0 }));
    setPhase('playing');
    S.kick();
  }, []);
  const togglePause = () => setPhase((p) => (p === 'playing' ? 'paused' : p === 'paused' ? 'playing' : p));
  const reset = () => {
    const S = sim.current;
    S.fruits = []; S.halves = []; S.drops = []; S.texts = []; S.score = 0; S.timeLeft = ROUND_SECONDS;
    setHud((h) => ({ ...h, score: 0, time: ROUND_SECONDS, combo: 0 }));
    setPhase('idle');
  };

  return (
    <div className={`fgame fgame--${phase}`}>
      <div className="fgame__hud" aria-live="polite">
        <div><span className="fgame__k">Fruit score</span><span className="fgame__v display">{String(hud.score).padStart(3, '0')}</span></div>
      </div>

      <div ref={wrapRef} className="fgame__stage">
        <canvas ref={canvasRef} className="fgame__canvas" aria-label="Fruit slicing game area. Swipe across flying fruit to slice it." role="img" />
        {phase === 'paused' && (
          <div className="fgame__overlay fgame__overlay--dim">
            <h3 className="display fgame__title">Frozen.</h3>
            <button type="button" className="fgame__play" onClick={togglePause}>Resume</button>
          </div>
        )}
        {phase === 'over' && (
          <div className="fgame__overlay fgame__overlay--dim">
            <p className="eyebrow">Time’s up</p>
            <h3 className="display fgame__title">{hud.score} sliced.</h3>
            <p className="fgame__sub">{hud.score >= hud.best && hud.score > 0 ? 'New best — that’s a fresh pour.' : `Best so far: ${hud.best}.`}</p>
            <button type="button" className="fgame__play" onClick={start}>Play again</button>
          </div>
        )}
      </div>
    </div>
  );
}
