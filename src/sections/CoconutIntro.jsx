import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { prefersReducedMotion } from '../hooks/useReducedMotion';
import { useLoaded } from '../context/LoadedContext';
import './CoconutIntro.css';

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const smoother = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const backOut = (t) => { const c1 = 1.70158; return 1 + (c1 + 1) * (t - 1) ** 3 + c1 * (t - 1) ** 2; };
const range = (value, start, end) => clamp((value - start) / (end - start));
const segment = (value, start, end) => smooth(range(value, start, end));
const deg = THREE.MathUtils.degToRad;
// Frame-rate independent exponential approach (what a GSAP `scrub` / Lenis lerp does).
const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt));
// How quickly the sequence catches up with the scrollbar. ~95% settled in about half a second.
const SCROLL_DAMPING = 6.5;
const CAN_FRONT = -0.08 * Math.PI; // can rotation that faces the label to the viewer
const POINTER_DAMPING = 2.2;

/*
 * The sequence, measured from the reference recording, in viewport heights of scroll (d).
 * Text layers move 1:1 with the scroll (as normal page content does on the reference) while the
 * coconut stays in the fixed canvas and changes pose.
 */
const T = {
  vertical: [0, 0.68], // hero pose -> coconut stands upright, a little above centre
  sourceAnchor: 1.27, // "The real source of every sip" sits at its designed position here
  capOff: [0.92, 1.38], // top shell lifts straight up and leaves the screen
  bowl: [1.0, 1.5], // lower shell settles at centre, tipped towards the viewer to show the water
  discs: { start: 1.72, stagger: 0.26, travel: 0.98 }, // four discs, alternating left/right arcs
  bowlTurn: [3.3, 3.85], // bowl turns its open side up-left
  capIn: [3.55, 4.15], // top shell flies back in from the upper left and closes
  horizontal: [4.15, 4.85], // whole coconut rotates to lie horizontally
  ui: [4.3, 4.5], // progress UI fades in (000)
  sequence: [4.85, 6.65], // progress 000 -> 100: shake, crack, split, can
  textOut: 6.75, // product copy and progress UI start scrolling away
  canSpin: 6.85, // can starts turning to show its back
  end: 7.6, // the next section ("Keep sipping") starts rising over the pinned stage
};

export default function CoconutIntro() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const loaded = useLoaded();
  const loadedRef = useRef(loaded);
  loadedRef.current = loaded;

  useEffect(() => {
    const section = sectionRef.current;
    const host = canvasRef.current;
    if (!section || !host) return undefined;

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    const reduced = prefersReducedMotion();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.set(0, 0, 5);
    const pointerTilt = new THREE.Group();
    const model = new THREE.Group(); // the coconut: position = screen placement, quaternion = pose
    const inner = new THREE.Group(); // holds the glTF, re-centred so the coconut turns about its middle
    const canRig = new THREE.Group();
    pointerTilt.add(model, canRig);
    model.add(inner);
    const keyLight = new THREE.DirectionalLight(0xfff7e1, 1.8);
    keyLight.position.set(-3.5, 4, 5);
    const rimLight = new THREE.DirectionalLight(0xe8f3ff, 1.05);
    rimLight.position.set(4, 1.5, 3);
    scene.add(pointerTilt, new THREE.AmbientLight(0xffffff, 0.55), keyLight, rimLight);

    let left;
    let right;
    let liquid;
    let liquidShader;
    let can;
    let ready = false;
    let introStartedAt = 0;
    let targetProgress = 0; // where the scrollbar is
    let scrollProgress = 0; // where the animation is (damped towards targetProgress)
    let lastProgressWritten = -1;
    let lastFrameAt = 0;
    let raf = 0;
    let inView = true;
    let pinHeight = innerHeight;
    let pinWidth = innerWidth;
    let scrollSpan = 1; // scrollable distance of the section, in viewport heights
    const poses = {};
    const pointer = { x: 0, y: 0, cx: 0, cy: 0 };
    const pin = section.querySelector('.coconut-intro__pin');
    const hero = section.querySelector('.coconut-intro__hero');
    const source = section.querySelector('.coconut-intro__source');
    const sequenceUi = section.querySelector('.coconut-intro__sequence-ui');
    const productCopy = section.querySelector('.coconut-intro__product-copy');
    const benefitNodes = [...section.querySelectorAll('[data-benefit-disc]')];
    const heroPalm = section.querySelector('.coconut-intro__hero-palm');
    const progressLabel = section.querySelector('[data-sequence-label]');
    const progressNumber = section.querySelector('[data-sequence-number]');
    const progressBar = section.querySelector('[data-sequence-bar]');
    // Slot of the can in the following "Keep sipping" section; the can hands over to it.
    const nextSlot = () => section.nextElementSibling?.querySelector('.flv__lead-can');

    const loader = new GLTFLoader();
    // The environment map is part of the coconut's look, so it is loaded together with the models:
    // the coconut first appears already lit instead of popping to new lighting a moment later.
    const envMap = new RGBELoader().loadAsync('/textures/empty_warehouse_01_1k.hdr').then((texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      scene.environmentIntensity = 0.4;
    }).catch(() => {});

    Promise.all([loader.loadAsync('/models/coconut.glb'), loader.loadAsync('/models/can1.glb'), new THREE.TextureLoader().loadAsync('/reference/coconut-can.webp'), envMap]).then(([coconutGltf, canGltf, canTexture]) => {
      coconutGltf.scene.traverse((object) => {
        if (object.name.startsWith('coconut_left')) left = object;
        if (object.name.startsWith('coconut_right')) right = object;
        if (object.name === 'milk') liquid = object;
        if (object.isMesh && object.material) object.material.envMapIntensity = 0.4;
      });
      can = canGltf.scene;
      can.traverse((object) => {
        if (!object.isMesh || !object.material) return;
        object.material.envMapIntensity = 0.4;
        if (object.name === 'Shell') {
          canTexture.colorSpace = THREE.SRGBColorSpace;
          canTexture.flipY = true;
          canTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
          object.material = object.material.clone();
          object.material.map = canTexture;
          object.material.needsUpdate = true;
        }
      });
      if (liquid?.material) {
        if (liquid.geometry) {
          liquid.geometry = mergeVertices(liquid.geometry.clone(), 1e-4);
          liquid.geometry.computeVertexNormals();
        }
        liquid.material = new THREE.MeshPhysicalMaterial({
          color: 0xf4fbf8, roughness: 0.035, transmission: 0.28, thickness: 0.16,
          ior: 1.333, clearcoat: 1, clearcoatRoughness: 0.018, envMapIntensity: 2.2,
          specularIntensity: 1, specularColor: new THREE.Color(0xffffff),
          sheen: .28, sheenColor: new THREE.Color(0xffffff), sheenRoughness: .18,
          transparent: true, opacity: 0.84, depthWrite: false, side: THREE.DoubleSide,
        });
        liquid.material.onBeforeCompile = (shader) => {
          liquidShader = shader;
          shader.uniforms.uWaterTime = { value: 0 };
          shader.uniforms.uWaterPointer = { value: new THREE.Vector2() };
          shader.vertexShader = shader.vertexShader
            .replace('#include <common>', '#include <common>\nuniform float uWaterTime;\nuniform vec2 uWaterPointer;')
            .replace('#include <begin_vertex>', `
              #include <begin_vertex>
              float waterWave = sin(position.x * 11.0 + uWaterTime * 1.7) * 0.006;
              waterWave += cos(position.z * 14.0 - uWaterTime * 1.35) * 0.005;
              float pointerWave = sin(length(position.xz - uWaterPointer * 0.42) * 34.0 - uWaterTime * 4.4) * 0.007;
              transformed.y += waterWave + pointerWave;
            `);
        };
        liquid.material.needsUpdate = true;
      }
      if (left && liquid) left.attach(liquid);

      // Re-centre the coconut so every turn pivots about its middle (the file's origin is off to one side).
      const root = coconutGltf.scene;
      inner.add(root);
      root.updateMatrixWorld(true);
      const bounds = new THREE.Box3();
      const toRoot = new THREE.Matrix4().copy(root.matrixWorld).invert();
      root.traverse((object) => {
        if (!object.isMesh || object === liquid) return;
        object.geometry.computeBoundingBox();
        bounds.union(object.geometry.boundingBox.clone().applyMatrix4(object.matrixWorld).applyMatrix4(toRoot));
      });
      root.position.copy(bounds.getCenter(new THREE.Vector3())).negate();

      // Poses. The coconut's long axis runs along local +x, from the water-filled lower shell (left)
      // to the top shell (right). Each pose turns the previous one the shortest way to a new axis
      // direction, so the coconut keeps its roll (where the "eye" sits) like the reference.
      const AXIS = new THREE.Vector3(1, 0, 0);
      const turnTo = (from, dir) => {
        const current = AXIS.clone().applyQuaternion(from);
        return new THREE.Quaternion().setFromUnitVectors(current, dir.clone().normalize()).multiply(from);
      };
      poses.hero = new THREE.Quaternion().setFromEuler(new THREE.Euler(deg(-9), 0, deg(6)))
        .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI, Math.PI, deg(-30))));
      poses.vertical = turnTo(poses.hero, new THREE.Vector3(-0.16, 1, 0.16));
      poses.bowl = turnTo(poses.vertical, new THREE.Vector3(0, 0.78, 0.62));
      poses.bowlTurn = turnTo(poses.bowl, new THREE.Vector3(-0.85, 0.42, 0.32));
      poses.whole = turnTo(poses.bowlTurn, new THREE.Vector3(-0.9, 0.42, 0.08));
      poses.horizontal = turnTo(poses.whole, new THREE.Vector3(-1, 0.02, 0.06));
      poses.splitDiag = turnTo(poses.horizontal, new THREE.Vector3(-0.62, 0.78, 0.04));
      poses.splitUp = turnTo(poses.splitDiag, new THREE.Vector3(-0.12, 1, 0.02));

      canRig.add(can);
      can.scale.setScalar(0.5);
      // Compile every shader and upload every texture now. Otherwise the can and the liquid
      // compile on the first frame they become visible, which shows up as a hitch mid-scroll.
      renderer.compile(scene, camera);
      renderer.initTexture(canTexture);
      canRig.visible = false;
      ready = true;
      introStartedAt = 0;
      section.classList.add('is-ready');
    }).catch(() => section.classList.add('is-fallback'));

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      // The pin is 100svh while the section is taller; measuring the pin (not innerHeight) keeps
      // progress from jumping when a mobile toolbar shows or hides.
      pinHeight = pin?.offsetHeight || innerHeight;
      pinWidth = pin?.offsetWidth || innerWidth;
      scrollSpan = Math.max(0.01, (section.offsetHeight - pinHeight) / pinHeight);
    };
    const getProgress = () => {
      const rect = section.getBoundingClientRect();
      return clamp(-rect.top / Math.max(1, rect.height - pinHeight));
    };

    // Screen point (0..1 of the pin) -> world position on the z = depth plane.
    const screenToWorld = (sx, sy, depth = 0, out = new THREE.Vector3()) => {
      const dist = camera.position.z - depth;
      const halfH = Math.tan(deg(camera.fov / 2)) * dist;
      return out.set((sx - 0.5) * 2 * halfH * camera.aspect, -(sy - 0.5) * 2 * halfH, depth);
    };
    const qa = new THREE.Quaternion();
    const shakeEuler = new THREE.Euler();
    const Y_UP = new THREE.Vector3(0, 1, 0);
    const CAN_LEAN = new THREE.Vector3(Math.sin(deg(6)), Math.cos(deg(6)), 0);
    // Piecewise pose: [[d, quaternion], ...] eased between neighbours.
    const poseAt = (keys, d, out) => {
      if (d <= keys[0][0]) return out.copy(keys[0][1]);
      for (let i = 1; i < keys.length; i += 1) {
        if (d <= keys[i][0]) {
          const t = smooth(range(d, keys[i - 1][0], keys[i][0]));
          return out.copy(keys[i - 1][1]).slerp(keys[i][1], t);
        }
      }
      return out.copy(keys[keys.length - 1][1]);
    };
    const valueAt = (keys, d) => {
      if (d <= keys[0][0]) return keys[0][1];
      for (let i = 1; i < keys.length; i += 1) {
        if (d <= keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], smooth(range(d, keys[i - 1][0], keys[i][0])));
      }
      return keys[keys.length - 1][1];
    };

    const sequenceAt = (d) => range(d, T.sequence[0], T.sequence[1]);

    // ---------- DOM layers ----------
    const setOverlayPose = (p) => {
      const d = p * scrollSpan;
      const vh = pinHeight;
      const vw = pinWidth;
      // Hero copy and the source copy travel with the scroll, like normal page content.
      if (hero) {
        const y = -d * vh;
        hero.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
        hero.style.visibility = y < -vh * 1.2 ? 'hidden' : '';
      }
      if (source) {
        const y = (T.sourceAnchor - d) * vh;
        source.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
        source.style.visibility = y > vh * 1.05 || y < -vh * 1.1 ? 'hidden' : '';
      }
      section.style.setProperty('--source-visibility', '1');

      // Benefit discs: enter from below and arc up past the bowl, alternating left and right.
      benefitNodes.forEach((node, index) => {
        const start = T.discs.start + index * T.discs.stagger;
        const t = range(d, start, start + T.discs.travel);
        if (t <= 0 || t >= 1) { node.style.opacity = '0'; return; }
        const leftSide = index % 2 === 0;
        const angle = leftSide ? deg(lerp(122, 250, t)) : deg(lerp(58, -70, t));
        const cx = leftSide ? 0.5 : 0.55;
        const rx = leftSide ? 0.27 : 0.32;
        const x = (cx + Math.cos(angle) * rx - 0.5) * vw;
        const y = (0.5 + Math.sin(angle) * 0.58 - 0.5) * vh;
        const spin = leftSide ? lerp(-62, -22, t) : lerp(56, 34, t);
        node.style.transform = `translate(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px)) rotate(${spin.toFixed(2)}deg)`;
        node.style.opacity = '1';
      });

      // Progress UI: fades in with the whole coconut, counts 000-100 over the sequence.
      const s = sequenceAt(d);
      const percent = Math.round(s * 100);
      const number = String(percent).padStart(3, '0');
      const label = s < 0.02 ? 'Whole coconut' : s < 0.36 ? 'Shaking' : s < 0.66 ? 'Cracked open' : 'Canned';
      if (progressNumber && progressNumber.textContent !== number) progressNumber.textContent = number;
      if (progressBar) progressBar.style.width = `${(s * 100).toFixed(2)}%`;
      if (progressLabel && progressLabel.textContent !== label) progressLabel.textContent = label;
      section.style.setProperty('--phase-one', clamp(s / 0.36).toFixed(3));
      section.style.setProperty('--phase-two', clamp((s - 0.36) / 0.3).toFixed(3));
      section.style.setProperty('--phase-three', clamp((s - 0.66) / 0.34).toFixed(3));
      const textOut = Math.max(0, d - T.textOut) * vh;
      if (sequenceUi) {
        sequenceUi.style.opacity = segment(d, T.ui[0], T.ui[1]).toFixed(3);
        sequenceUi.style.transform = `translate3d(0, ${(-textOut).toFixed(1)}px, 0)`;
      }
      // Product copy: title letters rise in as the can appears, the rest follows; then it scrolls away.
      section.style.setProperty('--title-in', segment(s, 0.34, 0.5).toFixed(4));
      section.style.setProperty('--copy-in', segment(s, 0.52, 0.66).toFixed(4));
      section.style.setProperty('--side-in', segment(s, 0.62, 0.76).toFixed(4));
      if (productCopy) {
        productCopy.style.transform = `translate3d(0, ${(-textOut).toFixed(1)}px, 0)`;
        productCopy.style.visibility = s <= 0.3 || textOut > vh * 1.2 ? 'hidden' : 'visible';
      }
      section.style.setProperty('--product-visibility', s > 0.3 ? '1' : '0');
    };

    // ---------- 3D ----------
    const pos = new THREE.Vector3();
    const axisWorld = new THREE.Vector3();
    const canUp = new THREE.Vector3(0, 1, 0);
    const setScrollPose = (p, seconds) => {
      if (!ready) return;
      const d = p * scrollSpan;
      const s = sequenceAt(d);
      const mobile = innerWidth <= 1025;
      const vh = pinHeight;

      // Whole-coconut orientation through the sequence.
      const sOrient = [
        [T.vertical[0], poses.hero],
        [T.vertical[1], poses.vertical],
        [T.bowl[0] + 0.12, poses.vertical],
        [T.bowl[1], poses.bowl],
        [T.bowlTurn[0], poses.bowl],
        [T.bowlTurn[1], poses.bowlTurn],
        [T.capIn[1], poses.whole],
        [T.horizontal[1], poses.horizontal],
        [T.sequence[0] + 0.28 * 1.8, poses.horizontal],
        [T.sequence[0] + 0.4 * 1.8, poses.splitDiag],
        [T.sequence[0] + 0.58 * 1.8, poses.splitUp],
      ];
      poseAt(sOrient, d, model.quaternion);

      // Screen placement of the coconut's centre (fractions of the pin).
      const sx = 0.5;
      const sy = valueAt([
        [0, 0.5], [T.vertical[1], 0.41], [T.bowl[0], 0.41], [T.bowl[1], 0.47],
        [T.bowlTurn[0], 0.47], [T.capIn[1], 0.5],
      ], d);
      screenToWorld(sx, sy, 0, pos);
      // Shaking while the shell cracks (low frequency so it reads as a shake, not as flicker).
      const shake = segment(s, 0.05, 0.1) * (1 - segment(s, 0.24, 0.3));
      pos.x += Math.sin(seconds * 31) * 0.022 * shake;
      pos.y += Math.cos(seconds * 27) * 0.016 * shake;
      model.position.copy(pos);
      // The bowl is shown closer (the reference frames it larger than the whole coconut).
      const zoom = mobile ? 1.08 : 1.3;
      model.scale.multiplyScalar(valueAt([[T.bowl[0], 1], [T.bowl[1], zoom], [T.bowlTurn[0], zoom], [T.capIn[1], 1]], d));
      if (shake) model.quaternion.multiply(qa.setFromEuler(shakeEuler.set(0, 0, Math.sin(seconds * 35) * 0.025 * shake)));

      // Shell separation along the long axis (local units; 0.1 is roughly a third of the screen).
      const capOpen = smoother(range(d, T.capOff[0], T.capOff[1]));
      const capReturn = 1 - smoother(range(d, T.capIn[0], T.capIn[1]));
      const crack = valueAt([[0, 0], [0.05, 0], [0.2, 0.0018], [0.28, 0.007], [0.37, 0.05], [0.47, 0.12], [0.6, 0.2], [0.72, 0.5]].map(([k, v]) => [T.sequence[0] + k * 1.8, v]), d);
      const capGone = d < T.capIn[0] ? capOpen : capReturn;
      const capDistance = Math.max(capGone * 0.55, crack);
      const bowlDistance = crack * 0.92;
      right.position.set(capDistance, capGone * 0.06, 0);
      left.position.set(-bowlDistance, 0, 0);
      // The top shell lifts off with a slight tip (as on the reference) and comes back in tilted.
      right.rotation.set(0, 0, capGone * deg(d < T.capIn[0] ? 16 : -22) + segment(s, 0.28, 0.6) * deg(28));
      left.rotation.set(0, 0, segment(s, 0.28, 0.6) * deg(-24));
      right.visible = capDistance < 0.5;
      left.visible = bowlDistance < 0.45;
      liquid.visible = d < T.capIn[1] + 0.3;

      // The can grows out from between the shells along the coconut's axis, then stands upright.
      const canIn = segment(s, 0.27, 0.45);
      canRig.visible = canIn > 0.001;
      if (canRig.visible) {
        axisWorld.set(1, 0, 0).applyQuaternion(model.quaternion);
        const upright = segment(s, 0.5, 0.7);
        canUp.copy(axisWorld).lerp(CAN_LEAN, upright).normalize();
        canRig.quaternion.setFromUnitVectors(Y_UP, canUp);
        const spin = Math.max(0, d - T.canSpin) * Math.PI / 0.75;
        can.rotation.set(0, CAN_FRONT + spin, 0);
        const size = (mobile ? 0.42 : 0.58) * lerp(0.62, 1, canIn);
        can.scale.setScalar(size);
        // Stay at the centre of the stage until the "Keep sipping" slot arrives, then ride with it.
        let canY = lerp(sy, 0.47, upright);
        const slot = nextSlot();
        if (slot && d > T.end - 0.2) {
          const r = slot.getBoundingClientRect();
          const pinTop = pin.getBoundingClientRect().top;
          const slotY = (r.top + r.height / 2 - pinTop) / vh;
          canY = Math.min(canY, slotY);
        }
        screenToWorld(0.5, canY, 0, canRig.position);
      }
      section.classList.toggle('is-product', s > 0.5);
    };

    // DOM overlays and the 3D scene are driven from the same damped value in the same frame,
    // so text, discs and the coconut can never drift out of step with each other.
    const applyProgress = (p) => {
      if (Math.abs(p - lastProgressWritten) < 0.00002) return;
      lastProgressWritten = p;
      section.style.setProperty('--sequence-progress', p.toFixed(5));
      setOverlayPose(p);
    };
    const onScroll = () => {
      targetProgress = getProgress();
      if (!running) start();
    };
    let running = false;
    const start = () => {
      if (running) return;
      running = true;
      lastFrameAt = 0;
      raf = requestAnimationFrame(render);
    };
    const onPointerMove = (event) => {
      pointer.x = (event.clientX / innerWidth - 0.5) * 2;
      pointer.y = (event.clientY / innerHeight - 0.5) * 2;
      heroPalm?.style.setProperty('--palm-x', `${pointer.x * 13}px`);
      heroPalm?.style.setProperty('--palm-y', `${pointer.y * 9}px`);
    };

    const render = (now) => {
      const seconds = now / 1000;
      const dt = lastFrameAt ? Math.min(0.1, (now - lastFrameAt) / 1000) : 1 / 60;
      lastFrameAt = now;

      targetProgress = getProgress();
      if (reduced) scrollProgress = targetProgress;
      else {
        scrollProgress = damp(scrollProgress, targetProgress, SCROLL_DAMPING, dt);
        if (Math.abs(targetProgress - scrollProgress) < 0.00005) scrollProgress = targetProgress;
      }
      applyProgress(scrollProgress);

      // The drop-in plays once the loader has lifted, together with the hero copy.
      if (ready && !introStartedAt && loadedRef.current) introStartedAt = now;
      if (ready && introStartedAt) {
        const introTime = clamp((now - introStartedAt) / 1900);
        const introEase = 1 - (1 - introTime) ** 4;
        const introBounce = introTime < 1 ? Math.sin(introTime * Math.PI * 3) * (1 - introTime) * .13 : 0;
        const baseScale = innerWidth <= 1025 ? 7 : 12;
        model.scale.setScalar(baseScale * lerp(.48, 1, backOut(introTime)));
        pointer.cx = damp(pointer.cx, pointer.x, POINTER_DAMPING, dt);
        pointer.cy = damp(pointer.cy, pointer.y, POINTER_DAMPING, dt);
        pointerTilt.position.y = lerp(2.7, 0, introEase) + introBounce;
        pointerTilt.rotation.x = -pointer.cy * deg(15) * 0.5 + lerp(-.36, 0, introEase);
        pointerTilt.rotation.y = pointer.cx * deg(15) * 0.5 + lerp(-Math.PI * 1.18, 0, introEase);
        pointerTilt.rotation.z = lerp(.28, 0, introEase);
        setScrollPose(reduced ? Math.round(scrollProgress * 8) / 8 : scrollProgress, seconds);
        if (liquid?.visible) {
          liquid.rotation.x = Math.sin(seconds * 1.7) * 0.016 - pointer.cy * .035;
          liquid.rotation.z = Math.cos(seconds * 1.3) * 0.014 + pointer.cx * .035;
          if (liquidShader) {
            liquidShader.uniforms.uWaterTime.value = seconds;
            liquidShader.uniforms.uWaterPointer.value.set(pointer.cx, pointer.cy);
          }
        }
      }
      if (!ready || introStartedAt) renderer.render(scene, camera);
      // Keep drawing while the section is on screen; once it is off screen, stop as soon as the
      // sequence has caught up with the scrollbar so the rest of the page gets the whole frame budget.
      if (inView || scrollProgress !== targetProgress) raf = requestAnimationFrame(render);
      else running = false;
    };

    resize();
    targetProgress = getProgress();
    scrollProgress = targetProgress;
    applyProgress(scrollProgress);
    const visibility = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) {
        // Coming back after the section was off screen: start from where the scrollbar is.
        if (!running) { targetProgress = getProgress(); scrollProgress = targetProgress; }
        start();
      }
    }, { rootMargin: '25% 0px' });
    visibility.observe(section);
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    start();
    return () => {
      visibility.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
      scene.traverse((object) => {
        object.geometry?.dispose();
        if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => {
          material.map?.dispose();
          material.dispose();
        });
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <section ref={sectionRef} id="coconut-sequence" className="coconut-intro" aria-label="Coconut animation">
      <div className="coconut-intro__pin">
        <div className="coconut-intro__hero" aria-hidden="true">
          <h1 className="display">Paradise in<br />every sip.</h1>
          <ul className="coconut-intro__hero-notes"><li>Rich In Electrolytes</li><li>No Added Sugar</li></ul>
          <div className="coconut-intro__hero-copy"><p>Quench your thirst with pure coconut bliss, packed with natural electrolytes and zero added sugar, for a cool sip every time.</p><a href="/flavours">Discover Flavors</a></div>
          <img className="coconut-intro__hero-arrow" src="/reference/curve-arrow.svg" alt="" />
          <img className="coconut-intro__hero-palm" src="/palm-mark.svg" alt="" />
        </div>
        <div className="coconut-intro__source" aria-hidden="true">
          <h2><span>The real</span><span>Source of</span><span>every Sip.</span></h2>
          <p>For centuries, coconuts have carried their own perfectly balanced source of refreshment.</p>
          <img src="/reference/source-wave.svg" alt="" />
        </div>
        <div className="coconut-intro__benefits" aria-hidden="true">
          <div data-benefit-disc className="benefit-disc is-light"><strong>500<span>MG</span></strong><small>Of Potassium</small></div>
          <div data-benefit-disc className="benefit-disc is-dark"><strong>100%</strong><small>Natural Hydration</small></div>
          <div data-benefit-disc className="benefit-disc is-dark"><strong>0<span>GM</span></strong><small>Of Sugar</small></div>
          <div data-benefit-disc className="benefit-disc is-light"><strong>45<span>KCL</span></strong><small>Per 200Ml</small></div>
        </div>
        <div className="coconut-intro__sequence-ui" aria-hidden="true">
          <div className="coconut-intro__progress">
            <div><span data-sequence-label>Whole coconut</span><span data-sequence-number>000</span></div>
            <i><b data-sequence-bar /></i>
            <ol><li>Whole coconut</li><li>Cracked open</li><li>Canned</li></ol>
          </div>
        </div>
        <div className="coconut-intro__product-copy" aria-hidden="true">
          <div><h2 aria-label="Coconut">{'Coconut'.split('').map((letter, i) => <span key={i} style={{ '--i': i }}>{letter}</span>)}</h2><p>One green coconut, opened and pressed within a day of harvest. 100% raw, with 500mg of potassium.</p></div>
          <div><p>Six flavours, each one pressed with real fruit. Mango, lychee, guava and three more worth meeting.</p><a href="/flavours">Explore Flavors</a></div>
        </div>
        <div ref={canvasRef} className="coconut-intro__canvas" aria-hidden="true">
          <img src="/src/assets/coconuts/whole.svg" className="coconut-intro__fallback" alt="" />
        </div>
      </div>
    </section>
  );
}
