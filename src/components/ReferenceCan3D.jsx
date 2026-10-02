import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Frame-rate independent easing towards a target (same feel at 60Hz and 120Hz).
const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt));

export default function ReferenceCan3D({ texture, className = '', tilt = 0, rotateOnHover = false, scrollTurns = 0, cameraDistance = 9 }) {
  const mount = useRef(null);
  useEffect(() => {
    const host = mount.current;
    if (!host) return undefined;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(1.75, window.devicePixelRatio || 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0, 0);
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, .1, 50);
    camera.position.set(0, 0, cameraDistance);
    const group = new THREE.Group();
    scene.add(group, new THREE.HemisphereLight(0xfff8e8, 0x463721, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 3.5);
    key.position.set(-4, 6, 6); scene.add(key);
    let model;
    let map;
    let raf = 0;
    let visible = true;
    const pointer = { x: 0, tx: 0 };
    let hoverTurn = 0;
    let hoverTarget = 0;
    let scrollTurn = 0;
    let lastFrame = 0;
    // The scroll progress lives in an ancestor's inline style. Reading it from there avoids a
    // getComputedStyle() call (and a forced style recalculation) on every frame while scrolling.
    let progressHost = null;
    if (scrollTurns) {
      for (let node = host; node; node = node.parentElement) {
        if (node.style?.getPropertyValue('--flv-p') !== '' || node.classList?.contains('flv')) { progressHost = node; break; }
      }
    }
    const onMove = (event) => { pointer.tx = (event.clientX / innerWidth - .5) * 2; };
    // Reference: on hover the can makes one full turn (back side passes the viewer) and settles leaning.
    const onEnter = () => { if (rotateOnHover) hoverTarget = Math.PI * 2; };
    const onLeave = () => { if (rotateOnHover) hoverTarget = 0; };
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize); ro.observe(host); resize();
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }); io.observe(host);
    Promise.all([
      new GLTFLoader().loadAsync('/models/can1.glb'),
      new THREE.TextureLoader().loadAsync(texture),
    ]).then(([gltf, textureMap]) => {
      model = gltf.scene; map = textureMap; map.colorSpace = THREE.SRGBColorSpace; map.flipY = true;
      model.traverse((object) => {
        if (!object.isMesh || !object.material) return;
        object.material = object.material.clone();
        object.material.envMapIntensity = .45;
        if (object.name === 'Shell') { object.material.map = map; object.material.needsUpdate = true; }
      });
      model.rotation.set(0, 0, 0);
      model.scale.setScalar(1);
      group.add(model);
    });
    const start = performance.now();
    const loop = (now) => {
      const dt = lastFrame ? Math.min(.1, (now - lastFrame) / 1000) : 1 / 60;
      lastFrame = now;
      if (visible && model) {
        const t = (now - start) / 1000;
        pointer.x = damp(pointer.x, pointer.tx, 2.45, dt);
        hoverTurn = damp(hoverTurn, hoverTarget, 4.6, dt);
        group.position.y = Math.sin(t * 1.05) * .07;
        group.rotation.z = THREE.MathUtils.degToRad(tilt) + pointer.x * .07 + (hoverTurn / (Math.PI * 2)) * THREE.MathUtils.degToRad(5);
        if (scrollTurns) {
          const p = Number.parseFloat(progressHost?.style.getPropertyValue('--flv-p')) || 0;
          scrollTurn = damp(scrollTurn, p * Math.PI * 2 * scrollTurns, 6.5, dt);
        }
        group.rotation.y = hoverTurn + scrollTurn + Math.sin(t * .42) * .08;
        renderer.render(scene, camera);
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerenter', onEnter);
    host.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); window.removeEventListener('pointermove', onMove); host.removeEventListener('pointerenter', onEnter); host.removeEventListener('pointerleave', onLeave);
      scene.traverse((o) => { o.geometry?.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); });
      map?.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, [texture, tilt, rotateOnHover, scrollTurns, cameraDistance]);
  return <div ref={mount} className={`reference-can ${className}`} aria-hidden="true" />;
}
