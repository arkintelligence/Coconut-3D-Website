import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { drawCanLabel } from './Can';
import { prefersReducedMotion } from '../hooks/useReducedMotion';
import './Can3D.css';

/**
 * WebGL hero can. Lit cylinder with a canvas-drawn label, slow spin,
 * pointer-reactive tilt and a gentle float. Pauses when off-screen,
 * caps DPR at 2 and disposes everything on unmount.
 */
export default function Can3D({ product, onReady }) {
  const mount = useRef(null);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return; // no WebGL — the SVG fallback stays visible
    }
    const reduced = prefersReducedMotion();
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    camera.position.set(0, 0.1, 12.5);

    const group = new THREE.Group();
    scene.add(group);

    const R = 1, H = 3.6;
    const labelTex = new THREE.CanvasTexture(drawCanLabel(product));
    labelTex.colorSpace = THREE.SRGBColorSpace;
    labelTex.anisotropy = 4;
    const bodyMat = new THREE.MeshStandardMaterial({ map: labelTex, metalness: 0.35, roughness: 0.38 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xd9dcd6, metalness: 0.9, roughness: 0.25 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 96, 1, true), bodyMat);
    group.add(body);
    // shoulders + rims (lathe profile)
    const topProfile = [
      new THREE.Vector2(R, 0), new THREE.Vector2(R * 0.98, 0.12), new THREE.Vector2(R * 0.86, 0.3),
      new THREE.Vector2(R * 0.86, 0.38), new THREE.Vector2(R * 0.8, 0.38), new THREE.Vector2(R * 0.78, 0.33), new THREE.Vector2(0, 0.33),
    ];
    const top = new THREE.Mesh(new THREE.LatheGeometry(topProfile, 96), metalMat);
    top.position.y = H / 2;
    group.add(top);
    const bottom = top.clone();
    bottom.rotation.x = Math.PI;
    bottom.position.y = -H / 2;
    bottom.scale.set(1, 0.6, 1);
    group.add(bottom);
    // pull tab
    const tab = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.05, 12, 32), metalMat);
    tab.rotation.x = Math.PI / 2;
    tab.position.set(0, H / 2 + 0.36, 0.25);
    group.add(tab);

    scene.add(new THREE.HemisphereLight(0xfff6e5, 0x2f5a3a, 1.3));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(-4, 5, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xc9dc7a, 1.6);
    rim.position.set(5, 1, -3);
    scene.add(rim);

    group.rotation.z = -0.16;

    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = width / height < 0.75 ? 30 : 26;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) loop(); });
    io.observe(el);

    let raf = 0;
    const t0 = performance.now();
    let entered = false;
    const loop = () => {
      cancelAnimationFrame(raf);
      if (!visible) return;
      const t = (performance.now() - t0) / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      // entrance: rise and unspin over the first ~1.6s
      const k = Math.min(1, t / 1.6);
      const ease = 1 - Math.pow(1 - k, 4);
      group.position.y = (1 - ease) * -3 + Math.sin(t * 1.2) * 0.08;
      // label centre (u = .25) faces the camera at -PI/2; sway rather than spin so the front reads
      group.rotation.y = -Math.PI / 2 + (1 - ease) * -2.4 + Math.sin(t * 0.45) * 0.55 + pointer.x * 0.45;
      group.rotation.x = pointer.y * 0.15;
      group.rotation.z = -0.16 + pointer.x * -0.05;
      renderer.render(scene, camera);
      if (!entered) { entered = true; onReady && onReady(); }
      if (!reduced) raf = requestAnimationFrame(loop);
    };
    // wait for fonts so the label texture uses the brand faces
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
      const fresh = drawCanLabel(product);
      labelTex.image = fresh;
      labelTex.needsUpdate = true;
      loop();
    });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
      bodyMat.dispose(); metalMat.dispose(); labelTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [product, onReady]);

  return <div ref={mount} className="can3d" aria-hidden="true" />;
}
