/*
 * "My Techstack" — labelled balls that drop in, huddle toward the centre,
 * collide with each other and get pushed around by the cursor.
 */
import * as THREE from 'three';
import type { Tech } from '@/content/types';
import { disposeObject } from './dispose';

THREE.ColorManagement.legacyMode = false;

const BALLS_PER_TECH = 2;
const CENTER_PULL = 1.8;
const DEPTH_PULL = 4;
const DRAG = 1.6;
const RESTITUTION = 0.35;
const POINTER_RADIUS = 2.4;
const POINTER_FORCE = 70;
const SUBSTEPS = 2;
const MAX_DT = 1 / 30;
const VISIBLE_THRESHOLD = 0.15;

interface Ball {
  mesh: THREE.Mesh;
  baseRadius: number;
  radius: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
}

export interface TechstackScene {
  dispose(): void;
}

function labelTexture(tech: Tech, fontFamily: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = tech.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = tech.text;
    ctx.font = `700 44px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Draw the label on both sides so it shows up whichever way the ball spins.
    [128, 384].forEach((x) => ctx.fillText(tech.label, x, 128, 150));
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  texture.anisotropy = 4;
  return texture;
}

function createBalls(scene: THREE.Scene, techs: readonly Tech[], fontFamily: string): Ball[] {
  const geometry = new THREE.SphereGeometry(1, 40, 28);
  return techs.flatMap((tech) => {
    const material = new THREE.MeshStandardMaterial({ map: labelTexture(tech, fontFamily), roughness: 0.35, metalness: 0.05 });
    return Array.from({ length: BALLS_PER_TECH }, () => {
      const mesh = new THREE.Mesh(geometry, material);
      const baseRadius = 0.75 + Math.random() * 0.55;
      mesh.rotation.set(Math.random() * 0.6, Math.random() * Math.PI * 2, 0);
      scene.add(mesh);
      return { mesh, baseRadius, radius: baseRadius, pos: new THREE.Vector3(), vel: new THREE.Vector3() };
    });
  });
}

/** Pushes two overlapping balls apart and exchanges momentum along the contact normal (mutates both). */
function collide(a: Ball, b: Ball, normal: THREE.Vector3, scratch: THREE.Vector3) {
  normal.subVectors(b.pos, a.pos);
  const dist = normal.length();
  const minDist = a.radius + b.radius;
  if (dist >= minDist || dist < 1e-6) return;
  normal.divideScalar(dist);
  const push = (minDist - dist) / 2;
  a.pos.addScaledVector(normal, -push);
  b.pos.addScaledVector(normal, push);
  const approach = scratch.subVectors(b.vel, a.vel).dot(normal);
  if (approach < 0) {
    const impulse = (approach * (1 + RESTITUTION)) / 2;
    a.vel.addScaledVector(normal, impulse);
    b.vel.addScaledVector(normal, -impulse);
  }
}

function createRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer | null {
  try {
    return new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (error) {
    console.warn('WebGL unavailable, skipping techstack balls.', error);
    return null;
  }
}

/**
 * The physics runs only while the canvas is on screen. `fontFamily` is the
 * resolved CSS font stack, so the labels use the page's web font.
 * Returns null when WebGL is unavailable.
 */
export function createTechstackScene(
  canvas: HTMLCanvasElement,
  techs: readonly Tech[],
  fontFamily: string,
): TechstackScene | null {
  const maybeRenderer = createRenderer(canvas);
  if (!maybeRenderer) return null;
  const renderer = maybeRenderer; // non-null binding the hoisted helpers below can rely on
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 20);
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(5, 8, 10);
  const purple = new THREE.PointLight(0xa855f7, 1.6, 45);
  purple.position.set(-8, -5, 8);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a1b4a, 0.85), key, purple);

  const balls = createBalls(scene, techs, fontFamily);
  const pointer = { world: new THREE.Vector3(), active: false };
  const scratch = { a: new THREE.Vector3(), normal: new THREE.Vector3(), axis: new THREE.Vector3(), q: new THREE.Quaternion() };
  let sizeScale = 1;

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const viewHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    sizeScale = Math.min(1, (viewHeight * camera.aspect) / 16);
    balls.forEach((b) => {
      b.radius = b.baseRadius * sizeScale;
      b.mesh.scale.setScalar(b.radius);
    });
  }

  function drop() {
    balls.forEach((b) => {
      b.pos.set((Math.random() - 0.5) * 10 * sizeScale, 9 + Math.random() * 14, (Math.random() - 0.5) * 2);
      b.vel.set(0, -Math.random() * 4, 0);
    });
  }

  function integrate(b: Ball, dt: number) {
    const pull = scratch.a.copy(b.pos).multiplyScalar(-CENTER_PULL);
    pull.z *= DEPTH_PULL;
    b.vel.addScaledVector(pull, dt);
    if (pointer.active) {
      const away = scratch.normal.subVectors(b.pos, pointer.world).setZ(0);
      const dist = away.length();
      const reach = POINTER_RADIUS * sizeScale + b.radius;
      if (dist < reach && dist > 1e-4) {
        b.vel.addScaledVector(away.divideScalar(dist), (1 - dist / reach) * POINTER_FORCE * dt);
      }
    }
    b.vel.multiplyScalar(Math.exp(-DRAG * dt));
    b.pos.addScaledVector(b.vel, dt);
  }

  function step(dt: number) {
    balls.forEach((b) => integrate(b, dt));
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) collide(balls[i]!, balls[j]!, scratch.normal, scratch.a);
    }
    balls.forEach((b) => {
      b.mesh.position.copy(b.pos);
      const speed = Math.hypot(b.vel.x, b.vel.y);
      if (speed < 1e-3) return;
      scratch.axis.set(-b.vel.y, b.vel.x, 0).divideScalar(speed);
      scratch.q.setFromAxisAngle(scratch.axis, (speed * dt) / b.radius);
      b.mesh.quaternion.premultiply(scratch.q);
    });
  }

  let running = false;
  let dropped = false;
  let frameId = 0;
  let last = 0;

  function frame(now: number) {
    frameId = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, MAX_DT);
    last = now;
    for (let i = 0; i < SUBSTEPS; i++) step(dt / SUBSTEPS);
    renderer.render(scene, camera);
  }

  function setRunning(visible: boolean) {
    if (visible && !running) {
      if (!dropped) {
        drop();
        dropped = true;
      }
      running = true;
      last = performance.now();
      frameId = requestAnimationFrame(frame);
    } else if (!visible && running) {
      cancelAnimationFrame(frameId);
      running = false;
    }
  }

  function updatePointer(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    const ray = new THREE.Vector3(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
      0.5
    ).unproject(camera);
    ray.sub(camera.position).normalize();
    pointer.world.copy(camera.position).addScaledVector(ray, -camera.position.z / ray.z);
    pointer.active = true;
  }

  const onPointerLeave = () => {
    pointer.active = false;
  };
  canvas.addEventListener('pointermove', updatePointer);
  canvas.addEventListener('pointerdown', updatePointer);
  canvas.addEventListener('pointerleave', onPointerLeave);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const visibilityObserver = new IntersectionObserver(
    ([entry]) => setRunning(Boolean(entry?.isIntersecting)),
    { threshold: VISIBLE_THRESHOLD },
  );
  visibilityObserver.observe(canvas);
  resize();

  return {
    dispose() {
      setRunning(false);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      canvas.removeEventListener('pointermove', updatePointer);
      canvas.removeEventListener('pointerdown', updatePointer);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      disposeObject(scene);
      renderer.dispose();
    },
  };
}
